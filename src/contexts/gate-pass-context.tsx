
'use client';

import { createContext, useContext, useState, type ReactNode, useEffect } from 'react';
import type { Activity } from '@/lib/data';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface GatePassContextType {
  activities: Activity[];
  addActivity: (newPass: Omit<Activity, 'id' | 'time' | 'date' | 'status'>) => Promise<void>;
  updateActivityStatus: (id: string, status: Activity['status']) => void;
  loading: boolean;
}

const GatePassContext = createContext<GatePassContextType | undefined>(undefined);

export function GatePassProvider({ children }: { children: ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchActivities() {
      try {
        setLoading(true);
        const response = await fetch('/api/activities');
        if (!response.ok) {
          throw new Error('Failed to fetch activities');
        }
        const data = await response.json();
        setActivities(data);
      } catch (error) {
        console.error(error);
        toast({
            variant: "destructive",
            title: "Error fetching data",
            description: "Could not load existing gate passes.",
        });
      } finally {
        setLoading(false);
      }
    }
    fetchActivities();
  }, [toast]);

  const addActivity = async (newPassData: Omit<Activity, 'id' | 'time' | 'date' | 'status'>) => {
    const newPass: Activity = {
      ...newPassData,
      id: `pass-${Date.now()}`,
      time: format(new Date(), "hh:mm a"),
      date: format(new Date(), "yyyy-MM-dd"),
      status: 'Checked In',
    };

    try {
        const response = await fetch('/api/activities', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newPass),
        });

        if (!response.ok) {
            throw new Error('Failed to save the new pass');
        }

        const savedPass = await response.json();
        setActivities(prevActivities => [savedPass, ...prevActivities]);

    } catch (error) {
        console.error(error);
        toast({
            variant: "destructive",
            title: "Error Saving Pass",
            description: "The new gate pass could not be saved to the database.",
        });
    }
  };

  const updateActivityStatus = (id: string, status: Activity['status']) => {
    // This part would also need an API endpoint to be truly persistent.
    // For now, it will only update in the client-side state.
    setActivities(prevActivities =>
      prevActivities.map(pass =>
        pass.id === id ? { ...pass, status: status, ...(status === 'Checked Out' && { checkoutTime: format(new Date(), "hh:mm a") }) } : pass
      )
    );
     toast({
        title: "Status Updated",
        description: `Pass for ${activities.find(p=>p.id === id)?.visitorName} is now ${status}.`,
    });
  };

  return (
    <GatePassContext.Provider value={{ activities, addActivity, updateActivityStatus, loading }}>
      {children}
    </GatePassContext.Provider>
  );
}

export function useGatePass() {
  const context = useContext(GatePassContext);
  if (context === undefined) {
    throw new Error('useGatePass must be used within a GatePassProvider');
  }
  return context;
}
