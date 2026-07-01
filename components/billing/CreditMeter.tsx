"use client";

import { Zap } from "lucide-react";
import type { SubscriptionOut } from "@/lib/types";

export function CreditMeter({ sub }: { sub: SubscriptionOut | null }) {
  if (!sub) return null;
  const total = sub.credits_granted_this_period || 0;
  const used = sub.credits_used_this_period || 0;
  const remaining = sub.credits_balance || 0;
  const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
  const danger = remaining <= 0;
  const warn = !danger && remaining <= Math.max(10, Math.floor(total * 0.2));

  const barColor = danger ? "bg-red-500" : warn ? "bg-amber-500" : "bg-emerald-500";

  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
          <Zap size={12} className="text-emerald-600" /> Credits
        </div>
        <div className="text-xs font-semibold text-[var(--text-primary)]">
          {remaining.toLocaleString()}<span className="text-[var(--text-muted)]"> / {total.toLocaleString()}</span>
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
      {(warn || danger) && (
        <a
          href="/reseller/billing"
          className="block mt-2 text-[11px] font-medium text-[var(--accent)] hover:underline"
        >
          {danger ? "Out of credits — upgrade →" : "Running low — top up →"}
        </a>
      )}
    </div>
  );
}
