
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import type { ApprovingAuthority } from '@/lib/data';
import UserList from '@/components/video/user-list';
import { useAuth } from '@/contexts/auth-context';

// Basic WebRTC configuration
const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
};

export default function VideoConferencePage() {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pc = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);

  const [hasMediaPermission, setHasMediaPermission] = useState<boolean | null>(null);
  const { toast } = useToast();
  const [inCall, setInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ApprovingAuthority | null>(null);
  const { user: currentUser } = useAuth();
  
  const handleEndCall = useCallback(async (showToast = true) => {
    if (pc.current) {
        pc.current.close();
        pc.current = null;
    }
    
    if (localStream.current) {
        localStream.current.getTracks().forEach(track => track.stop());
        localStream.current = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    if (inCall) {
        try {
            await fetch('/api/call-signal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'end' }),
            });
      
            if (showToast) {
              toast({
                  title: "Call Ended",
                  description: "The video call has been disconnected.",
              });
            }
        } catch (e) {
            console.error("Failed to end call signal", e);
        }
    }

    setInCall(false);
    setSelectedUser(null);
    sessionStorage.removeItem('webrtc_offer');
    sessionStorage.removeItem('webrtc_caller');
  }, [toast, inCall]);

  const handleStartCall = async (userToCall: ApprovingAuthority) => {
    if (!currentUser || !pc.current || !localStream.current) {
        toast({ variant: 'destructive', title: 'Error', description: 'Webcam not ready. Please grant permissions.' });
        return;
    }

    setSelectedUser(userToCall);
    setInCall(true);

    pc.current.onicecandidate = async (event) => {
        if (event.candidate) {
            await fetch('/api/call-signal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'add-candidate', candidate: event.candidate.toJSON() }),
            });
        }
    };
    
    const offerDescription = await pc.current.createOffer();
    await pc.current.setLocalDescription(offerDescription);

    const callData = {
      user1: { id: currentUser.id, name: currentUser.username, avatar: (currentUser as any).avatar },
      user2: { id: userToCall.id, name: userToCall.name, avatar: userToCall.avatar },
    };

    try {
      await fetch('/api/call-signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'initiate', call: callData, offer: offerDescription }),
      });

      toast({
        title: `Calling ${userToCall.name}...`,
        description: "Waiting for the user to accept.",
      });

    } catch (error) {
      console.error("Failed to initiate call signal", error);
      toast({ variant: "destructive", title: "Call Failed", description: "Could not initiate the call." });
      handleEndCall(false);
    }
  }
  
  useEffect(() => {
    const setupMediaAndConnection = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setHasMediaPermission(true);
        localStream.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        pc.current = new RTCPeerConnection(servers);

        localStream.current.getTracks().forEach(track => {
            pc.current?.addTrack(track, localStream.current!);
        });

        pc.current.ontrack = (event) => {
            if (remoteVideoRef.current && event.streams[0]) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };

        const offerString = sessionStorage.getItem('webrtc_offer');
        const callerString = sessionStorage.getItem('webrtc_caller');

        if (offerString && callerString && pc.current) {
            const offer = JSON.parse(offerString);
            const caller = JSON.parse(callerString);
            setSelectedUser(caller);
            setInCall(true);

            pc.current.onicecandidate = async (event) => {
              if (event.candidate) {
                  await fetch('/api/call-signal', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ action: 'add-candidate', candidate: event.candidate.toJSON() }),
                  });
              }
            };
            
            await pc.current.setRemoteDescription(new RTCSessionDescription(offer));
            const answerDescription = await pc.current.createAnswer();
            await pc.current.setLocalDescription(answerDescription);

            await fetch('/api/call-signal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'accept', answer: answerDescription }),
            });
            sessionStorage.removeItem('webrtc_offer');
            sessionStorage.removeItem('webrtc_caller');
        }

      } catch (error) {
        console.error('Error accessing media or setting up connection:', error);
        setHasMediaPermission(false);
        toast({
          variant: 'destructive',
          title: 'Media Access Denied',
          description: 'Please enable camera and microphone permissions in your browser settings.',
        });
      }
    };
    
    setupMediaAndConnection();

    const pollInterval = setInterval(async () => {
      if (!pc.current || !currentUser) return;
      
      try {
        const response = await fetch('/api/call-signal');
        if (!response.ok) return;

        const { call } = await response.json();
        
        if (call?.answer && pc.current.signalingState !== 'stable') {
            const answerDescription = new RTCSessionDescription(call.answer);
            await pc.current.setRemoteDescription(answerDescription);
        }

        if (call?.candidates && call.candidates.length > 0) {
            const candidates = call.candidates.map((c: any) => new RTCIceCandidate(c));
            candidates.forEach((candidate: RTCIceCandidate) => {
                pc.current!.addIceCandidate(candidate).catch(e => console.error("Error adding ICE candidate", e));
            });
            // Clear candidates after adding them
            await fetch('/api/call-signal', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'clear-candidates' }),
            });
        }
        
        if (!call && inCall) {
          handleEndCall();
        }
      } catch (e) {
        console.error("Polling error:", e);
      }
    }, 2000);

    // Cleanup function
    return () => {
      clearInterval(pollInterval);
      handleEndCall(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const toggleMute = () => {
    if (localStream.current) {
      localStream.current.getAudioTracks().forEach(track => track.enabled = !track.enabled);
      setIsMuted(!isMuted);
    }
  }

  const toggleVideo = () => {
    if (localStream.current) {
      localStream.current.getVideoTracks().forEach(track => track.enabled = !track.enabled);
      setIsVideoOff(!isVideoOff);
    }
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Video Conference</CardTitle>
            <CardDescription>
              {inCall ? `In call with ${selectedUser?.name || 'user'}` : "Select a user to start a video call."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Remote Video */}
              <div className="w-full aspect-video rounded-md border bg-muted overflow-hidden relative flex items-center justify-center">
                <video ref={remoteVideoRef} className="w-full h-full object-cover" autoPlay playsInline />
                {!inCall && <div className="absolute text-muted-foreground">Remote user video</div>}
              </div>
              {/* Local Video */}
              <div className="w-full aspect-video rounded-md border bg-muted overflow-hidden relative">
                <video ref={localVideoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
              </div>
            </div>
            {hasMediaPermission === false && (
              <Alert variant="destructive">
                <AlertTitle>Media Access Required</AlertTitle>
                <AlertDescription>
                  Please allow camera and microphone access in your browser settings to use this feature.
                </AlertDescription>
              </Alert>
            )}
            {inCall && (
              <div className="flex justify-center items-center gap-4 pt-4">
                <Button variant={isMuted ? "secondary" : "outline"} size="icon" className="rounded-full h-12 w-12" onClick={toggleMute}>
                  {isMuted ? <MicOff /> : <Mic />}
                  <span className="sr-only">Toggle Mute</span>
                </Button>
                <Button variant={isVideoOff ? "secondary" : "outline"} size="icon" className="rounded-full h-12 w-12" onClick={toggleVideo}>
                  {isVideoOff ? <VideoOff /> : <Video />}
                  <span className="sr-only">Toggle Video</span>
                </Button>
                <Button variant="destructive" size="icon" className="rounded-full h-14 w-14" onClick={() => handleEndCall()}>
                  <PhoneOff />
                  <span className="sr-only">End Call</span>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-1">
        {!inCall ? (
          <UserList onSelectUser={handleStartCall} selectedUser={selectedUser} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Call In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">You are currently in a call. End the call to see the user list.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

    