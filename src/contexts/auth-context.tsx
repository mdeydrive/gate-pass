'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import type { UserRole } from './role-context';
import type { ApprovingAuthority } from '@/lib/data';

interface User {
  username: string; // Keep username for display, could be the person's name
  role: UserRole;
  mobileNumber: string;
}

interface AuthContextType {
  user: User | null;
  login: (mobileNumber: string, pass: string) => Promise<boolean>;
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

  const login = async (mobileNumber: string, pass: string): Promise<boolean> => {
    // Password for all users is 'user123'
    if (pass !== 'user123') {
      return false;
    }

    const authorities = await getAuthorities();
    const authority = authorities.find(auth => auth.mobileNumber === mobileNumber);

    if (authority) {
      // Map the authority's role to a UserRole. Defaulting to 'Manager' if not a direct match.
      // This part can be made more robust if roles have more variations.
      let userRole: UserRole = 'Manager'; // Default role
      const potentialRole = authority.role as UserRole;
      if (['Admin', 'Security', 'Resident', 'Manager'].includes(potentialRole)) {
          userRole = potentialRole;
      }
      if (authority.role === 'Administrator') userRole = 'Admin';


      const loggedInUser: User = { 
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
