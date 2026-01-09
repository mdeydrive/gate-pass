
'use client';

import { useState, useEffect, useCallback } from 'react';
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
          
          // A new call is ringing for me, and I'm not already looking at a call dialog
          if (
            callData &&
            callData.status === 'ringing' &&
            callData.user2.id === user.id &&
            !incomingCall
          ) {
            setIncomingCall(callData);
          } 
          // I have a dialog open, but the call was cancelled or answered by another device
          else if (
            incomingCall && 
            (!callData || callData.user1.id !== incomingCall.user1.id || callData.status !== 'ringing')
          ) {
             setIncomingCall(null);
          }
        }
      } catch (e) {
        // Silently ignore polling errors
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

  const handleDeclineCall = useCallback(async () => {
    try {
        // Only the person being called should be able to end the 'ringing' state.
        if (incomingCall) {
             await fetch('/api/call-signal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'end' }),
            });
        }
    } catch(e) {
        console.error("Failed to decline call", e);
    } finally {
        setIncomingCall(null);
    }
  }, [incomingCall]);

  if (!incomingCall) {
    return null;
  }

  return (
    <Dialog open={!!incomingCall} onOpenChange={(open) => {
        if (!open) {
            handleDeclineCall();
        }
    }}>
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

    