
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
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import type { ApprovingAuthority } from '@/lib/data';
import UserList from '@/components/video/user-list';
import { useRole } from '@/contexts/role-context';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';

export default function VideoConferencePage() {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const { toast } = useToast();
  const [inCall, setInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ApprovingAuthority | null>(null);
  const { role } = useRole();
  const { user: currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    let stream: MediaStream | null = null;
    const getCameraPermission = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setHasCameraPermission(true);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Media Access Denied',
          description: 'Please enable camera and microphone permissions in your browser settings.',
        });
      }
    };

    getCameraPermission();

    // Check for an active call via API
    const checkActiveCall = async () => {
        try {
            const response = await fetch('/api/call-signal');
            const callData = await response.json();
            if (callData.call) {
                if(callData.call.user2.id === currentUser?.id){
                    setSelectedUser(callData.call.user1);
                    setInCall(true);
                } else if (callData.call.user1.id === currentUser?.id) {
                    setSelectedUser(callData.call.user2);
                    setInCall(true);
                }
            }
        } catch(e) {
            console.error(e);
        }
    };

    checkActiveCall();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    }
  }, [toast, currentUser?.id]);

  const handleStartCall = async (userToCall: ApprovingAuthority) => {
    if (!currentUser) return;
    
    setSelectedUser(userToCall);
    
    const callData = {
        user1: { id: currentUser.id, name: currentUser.username, avatar: (currentUser as any).avatar },
        user2: { id: userToCall.id, name: userToCall.name, avatar: userToCall.avatar }
    };
    
    try {
        await fetch('/api/call-signal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'initiate', call: callData }),
        });

        toast({
            title: `Calling ${userToCall.name}...`,
            description: "Waiting for the user to accept. This is a UI demonstration.",
        });

        // Poll for acceptance
        const interval = setInterval(async () => {
            const res = await fetch('/api/call-signal');
            const data = await res.json();
            if (data.call && data.call.status === 'active') {
                clearInterval(interval);
                setInCall(true);
                toast({
                    title: "Call Accepted",
                    description: `Connected with ${userToCall.name}.`
                });
            } else if (!data.call) { // Call was rejected or cancelled
                clearInterval(interval);
                setSelectedUser(null);
            }
        }, 2000);

    } catch (error) {
        console.error("Failed to initiate call signal", error);
        toast({
            variant: "destructive",
            title: "Call Failed",
            description: "Could not initiate the call. Please try again."
        });
        setSelectedUser(null);
    }
  }

  const handleEndCall = async () => {
    setInCall(false);
    setSelectedUser(null);
    
    try {
        await fetch('/api/call-signal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'end' }),
        });

        toast({
            title: "Call Ended",
            description: "The video call has been disconnected.",
        });
    } catch(e) {
        console.error("Failed to end call signal", e);
    }

    if(role !== 'Admin' && role !== 'Security'){
        router.push('/dashboard');
    }
  }
  
  if (role !== 'Admin' && role !== 'Security' && !inCall) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You do not have permission to view this page.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Only Security and Admin roles can initiate calls from this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }


  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Video Conference</CardTitle>
            <CardDescription>
              {inCall ? `In call with ${selectedUser?.name}` : "Select a user to start a video call."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Remote Video */}
                <div className="w-full aspect-video rounded-md border bg-muted overflow-hidden relative flex items-center justify-center">
                    <video ref={remoteVideoRef} className="w-full h-full object-cover" autoPlay />
                    {!inCall && <div className="absolute text-muted-foreground">Remote user video</div>}
                </div>
                {/* Local Video */}
                <div className="w-full aspect-video rounded-md border bg-muted overflow-hidden relative">
                    <video ref={localVideoRef} className="w-full h-full object-cover" autoPlay muted />
                </div>
            </div>
             {hasCameraPermission === false && (
                <Alert variant="destructive">
                  <AlertTitle>Camera Access Required</AlertTitle>
                  <AlertDescription>
                    Please allow camera access in your browser settings to use this feature. The application needs permission to display your video.
                  </AlertDescription>
                </Alert>
            )}
            {inCall && (
                <div className="flex justify-center items-center gap-4 pt-4">
                    <Button variant={isMuted ? "secondary" : "outline"} size="icon" className="rounded-full h-12 w-12" onClick={() => setIsMuted(!isMuted)}>
                       {isMuted ? <MicOff /> : <Mic />}
                       <span className="sr-only">Toggle Mute</span>
                    </Button>
                    <Button variant={isVideoOff ? "secondary" : "outline"} size="icon" className="rounded-full h-12 w-12" onClick={() => setIsVideoOff(!isVideoOff)}>
                       {isVideoOff ? <VideoOff /> : <Video />}
                        <span className="sr-only">Toggle Video</span>
                    </Button>
                    <Button variant="destructive" size="icon" className="rounded-full h-14 w-14" onClick={handleEndCall}>
                        <PhoneOff />
                        <span className="sr-only">End Call</span>
                    </Button>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-1">
        {(role === 'Admin' || role === 'Security') && !inCall ? (
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
