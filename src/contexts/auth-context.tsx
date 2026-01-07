
'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import type { UserRole } from './role-context';
import type { ApprovingAuthority, Permission } from '@/lib/data';
import { useRole } from './role-context';

interface User {
  id: string;
  username: string;
  role: UserRole;
  mobileNumber?: string;
  status: 'Active' | 'Inactive';
  permissions: Permission[];
}

interface AuthContextType {
  user: User | null;
  login: (identifier: string, pass: string, type: 'user' | 'admin' | 'approver' | 'manager' | 'security') => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
  const { setRole } = useRole(); 

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setRole(parsedUser.role);
    }
    setLoading(false);
  }, [setRole]);

  const login = async (identifier: string, pin: string, type: 'user' | 'admin' | 'approver' | 'manager' | 'security'): Promise<boolean> => {
    
    if (type === 'admin') {
      if (pin !== '1978') return false;
    } else {
      if (pin !== '1234') return false;
    }

    let loggedInUser: User | null = null;

    if (type === 'admin' && identifier === 'admin') {
        loggedInUser = {
            id: 'admin-user',
            username: 'Administrator', 
            role: 'Admin',
            status: 'Active',
            permissions: ["dashboard", "gate-pass", "history", "visitors", "management", "approving-authorities", "alerts", "vehicles", "database", "deliveries", "staff", "control-panel"],
        };
    } else {
        const authorities = await getAuthorities();
        const authority = authorities.find(auth => auth.mobileNumber === identifier);

        if (authority && authority.status === 'Active') {
            const userRole = authority.role as UserRole;
            // Check if the login type matches the role from the database
            if ((type === 'approver' && userRole === 'Approver') ||
                (type === 'manager' && userRole === 'Manager') ||
                (type === 'security' && userRole === 'Security') ||
                (type === 'user' && ['Resident', 'Admin'].includes(userRole))
            ) {
                 loggedInUser = { 
                    id: authority.id,
                    username: authority.name, 
                    role: userRole,
                    mobileNumber: authority.mobileNumber,
                    status: authority.status,
                    permissions: authority.permissions,
                };
            }
        }
    }
    
    if (loggedInUser) {
        setUser(loggedInUser);
        setRole(loggedInUser.role);
        localStorage.setItem('user', JSON.stringify(loggedInUser));
        return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    setRole('Resident'); // Reset to a default non-privileged role
    localStorage.removeItem('user');
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
