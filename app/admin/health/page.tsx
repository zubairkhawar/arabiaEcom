"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Shell } from "@/components/layout/Shell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api";
import { shortDate } from "@/lib/format";

interface ResellerHealthRow {
  reseller_id: string;
  reseller_name: string;
  reseller_email: string;
  wa_status: "connected" | "not_configured" | "unverified";
  wa_number: string | null;
  shopify_stores: number;
  shopify_revoked: number;
  last_shopify_sync: string | null;
  templates_total: number;
  templates_approved: number;
  last_order_at: string | null;
}

const WA_TONES: Record<string, "success" | "danger" | "neutral"> = {
  connected: "success",
  not_configured: "neutral",
  unverified: "danger",
};

export default function HealthPage() {
  const [rows, setRows] = useState<ResellerHealthRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = await api<ResellerHealthRow[]>("/admin/health");
      setRows(data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = rows.filter((r) => {
    if (!q) return true;
    const hay = `${r.reseller_name} ${r.reseller_email}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  const issues = rows.filter((r) => r.wa_status !== "connected" || r.shopify_revoked > 0);

  return (
    <Shell
      portal="admin"
      title="System Health"
      subtitle={`${rows.length} resellers · ${issues.length} with issues`}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[240px]">
            <Input
              placeholder="Search reseller…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" leftIcon={<RefreshCw size={14} className={loading ? "animate-spin" : ""} />} onClick={load} disabled={loading}>
            Refresh
          </Button>
        </div>

        {err && <div className="text-sm text-[var(--danger)] bg-[var(--danger-soft)] border border-red-200 rounded-lg px-3 py-2">{err}</div>}

        {issues.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="text-sm font-semibold text-amber-900 mb-2">{issues.length} reseller{issues.length === 1 ? "" : "s"} need attention</div>
            <ul className="space-y-1">
              {issues.slice(0, 5).map((r) => (
                <li key={r.reseller_id} className="text-xs text-amber-800">
                  <span className="font-medium">{r.reseller_name}</span>
                  {r.wa_status !== "connected" && <span className="ml-2">· WA {r.wa_status.replace("_", " ")}</span>}
                  {r.shopify_revoked > 0 && <span className="ml-2">· {r.shopify_revoked} Shopify store{r.shopify_revoked === 1 ? "" : "s"} revoked</span>}
                </li>
              ))}
              {issues.length > 5 && <li className="text-xs text-amber-700">…and {issues.length - 5} more</li>}
            </ul>
          </div>
        )}

        <Card padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-slate-50 text-xs text-[var(--text-secondary)] uppercase tracking-wide">
                  <th className="text-left px-4 py-3">Reseller</th>
                  <th className="text-left px-4 py-3">WhatsApp</th>
                  <th className="text-left px-4 py-3">Shopify</th>
                  <th className="text-left px-4 py-3">Templates</th>
                  <th className="text-left px-4 py-3">Last Order</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-[var(--text-secondary)] text-sm">Loading…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-[var(--text-secondary)] text-sm">No resellers</td></tr>
                ) : (
                  filtered.map((r) => (
                    <tr key={r.reseller_id} className="border-b border-[var(--border)] hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-[var(--text-primary)]">{r.reseller_name}</div>
                        <div className="text-xs text-[var(--text-secondary)]">{r.reseller_email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={WA_TONES[r.wa_status] ?? "neutral"} dot>
                          {r.wa_status.replace("_", " ")}
                        </Badge>
                        {r.wa_number && (
                          <div className="text-xs text-[var(--text-muted)] mt-0.5 font-mono">{r.wa_number}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {r.shopify_stores === 0 ? (
                          <span className="text-xs text-[var(--text-muted)]">—</span>
                        ) : (
                          <div>
                            <Badge tone={r.shopify_revoked > 0 ? "danger" : "success"} dot>
                              {r.shopify_stores} store{r.shopify_stores === 1 ? "" : "s"}
                              {r.shopify_revoked > 0 && ` · ${r.shopify_revoked} revoked`}
                            </Badge>
                            {r.last_shopify_sync && (
                              <div className="text-xs text-[var(--text-muted)] mt-0.5">
                                sync {shortDate(r.last_shopify_sync)}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[var(--text-primary)]">{r.templates_approved}</span>
                        <span className="text-[var(--text-muted)]">/{r.templates_total} approved</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">
                        {r.last_order_at ? shortDate(r.last_order_at) : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Shell>
  );
}
