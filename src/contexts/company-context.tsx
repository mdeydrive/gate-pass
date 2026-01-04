
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';

interface CompanyContextType {
  companyName: string;
  setCompanyName: (name: string) => void;
  logoUrl: string;
  setLogoUrl: (url: string) => void;
  loading: boolean;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [companyName, setCompanyName] = useState('SecurePass');
  const [logoUrl, setLogoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchCompanyInfo() {
      try {
        setLoading(true);
        const response = await fetch('/api/company');
        if (!response.ok) throw new Error('Failed to fetch company info');
        const data = await response.json();
        setCompanyName(data.companyName || 'SecurePass');
        setLogoUrl(data.logoUrl || '');
      } catch (error) {
        console.error(error);
        // Don't show a toast on initial load error
      } finally {
        setLoading(false);
      }
    }
    fetchCompanyInfo();
  }, []);

  const value = useMemo(
    () => ({ companyName, setCompanyName, logoUrl, setLogoUrl, loading }),
    [companyName, logoUrl, loading]
  );

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
}
