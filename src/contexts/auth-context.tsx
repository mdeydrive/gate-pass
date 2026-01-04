'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import type { UserRole } from './role-context';

interface User {
  username: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, pass: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you'd check for a token in localStorage here
    // For this simulation, we'll just start as logged out.
    setLoading(false);
  }, []);

  const login = async (username: string, pass: string): Promise<boolean> => {
    // This is a simulation of a real login process.
    // NEVER do this in a real application.
    if (username === 'admin' && pass === 'admin123') {
      const loggedInUser: User = { username: 'admin', role: 'Admin' };
      setUser(loggedInUser);
      // In a real app, you would save a token to localStorage here.
      return true;
    }
    // You could add other users here
    // else if (username === 'security' && pass === 'sec123') {
    //   setUser({ username: 'security', role: 'Security' });
    //   return true;
    // }
    return false;
  };

  const logout = () => {
    setUser(null);
    // In a real app, you would clear the token from localStorage here.
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
