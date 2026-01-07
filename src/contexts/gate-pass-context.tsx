

'use client';

import { createContext, useContext, useState, type ReactNode, useEffect, useCallback } from 'react';
import type { Activity } from '@/lib/data';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './auth-context';

interface GatePassContextType {
  activities: Activity[];
  addActivity: (newPass: Omit<Activity, 'id' | 'time' | 'date' | 'status' | 'approverIds'>) => Promise<void>;
  updateActivityStatus: (id: string, status: Activity['status']) => Promise<void>;
  assignApprover: (id: string, approverId: string) => Promise<void>;
  preApproveVisitor: (newPass: Omit<Activity, 'id' | 'time' | 'date' | 'status' | 'approverIds'>) => Promise<void>;
  loading: boolean;
}

const GatePassContext = createContext<GatePassContextType | undefined>(undefined);

export function GatePassProvider({ children }: { children: ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

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

  const addActivity = async (newPassData: Omit<Activity, 'id' | 'time' | 'date' | 'status' | 'approverIds'>) => {
    const newPassPayload = {
      ...newPassData,
      status: 'Pending',
      approverIds: [],
      user
    };

    try {
        const response = await fetch('/api/activities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newPassPayload),
        });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
            console.error('Server Error:', errorBody);
            throw new Error(errorBody.message || `Error ${response.status}: Failed to save the new pass`);
        }
        
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

  const preApproveVisitor = async (newPassData: Omit<Activity, 'id' | 'time' | 'date' | 'status' | 'approverIds'>) => {
    const newPassPayload = {
        ...newPassData,
        status: 'Approved',
        approverIds: user ? [user.id] : [],
        approvedById: user?.id,
    };

     try {
        const response = await fetch('/api/activities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newPassPayload),
        });
        if (!response.ok) throw new Error('Failed to save pre-approved pass');
        
        await fetchActivities();

    } catch (error: any) {
        console.error(error);
        toast({
            variant: "destructive",
            title: "Error Saving Pass",
            description: "The pre-approved pass could not be saved.",
        });
    }
  };


  const updateActivityStatus = async (id: string, status: Activity['status']) => {
    const body: Partial<Activity> = { id, status };
    
    if (status === 'Approved') {
        body.approvedAt = new Date().toISOString();
        if (user) {
            body.approvedById = user.id;
        }
    } else if (status === 'Checked In') {
        body.checkedInAt = new Date().toISOString();
    } else if (status === 'Checked Out') {
        body.checkedOutAt = new Date().toISOString();
    }
    
    try {
        const response = await fetch('/api/activities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
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

  const assignApprover = async (id: string, approverId: string) => {
    try {
        const response = await fetch('/api/activities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, approverIds: [approverId] }),
        });

        if (!response.ok) {
            throw new Error('Failed to assign approver');
        }
        
        const updatedPass = await response.json();

        setActivities(prevActivities =>
            prevActivities.map(pass => (pass.id === id ? updatedPass : pass))
        );

        toast({
            title: "Approver Assigned",
            description: `Pass has been sent for approval.`,
        });

    } catch (error) {
        console.error(error);
        toast({
            variant: "destructive",
            title: "Error Assigning Approver",
            description: "The approver could not be assigned.",
        });
    }
  };


  return (
    <GatePassContext.Provider value={{ activities, addActivity, updateActivityStatus, assignApprover, preApproveVisitor, loading }}>
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
