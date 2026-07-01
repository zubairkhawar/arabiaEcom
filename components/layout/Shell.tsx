"use client";

import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useEffect } from "react";
import { useRole } from "@/lib/role";
import { useRouter } from "next/navigation";

export function Shell({
  children,
  title,
  subtitle,
  portal,
  showFilters = false,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
  portal: "reseller" | "admin";
  showFilters?: boolean;
}) {
  const { profile, loading, role } = useRole();
  const router = useRouter();

  // No session → login
  useEffect(() => {
    if (!loading && !profile) router.replace("/login");
  }, [loading, profile, router]);

  // Wrong portal for this role → bounce to the right one.
  // A reseller cannot enter /admin/*, an admin cannot enter /reseller/*.
  useEffect(() => {
    if (loading || !profile) return;
    if (portal === "admin" && role !== "admin") {
      router.replace("/reseller");
    } else if (portal === "reseller" && role === "admin") {
      router.replace("/admin");
    }
  }, [loading, profile, role, portal, router]);

  const wrongPortal =
    !loading && profile && (
      (portal === "admin" && role !== "admin") ||
      (portal === "reseller" && role === "admin")
    );

  if (loading || !profile || wrongPortal) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-[var(--text-secondary)]">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--bg-app)]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title={title} subtitle={subtitle} showFilters={showFilters} />
        <main className="flex-1 px-6 lg:px-8 py-6 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
