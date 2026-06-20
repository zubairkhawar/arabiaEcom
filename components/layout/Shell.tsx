"use client";

import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useEffect } from "react";
import { useRole } from "@/lib/role";
import { usePathname, useRouter } from "next/navigation";

export function Shell({
  children,
  title,
  subtitle,
  portal,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
  portal: "reseller" | "admin";
}) {
  const { role, setRole, profile, loading } = useRole();
  const pathname = usePathname();
  const router = useRouter();

  // Redirect to login when there's no session
  useEffect(() => {
    if (!loading && !profile) router.replace("/");
  }, [loading, profile, router]);

  // Sync role with the current route prefix
  useEffect(() => {
    if (role !== portal) setRole(portal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portal]);

  // Allow topbar toggle to hop portals
  useEffect(() => {
    if (role === "admin" && pathname.startsWith("/reseller")) router.push("/admin");
    if (role === "reseller" && pathname.startsWith("/admin")) router.push("/reseller");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  if (loading || !profile) {
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
        <Topbar title={title} subtitle={subtitle} />
        <main className="flex-1 px-6 lg:px-8 py-6 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
