"use client";

import { Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { SubscriptionOut } from "@/lib/types";

export function TrialBanner({ sub }: { sub: SubscriptionOut | null }) {
  if (!sub) return null;

  if (sub.is_trial) {
    const days = sub.days_left_in_trial ?? 0;
    const credits = sub.credits_balance;
    const urgent = days <= 2 || credits <= 10;
    return (
      <div className={`mb-5 rounded-xl border px-4 py-3 flex items-center gap-3 text-sm ${
        urgent
          ? "border-amber-300 bg-amber-50 text-amber-900"
          : "border-emerald-200 bg-emerald-50 text-emerald-900"
      }`}>
        <Clock size={16} className={urgent ? "text-amber-600 shrink-0" : "text-emerald-600 shrink-0"} />
        <div className="flex-1">
          <strong>Free trial</strong> — {days} day{days === 1 ? "" : "s"} left,{" "}
          {credits} credit{credits === 1 ? "" : "s"} remaining.
        </div>
        <Link
          href="/reseller/billing"
          className="text-xs font-semibold inline-flex items-center gap-1 px-3 h-7 rounded-full bg-white border border-current hover:bg-current/5"
        >
          Pick a plan <ArrowRight size={12} />
        </Link>
      </div>
    );
  }

  if (sub.is_paused) {
    const label =
      sub.status === "cancelled" ? "Subscription cancelled"
        : sub.status === "past_due" ? "Payment past due"
        : "Account paused";
    return (
      <div className="mb-5 rounded-xl border border-red-200 bg-red-50 text-red-900 px-4 py-3 flex items-center gap-3 text-sm">
        <Clock size={16} className="text-red-600 shrink-0" />
        <div className="flex-1">
          <strong>{label}</strong> — your AI is paused. New conversations won't get an automatic reply.
        </div>
        <Link
          href="/reseller/billing"
          className="text-xs font-semibold inline-flex items-center gap-1 px-3 h-7 rounded-full bg-white border border-current hover:bg-current/5"
        >
          Reactivate <ArrowRight size={12} />
        </Link>
      </div>
    );
  }

  return null;
}
