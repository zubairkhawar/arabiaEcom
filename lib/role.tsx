"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type Role = "reseller" | "admin";

interface RoleContextValue {
  role: Role;
  setRole: (r: Role) => void;
  toggle: () => void;
  userName: string;
  userEmail: string;
}

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("reseller");
  const toggle = useCallback(
    () => setRole((r) => (r === "reseller" ? "admin" : "reseller")),
    []
  );
  const value: RoleContextValue = {
    role,
    setRole,
    toggle,
    userName: role === "admin" ? "Safdar Khan" : "Layla Hassan",
    userEmail: role === "admin" ? "safdar@arabia-ai.com" : "layla@aurorastore.ae",
  };
  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const v = useContext(RoleContext);
  if (!v) throw new Error("useRole must be used inside RoleProvider");
  return v;
}
