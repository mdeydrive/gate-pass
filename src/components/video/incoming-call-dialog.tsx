
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
          } else if (incomingCall && (!callData || callData.user1.id !== incomingCall.user1.id)) {
            // If the current incoming call is no longer valid (e.g., cancelled), close the dialog
            setIncomingCall(null);
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
        // Store the offer in sessionStorage so the conference page can pick it up
        sessionStorage.setItem('webrtc_offer', JSON.stringify(incomingCall.offer));

        // Note: The actual peer connection creation and answer is now handled
        // by the video-conference page itself to ensure media stream is ready.
        
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
