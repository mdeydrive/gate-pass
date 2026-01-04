
"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useState, useMemo, useEffect } from "react";
import { useAuth } from "./auth-context";

export type UserRole = "Admin" | "Security" | "Resident" | "Manager" | "Approver";

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  roles: UserRole[];
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>("Resident");
  const roles: UserRole[] = ["Admin", "Security", "Resident", "Manager", "Approver"];

  const handleSetRole = (newRole: UserRole) => {
      setRole(newRole);
      // Update user in localStorage if it exists
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
          const user = JSON.parse(storedUser);
          user.role = newRole;
          localStorage.setItem('user', JSON.stringify(user));
      }
  }

  const contextValue = useMemo(() => ({ role, setRole: handleSetRole, roles }), [role]);

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
