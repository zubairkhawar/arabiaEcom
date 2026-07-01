"use client";

import { useEffect, useState } from "react";
import { Shell } from "@/components/layout/Shell";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api";
import type { AdminSubRow } from "@/lib/types";
import { Search, Plus, Zap } from "lucide-react";

export default function AdminSubscriptionsPage() {
  const [rows, setRows] = useState<AdminSubRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [granting, setGranting] = useState<string | null>(null);
  const [grantAmount, setGrantAmount] = useState<number>(100);
  const [grantNote, setGrantNote] = useState("");
  const [banner, setBanner] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api<AdminSubRow[]>("/billing/admin/subscriptions");
      setRows(r);
    } catch (e) {
      setBanner({ kind: "err", text: e instanceof Error ? e.message : "Failed to load" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = rows.filter((r) => {
    if (!q) return true;
    const s = q.toLowerCase();
    return r.reseller_name.toLowerCase().includes(s) ||
           r.reseller_email.toLowerCase().includes(s) ||
           r.plan_code.toLowerCase().includes(s) ||
           r.status.toLowerCase().includes(s);
  });

  const grant = async (reseller_id: string) => {
    if (grantAmount <= 0) return;
    try {
      const r = await api<{ ok: boolean; new_balance: number }>("/billing/admin/credits/grant", {
        method: "POST",
        body: { reseller_id, amount: grantAmount, note: grantNote || "manual admin grant" },
      });
      setBanner({ kind: "ok", text: `Granted ${grantAmount} credits — new balance: ${r.new_balance}` });
      setGranting(null);
      setGrantNote("");
      load();
    } catch (e) {
      setBanner({ kind: "err", text: e instanceof Error ? e.message : "Grant failed" });
    }
  };

  const stats = {
    total: rows.length,
    trial: rows.filter((r) => r.status === "trial").length,
    active: rows.filter((r) => r.status === "active").length,
    paused: rows.filter((r) => r.status === "paused").length,
    cancelled: rows.filter((r) => r.status === "cancelled").length,
  };

  return (
    <Shell portal="admin" title="Subscriptions" subtitle="All resellers — plan, status, credit balance, manual grants.">
      {banner && (
        <div className={`mb-5 text-sm rounded-xl px-4 py-3 border ${
          banner.kind === "ok" ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-red-200 bg-red-50 text-red-800"
        }`}>
          {banner.text}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          { l: "Total", v: stats.total, t: "neutral" as const },
          { l: "Trial", v: stats.trial, t: "info" as const },
          { l: "Active", v: stats.active, t: "success" as const },
          { l: "Paused", v: stats.paused, t: "warning" as const },
          { l: "Cancelled", v: stats.cancelled, t: "danger" as const },
        ].map((s) => (
          <Card key={s.l} className="!p-4">
            <div className="text-xs uppercase tracking-wide text-slate-500">{s.l}</div>
            <div className="font-display text-2xl font-bold mt-1">{s.v}</div>
          </Card>
        ))}
      </div>

      <Card padded={false}>
        <div className="p-4 border-b border-[var(--border)] flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, email, plan, status…"
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-[var(--border)] text-sm bg-white"
            />
          </div>
          <div className="text-xs text-[var(--text-secondary)]">{filtered.length} of {rows.length}</div>
        </div>
        {loading ? (
          <div className="p-6 text-sm text-[var(--text-secondary)]">Loading…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[11px] uppercase tracking-wider text-slate-500 bg-slate-50/60">
                <tr className="text-left">
                  <th className="px-4 py-3 font-semibold">Reseller</th>
                  <th className="px-4 py-3 font-semibold">Plan</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Credits</th>
                  <th className="px-4 py-3 font-semibold">Renews / Ends</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filtered.map((r) => (
                  <tr key={r.reseller_id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <div className="font-medium text-[var(--text-primary)]">{r.reseller_name}</div>
                      <div className="text-xs text-[var(--text-muted)]">{r.reseller_email}</div>
                    </td>
                    <td className="px-4 py-3 capitalize">{r.plan_code}</td>
                    <td className="px-4 py-3">
                      <Badge tone={statusTone(r.status)}>{r.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      <div className="font-semibold">{r.credits_balance.toLocaleString()}</div>
                      <div className="text-[11px] text-[var(--text-muted)]">{r.credits_used_this_period} used</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">
                      {r.status === "trial" && r.trial_ends_at
                        ? `Trial ends ${new Date(r.trial_ends_at).toLocaleDateString()}`
                        : r.current_period_end
                        ? `Renews ${new Date(r.current_period_end).toLocaleDateString()}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => { setGranting(r.reseller_id); setBanner(null); }}
                        className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-900"
                      >
                        <Plus size={12} /> Grant
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-[var(--text-secondary)]">
                      No subscriptions match.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Grant modal */}
      {granting && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl border border-[var(--border)] w-full max-w-md p-6 card-shadow">
            <div className="flex items-center gap-2 mb-1">
              <Zap size={18} className="text-emerald-600" />
              <h3 className="font-display font-bold text-lg">Grant credits</h3>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mb-5">
              Manually add credits to this reseller — support / goodwill grant. Logged in the credit ledger.
            </p>
            <div className="space-y-4">
              <Input
                label="Amount (credits)"
                type="number"
                value={String(grantAmount)}
                onChange={(e) => setGrantAmount(parseInt(e.target.value) || 0)}
              />
              <Input
                label="Note (optional)"
                value={grantNote}
                onChange={(e) => setGrantNote(e.target.value)}
                placeholder="Goodwill — webhook outage 2026-07-01"
              />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setGranting(null)}>Cancel</Button>
              <Button onClick={() => grant(granting)} disabled={grantAmount <= 0}>
                Grant {grantAmount} credits
              </Button>
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}

function statusTone(s: string): "success" | "warning" | "danger" | "info" | "neutral" {
  switch (s) {
    case "active": return "success";
    case "trial": return "info";
    case "paused": return "warning";
    case "past_due": return "warning";
    case "cancelled": return "danger";
    default: return "neutral";
  }
}
