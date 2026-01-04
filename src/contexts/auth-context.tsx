
'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import type { UserRole } from './role-context';
import type { ApprovingAuthority } from '@/lib/data';

interface User {
  id: string;
  username: string; // Keep username for display, could be the person's name
  role: UserRole;
  mobileNumber: string;
}

interface AuthContextType {
  user: User | null;
  login: (identifier: string, pass: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// A simple in-memory cache for the authorities to avoid fetching on every login attempt.
let authoritiesCache: ApprovingAuthority[] | null = null;

async function getAuthorities(): Promise<ApprovingAuthority[]> {
    if (authoritiesCache) {
        return authoritiesCache;
    }
    try {
        const response = await fetch('/api/authorities');
        if (!response.ok) {
            console.error("Failed to fetch authorities for login check");
            return [];
        }
        const data = await response.json();
        authoritiesCache = data;
        return data;
    } catch (error) {
        console.error("Error fetching authorities:", error);
        return [];
    }
}


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you'd check for a token in localStorage here
    setLoading(false);
  }, []);

  const login = async (identifier: string, pass: string): Promise<boolean> => {
    // Admin login check
    if (identifier === 'admin' && pass === 'admin123') {
        const loggedInUser: User = {
            id: 'admin-user',
            username: 'Administrator', 
            role: 'Admin',
            mobileNumber: 'N/A'
        };
        setUser(loggedInUser);
        return true;
    }
    
    // Regular user login check
    if (pass !== 'user123') {
      return false;
    }

    const authorities = await getAuthorities();
    const authority = authorities.find(auth => auth.mobileNumber === identifier);

    if (authority) {
      // Map the authority's role to a UserRole. Defaulting to 'Manager' if not a direct match.
      let userRole: UserRole = 'Manager'; // Default role
      const potentialRole = authority.role as UserRole;
      if (['Admin', 'Security', 'Resident', 'Manager'].includes(potentialRole)) {
          userRole = potentialRole;
      }
      if (authority.role === 'Administrator') userRole = 'Admin';


      const loggedInUser: User = { 
        id: authority.id,
        username: authority.name, 
        role: userRole,
        mobileNumber: authority.mobileNumber
      };
      setUser(loggedInUser);
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, login, logout, loading }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
