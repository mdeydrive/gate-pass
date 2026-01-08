
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

type CallData = {
  user1: { id: string; name: string };
  user2: { id: string; name: string };
};

export default function IncomingCallDialog() {
  const [incomingCall, setIncomingCall] = useState<CallData | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleStorageChange = () => {
      const callDataString = localStorage.getItem('incomingCall');
      if (callDataString) {
        try {
          const callData: CallData = JSON.parse(callDataString);
          if (callData.user2.id === user?.id) {
            setIncomingCall(callData);
          }
        } catch (e) {
          console.error('Failed to parse incoming call data:', e);
        }
      } else {
        // If the item is removed, it means the call was cancelled or ended.
        setIncomingCall(null);
      }
    };

    // Check on mount
    handleStorageChange();

    // Listen for changes
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user]);

  const handleAcceptCall = () => {
    if (incomingCall) {
      localStorage.setItem('activeCall', JSON.stringify(incomingCall));
      localStorage.removeItem('incomingCall');
      setIncomingCall(null);
      router.push('/video-conference');
    }
  };

  const handleDeclineCall = () => {
    localStorage.removeItem('incomingCall');
    setIncomingCall(null);
  };

  if (!incomingCall) {
    return null;
  }

  return (
    <Dialog open={!!incomingCall} onOpenChange={(open) => !open && handleDeclineCall()}>
      <DialogContent>
        <DialogHeader className="items-center text-center">
          <Avatar className="h-20 w-20 mb-4">
            <AvatarImage src={`https://avatar.vercel.sh/${incomingCall.user1.name}.png`} />
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
