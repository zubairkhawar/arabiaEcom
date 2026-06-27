"use client";

import { Bell, Calendar, Globe, ChevronDown, LogOut, ShieldCheck, KeyRound } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { useRole } from "@/lib/role";
import { ChangePasswordModal } from "@/components/ChangePasswordModal";

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { role, userName, userEmail, signOut } = useRole();
  const [menuOpen, setMenuOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const router = useRouter();

  return (
    <header className="sticky top-0 z-30 bg-[var(--bg-app)]/80 backdrop-blur border-b border-[var(--border)] px-6 lg:px-8 py-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-display font-bold text-[var(--text-primary)] leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <button className="hidden md:inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-[var(--border)] bg-white text-sm text-slate-700 hover:bg-slate-50">
            <Calendar size={15} />
            <span>Last 7 days</span>
            <ChevronDown size={14} className="text-slate-400" />
          </button>
          <button className="hidden md:inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-[var(--border)] bg-white text-sm text-slate-700 hover:bg-slate-50">
            <Globe size={15} />
            <span>EN</span>
          </button>
          <button className="relative h-9 w-9 rounded-lg border border-[var(--border)] bg-white flex items-center justify-center hover:bg-slate-50">
            <Bell size={16} className="text-slate-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--accent)] ring-2 ring-white" />
          </button>

          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2 h-9 pl-1 pr-2.5 rounded-lg border border-[var(--border)] bg-white hover:bg-slate-50"
            >
              <Avatar name={userName} size={26} />
              <span className="hidden md:block text-left">
                <span className="block text-xs font-medium text-[var(--text-primary)] leading-tight">
                  {userName}
                </span>
                <span className="block text-[10px] text-[var(--text-muted)] capitalize flex items-center gap-1">
                  {role === "admin" && <ShieldCheck size={9} />}
                  {role}
                </span>
              </span>
              <ChevronDown size={14} className="text-slate-400" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-[var(--border)] overflow-hidden">
                <div className="px-4 py-3 border-b border-[var(--border)]">
                  <div className="text-sm font-medium text-[var(--text-primary)]">
                    {userName}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">{userEmail}</div>
                  {role === "admin" && (
                    <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-medium text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full">
                      <ShieldCheck size={10} /> Platform admin
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    setPwOpen(true);
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <KeyRound size={15} /> Change password
                </button>
                <div className="border-t border-[var(--border)]">
                  <button
                    onClick={() => {
                      signOut();
                      setMenuOpen(false);
                      router.replace("/");
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={15} /> Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ChangePasswordModal open={pwOpen} onClose={() => setPwOpen(false)} />
    </header>
  );
}
