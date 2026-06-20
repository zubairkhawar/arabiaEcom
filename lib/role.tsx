"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api, getToken, setToken } from "./api";

export type Role = "reseller" | "admin";

interface ResellerProfile {
  id: string;
  name: string;
  email: string;
  plan: string;
  role: Role;
  country: string;
  currency: string;
}

interface RoleContextValue {
  role: Role;
  setRole: (r: Role) => void;
  toggle: () => void;
  userName: string;
  userEmail: string;
  profile: ResellerProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<ResellerProfile>;
  signUp: (input: {
    name: string;
    email: string;
    password: string;
    country?: string;
    currency?: string;
  }) => Promise<ResellerProfile>;
  signOut: () => void;
  refresh: () => Promise<void>;
}

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>("reseller");
  const [profile, setProfile] = useState<ResellerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    const tok = getToken();
    if (!tok) {
      setProfile(null);
      setLoading(false);
      return;
    }
    try {
      const me = await api<ResellerProfile>("/auth/me");
      setProfile(me);
      setRoleState(me.role);
    } catch {
      setToken(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const setRole = useCallback((r: Role) => setRoleState(r), []);
  const toggle = useCallback(
    () => setRoleState((r) => (r === "reseller" ? "admin" : "reseller")),
    []
  );

  const signIn = useCallback(async (email: string, password: string) => {
    const res = await api<{ access_token: string; reseller: ResellerProfile }>(
      "/auth/login",
      { method: "POST", body: { email, password }, noAuth: true }
    );
    setToken(res.access_token);
    setProfile(res.reseller);
    setRoleState(res.reseller.role);
    return res.reseller;
  }, []);

  const signUp = useCallback(
    async (input: { name: string; email: string; password: string; country?: string; currency?: string }) => {
      const res = await api<{ access_token: string; reseller: ResellerProfile }>(
        "/auth/signup",
        {
          method: "POST",
          body: { country: "UAE", currency: "AED", ...input },
          noAuth: true,
        }
      );
      setToken(res.access_token);
      setProfile(res.reseller);
      setRoleState(res.reseller.role);
      return res.reseller;
    },
    []
  );

  const signOut = useCallback(() => {
    setToken(null);
    setProfile(null);
  }, []);

  const value: RoleContextValue = {
    role,
    setRole,
    toggle,
    userName: profile?.name ?? (role === "admin" ? "Admin" : "Demo Reseller"),
    userEmail: profile?.email ?? "",
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    refresh: loadProfile,
  };
  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const v = useContext(RoleContext);
  if (!v) throw new Error("useRole must be used inside RoleProvider");
  return v;
}
