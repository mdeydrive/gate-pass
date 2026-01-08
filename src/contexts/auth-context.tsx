
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
        try {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser && parsedUser.role) {
                setUser(parsedUser);
                setRole(parsedUser.role);
            }
        } catch (e) {
            console.error("Failed to parse user from localStorage", e);
            localStorage.removeItem('user');
        }
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
    setLoading(true);

    if (type === 'admin' && identifier === 'admin') {
        loggedInUser = {
            id: 'admin-user',
            username: 'Administrator', 
            role: 'Admin',
            status: 'Active',
            permissions: ["dashboard", "gate-pass", "history", "visitors", "management", "approving-authorities", "alerts", "vehicles", "database", "deliveries", "staff", "reports", "control-panel", "print"],
        };
    } else {
        const authorities = await getAuthorities();
        const authority = authorities.find(auth => auth.mobileNumber === identifier && auth.status === 'Active');

        if (authority) {
            const userRole = authority.role as UserRole;
            const loginTypeMatchesRole = 
                (type === 'user' && ['Resident'].includes(userRole)) ||
                (type === 'approver' && ['Approver'].includes(userRole)) ||
                (type === 'manager' && ['Manager'].includes(userRole)) ||
                (type === 'security' && ['Security'].includes(userRole)) ||
                // Admin can also login via user tab if they are in the database
                (type === 'user' && ['Admin'].includes(userRole));
            
            if (loginTypeMatchesRole) {
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
        setLoading(false);
        return true;
    }

    setLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    setRole('Resident'); // Reset to a default non-privileged role
    localStorage.removeItem('user');
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
