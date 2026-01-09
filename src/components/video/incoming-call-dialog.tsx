
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/auth-context';
import { Phone, PhoneOff } from 'lucide-react';

type CallUser = {
  id: string;
  name: string;
  avatar: string;
};

type CallData = {
  user1: CallUser; // Caller
  user2: CallUser; // Callee
  status: 'ringing' | 'active';
  offer?: any;
};

const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
};

export default function IncomingCallDialog() {
  const [incomingCall, setIncomingCall] = useState<CallData | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    const pollForCall = async () => {
      try {
        const response = await fetch('/api/call-signal');
        if (response.ok) {
          const data = await response.json();
          const callData: CallData | null = data.call;

          if (callData && callData.user2.id === user.id && callData.status === 'ringing') {
            setIncomingCall(callData);
          } else {
            if (incomingCall && (!callData || callData.user2.id !== user.id)) {
                 setIncomingCall(null);
            }
          }
        }
      } catch (e) {
        // console.error('Failed to poll for call signal:', e);
      }
    };

    const intervalId = setInterval(pollForCall, 2000); // Poll every 2 seconds

    return () => {
      clearInterval(intervalId);
    };
  }, [user, incomingCall]);

  const handleAcceptCall = async () => {
    if (incomingCall?.offer) {
        const pc = new RTCPeerConnection(servers);
        
        // This is a temporary solution to get the stream and pass it to the page.
        // A better solution would use a global state management for WebRTC.
        sessionStorage.setItem('webrtc_offer', JSON.stringify(incomingCall.offer));

        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
        
        const answerDescription = await pc.createAnswer();
        await pc.setLocalDescription(answerDescription);

        const answer = {
          type: answerDescription.type,
          sdp: answerDescription.sdp,
        };

        await fetch('/api/call-signal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'accept', call: incomingCall, answer }),
        });
        
        // This is also temporary, to signal candidates from the callee
        pc.onicecandidate = event => {
            if(event.candidate) {
                fetch('/api/call-signal', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'add-candidate', candidate: event.candidate.toJSON() }),
                });
            }
        };

        setIncomingCall(null);
        router.push('/video-conference');
    }
  };

  const handleDeclineCall = async () => {
    try {
        await fetch('/api/call-signal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'end' }),
        });
        setIncomingCall(null);
    } catch(e) {
        console.error("Failed to decline call", e);
    }
  };

  if (!incomingCall) {
    return null;
  }

  return (
    <Dialog open={!!incomingCall} onOpenChange={(open) => !open && handleDeclineCall()}>
      <DialogContent>
        <DialogHeader className="items-center text-center">
          <Avatar className="h-20 w-20 mb-4">
            <AvatarImage src={incomingCall.user1.avatar || `https://avatar.vercel.sh/${incomingCall.user1.name}.png`} />
            <AvatarFallback>{incomingCall.user1.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <DialogTitle className="text-2xl">Incoming Call</DialogTitle>
          <DialogDescription>
            {incomingCall.user1.name} is calling you.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center pt-4">
          <Button variant="destructive" size="lg" onClick={handleDeclineCall} className="rounded-full">
            <PhoneOff className="mr-2" />
            Decline
          </Button>
          <Button variant="success" size="lg" onClick={handleAcceptCall} className="rounded-full">
            <Phone className="mr-2" />
            Accept
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
