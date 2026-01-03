"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useState, useMemo } from "react";

export type UserRole = "Admin" | "Security" | "Resident" | "Manager";

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  roles: UserRole[];
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const roles: UserRole[] = ["Admin", "Security", "Resident", "Manager"];
  const [role, setRole] = useState<UserRole>("Admin");

  const contextValue = useMemo(() => ({ role, setRole, roles }), [role]);

  return (
    <RoleContext.Provider value={contextValue}>{children}</RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
