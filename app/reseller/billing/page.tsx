"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Shell } from "@/components/layout/Shell";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";
import type { SubscriptionOut, CreditLedgerRow, CheckoutOut, PlanOut } from "@/lib/types";
import { Check, Zap, ArrowUpRight, Sparkles, Loader2 } from "lucide-react";

const TOPUP_OPTIONS = [
  { credits: 100, price: 79 },
  { credits: 500, price: 299 },
  { credits: 2000, price: 999 },
];

function BillingContent() {
  const params = useSearchParams();
  const [sub, setSub] = useState<SubscriptionOut | null>(null);
  const [ledger, setLedger] = useState<CreditLedgerRow[]>([]);
  const [cycle, setCycle] = useState<"monthly" | "annual">("monthly");
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState<string | null>(null);
  const [topping, setTopping] = useState<number | null>(null);
  const [banner, setBanner] = useState<{ kind: "success" | "info" | "error"; text: string } | null>(null);

  const load = async () => {
    const [s, l] = await Promise.all([
      api<SubscriptionOut>("/billing/me/subscription"),
      api<CreditLedgerRow[]>("/billing/me/credits/ledger?limit=20"),
    ]);
    setSub(s);
    setLedger(l);
    setLoading(false);
  };

  useEffect(() => {
    load().catch((e) => {
      setBanner({ kind: "error", text: e instanceof Error ? e.message : "Load failed" });
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const status = params.get("status");
    if (status === "success") {
      setBanner({ kind: "success", text: "Payment received — your plan is active." });
    } else if (status === "topup_success") {
      setBanner({ kind: "success", text: "Top-up credited to your account." });
    }
  }, [params]);

  const startCheckout = async (planCode: string) => {
    setActivating(planCode);
    setBanner(null);
    try {
      const r = await api<CheckoutOut>("/billing/me/subscription/checkout", {
        method: "POST",
        body: { plan_code: planCode, billing_cycle: cycle },
      });
      window.location.href = r.redirect_url;
    } catch (e) {
      setBanner({ kind: "error", text: e instanceof Error ? e.message : "Checkout failed" });
      setActivating(null);
    }
  };

  const topup = async (credits: number) => {
    setTopping(credits);
    setBanner(null);
    try {
      const r = await api<CheckoutOut>("/billing/me/credits/topup", {
        method: "POST",
        body: { credits },
      });
      window.location.href = r.redirect_url;
    } catch (e) {
      setBanner({ kind: "error", text: e instanceof Error ? e.message : "Top-up failed" });
      setTopping(null);
    }
  };

  const cancel = async () => {
    if (!confirm("Cancel subscription? It stays active until period end, then pauses.")) return;
    try {
      const s = await api<SubscriptionOut>("/billing/me/subscription/cancel", { method: "POST" });
      setSub(s);
      setBanner({ kind: "info", text: "Subscription cancelled. Active until period end." });
    } catch (e) {
      setBanner({ kind: "error", text: e instanceof Error ? e.message : "Cancel failed" });
    }
  };

  if (loading || !sub) {
    return (
      <Shell portal="reseller" title="Billing">
        <div className="text-sm text-[var(--text-secondary)]">Loading…</div>
      </Shell>
    );
  }

  const usagePct = sub.credits_granted_this_period > 0
    ? Math.min(100, Math.round((sub.credits_used_this_period / sub.credits_granted_this_period) * 100))
    : 0;

  return (
    <Shell portal="reseller" title="Billing" subtitle="Plans, credits & usage history.">
      {banner && (
        <div className={`mb-5 text-sm rounded-xl px-4 py-3 border ${
          banner.kind === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : banner.kind === "info" ? "border-blue-200 bg-blue-50 text-blue-800"
          : "border-red-200 bg-red-50 text-red-800"
        }`}>
          {banner.text}
        </div>
      )}

      {/* Current plan + credit meter */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <Card className="lg:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Current plan</div>
              <div className="flex items-baseline gap-3 mt-1">
                <div className="font-display text-2xl font-bold">{sub.plan.name}</div>
                <Badge tone={
                  sub.status === "active" ? "success" :
                  sub.status === "trial" ? "info" : "warning"
                }>
                  {sub.status}
                </Badge>
              </div>
              {sub.plan.code !== "trial" && (
                <div className="text-sm text-[var(--text-secondary)] mt-1">
                  {sub.plan.price.toFixed(0)} {sub.plan.currency}/month
                  {sub.billing_cycle === "annual" && " · billed annually"}
                </div>
              )}
              {sub.is_trial && sub.days_left_in_trial !== null && (
                <div className="text-sm text-[var(--text-secondary)] mt-1">
                  {sub.days_left_in_trial} day{sub.days_left_in_trial === 1 ? "" : "s"} left in trial
                </div>
              )}
            </div>
            {sub.status === "active" && !sub.cancelled_at && (
              <button
                onClick={cancel}
                className="text-xs text-slate-500 hover:text-red-600 px-2"
              >
                Cancel
              </button>
            )}
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-[var(--text-secondary)]">Credits this period</span>
              <span className="font-semibold">
                {sub.credits_used_this_period.toLocaleString()}
                <span className="text-[var(--text-muted)]"> / {sub.credits_granted_this_period.toLocaleString()} used</span>
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full ${usagePct >= 100 ? "bg-red-500" : usagePct >= 80 ? "bg-amber-500" : "bg-emerald-500"}`}
                style={{ width: `${usagePct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mt-1.5">
              <span>{sub.credits_balance.toLocaleString()} credit{sub.credits_balance === 1 ? "" : "s"} remaining</span>
              {sub.current_period_end && (
                <span>Renews {new Date(sub.current_period_end).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Top up" subtitle="One-off credits, no expiry" />
          <div className="space-y-2">
            {TOPUP_OPTIONS.map((t) => (
              <button
                key={t.credits}
                onClick={() => topup(t.credits)}
                disabled={topping !== null}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-[var(--border)] hover:border-emerald-300 hover:bg-emerald-50/40 transition-colors text-left disabled:opacity-50"
              >
                <div>
                  <div className="font-semibold text-sm text-[var(--text-primary)]">{t.credits} credits</div>
                  <div className="text-[11px] text-[var(--text-muted)]">{(t.price / t.credits).toFixed(2)} AED/credit</div>
                </div>
                <div className="text-sm font-bold text-[var(--accent)]">
                  {topping === t.credits ? <Loader2 size={14} className="animate-spin" /> : `${t.price} AED`}
                </div>
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Plan picker */}
      <Card padded={false} className="mb-6">
        <div className="p-5 flex items-center justify-between flex-wrap gap-3 border-b border-[var(--border)]">
          <div>
            <div className="font-display font-semibold text-lg">Plans</div>
            <p className="text-sm text-[var(--text-secondary)]">Pick a plan that matches your monthly volume.</p>
          </div>
          <div className="inline-flex bg-slate-100 rounded-full p-1 text-xs font-medium">
            <button
              onClick={() => setCycle("monthly")}
              className={`px-3 h-7 rounded-full ${cycle === "monthly" ? "bg-white text-[var(--text-primary)] shadow-sm" : "text-slate-500"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setCycle("annual")}
              className={`px-3 h-7 rounded-full ${cycle === "annual" ? "bg-white text-[var(--text-primary)] shadow-sm" : "text-slate-500"}`}
            >
              Annual <span className="text-emerald-600 font-semibold ml-1">−17%</span>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[var(--border)]">
          {sub.available_plans.map((p) => (
            <PlanCard
              key={p.code}
              plan={p}
              cycle={cycle}
              isCurrent={sub.plan.code === p.code && !sub.is_trial}
              activating={activating === p.code}
              disabled={activating !== null}
              recommended={p.code === "growth"}
              onActivate={() => startCheckout(p.code)}
            />
          ))}
        </div>
      </Card>

      {/* Credit usage history */}
      <Card>
        <CardHeader
          title="Credit activity"
          subtitle="Latest 20 grants and consumptions"
          action={<Zap size={16} className="text-[var(--accent)]" />}
        />
        {ledger.length === 0 ? (
          <div className="text-sm text-[var(--text-secondary)]">No activity yet.</div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {ledger.map((row, i) => (
              <div key={i} className="py-2.5 flex items-center justify-between text-sm">
                <div className="min-w-0">
                  <div className="font-medium text-[var(--text-primary)]">
                    {readableReason(row.reason)}
                  </div>
                  {row.note && (
                    <div className="text-xs text-[var(--text-muted)] truncate">{row.note}</div>
                  )}
                </div>
                <div className="flex items-baseline gap-3 shrink-0">
                  <div className={`font-mono text-sm font-semibold ${row.delta >= 0 ? "text-emerald-600" : "text-slate-500"}`}>
                    {row.delta >= 0 ? "+" : ""}{row.delta}
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)] w-24 text-right">
                    {new Date(row.occurred_at).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </Shell>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<Shell portal="reseller" title="Billing"><div className="text-sm text-[var(--text-secondary)]">Loading…</div></Shell>}>
      <BillingContent />
    </Suspense>
  );
}

function PlanCard({
  plan,
  cycle,
  isCurrent,
  activating,
  disabled,
  recommended,
  onActivate,
}: {
  plan: PlanOut;
  cycle: "monthly" | "annual";
  isCurrent: boolean;
  activating: boolean;
  disabled: boolean;
  recommended: boolean;
  onActivate: () => void;
}) {
  const price = cycle === "annual" ? plan.price_annual : plan.price;
  const monthly = cycle === "annual" ? plan.price_annual / 12 : plan.price;

  return (
    <div className={`p-6 relative ${recommended ? "bg-emerald-50/30" : ""}`}>
      {recommended && (
        <div className="absolute top-3 right-3 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full uppercase tracking-wide">
          Recommended
        </div>
      )}
      <div className="font-display text-xl font-bold text-[var(--text-primary)]">{plan.name}</div>
      <div className="mt-2 flex items-baseline gap-1">
        <div className="font-display text-3xl font-bold text-[var(--text-primary)]">
          {monthly.toFixed(0)}
        </div>
        <div className="text-sm text-[var(--text-secondary)]">{plan.currency}/mo</div>
      </div>
      {cycle === "annual" && (
        <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
          {price.toFixed(0)} {plan.currency} billed annually
        </div>
      )}
      <div className="text-sm font-medium text-emerald-700 mt-1.5">
        {plan.monthly_credits.toLocaleString()} AI conversations / month
      </div>
      <ul className="mt-4 space-y-1.5 text-sm">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-[var(--text-secondary)]">
            <Check size={14} className="text-emerald-600 mt-0.5 shrink-0" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Button
        onClick={onActivate}
        disabled={isCurrent || disabled}
        className="w-full mt-5"
        variant={recommended ? "primary" : "outline"}
        rightIcon={isCurrent ? undefined : <ArrowUpRight size={14} />}
      >
        {isCurrent ? "Current plan" : activating ? "Redirecting…" : "Choose plan"}
      </Button>
    </div>
  );
}

function readableReason(r: string): string {
  switch (r) {
    case "trial_seed": return "Free trial — initial credits";
    case "conversation": return "AI conversation handled";
    case "plan_activated": return "Plan activated";
    case "period_renewal": return "Period renewed";
    case "topup_purchase": return "Top-up purchase";
    case "admin_grant": return "Admin grant";
    case "grandfather_grant": return "Bonus credits";
    default: return r;
  }
}
