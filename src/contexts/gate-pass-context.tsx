
'use client';

import { createContext, useContext, useState, type ReactNode, useEffect, useCallback } from 'react';
import type { Activity } from '@/lib/data';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface GatePassContextType {
  activities: Activity[];
  addActivity: (newPass: Omit<Activity, 'id' | 'time' | 'date' | 'status'>) => Promise<void>;
  updateActivityStatus: (id: string, status: Activity['status']) => Promise<void>;
  loading: boolean;
}

const GatePassContext = createContext<GatePassContextType | undefined>(undefined);

export function GatePassProvider({ children }: { children: ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchActivities = useCallback(async () => {
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
  }, [toast]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const addActivity = async (newPassData: Omit<Activity, 'id' | 'time' | 'date' | 'status'>) => {
    const newPass: Activity = {
      ...newPassData,
      id: `pass-${Date.now()}`,
      time: format(new Date(), "hh:mm a"),
      date: format(new Date(), "yyyy-MM-dd"),
      status: 'Pending',
    };

    try {
        const response = await fetch('/api/activities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newPass),
        });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
            console.error('Server Error:', errorBody);
            throw new Error(errorBody.message || `Error ${response.status}: Failed to save the new pass`);
        }
        
        // Refetch activities to get the latest list
        await fetchActivities();

    } catch (error: any) {
        console.error(error);
        toast({
            variant: "destructive",
            title: "Error Saving Pass",
            description: error.message || "The new gate pass could not be saved to the database.",
        });
    }
  };

  const updateActivityStatus = async (id: string, status: Activity['status']) => {
    const checkoutTime = status === 'Checked Out' ? format(new Date(), "hh:mm a") : undefined;
    
    try {
        const response = await fetch('/api/activities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status, checkoutTime }),
        });

        if (!response.ok) {
            throw new Error('Failed to update pass status');
        }
        
        const updatedPass = await response.json();

        setActivities(prevActivities =>
            prevActivities.map(pass => (pass.id === id ? updatedPass : pass))
        );

        toast({
            title: "Status Updated",
            description: `Pass for ${activities.find(p=>p.id === id)?.visitorName} is now ${status}.`,
        });

    } catch (error) {
         console.error(error);
         toast({
            variant: "destructive",
            title: "Error Updating Status",
            description: "The pass status could not be saved to the database.",
        });
    }
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

    