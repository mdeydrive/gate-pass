
'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Activity } from '@/lib/data';
import initialActivities from '@/data/gate-pass-data.json';
import { format } from 'date-fns';

interface GatePassContextType {
  activities: Activity[];
  addActivity: (newPass: Omit<Activity, 'id' | 'time' | 'date' | 'status'>) => void;
  updateActivityStatus: (id: string, status: Activity['status']) => void;
}

const GatePassContext = createContext<GatePassContextType | undefined>(undefined);

export function GatePassProvider({ children }: { children: ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>(initialActivities as Activity[]);

  const addActivity = (newPassData: Omit<Activity, 'id' | 'time' | 'date' | 'status'>) => {
    const newPass: Activity = {
      ...newPassData,
      id: `pass-${Date.now()}`,
      time: format(new Date(), "hh:mm a"),
      date: format(new Date(), "yyyy-MM-dd"),
      status: 'Checked In',
    };
    setActivities(prevActivities => [newPass, ...prevActivities]);
  };

  const updateActivityStatus = (id: string, status: Activity['status']) => {
    setActivities(prevActivities =>
      prevActivities.map(pass =>
        pass.id === id ? { ...pass, status: status, ...(status === 'Checked Out' && { checkoutTime: format(new Date(), "hh:mm a") }) } : pass
      )
    );
  };

  return (
    <GatePassContext.Provider value={{ activities, addActivity, updateActivityStatus }}>
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
