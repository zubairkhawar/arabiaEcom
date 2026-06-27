"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { Shell } from "@/components/layout/Shell";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import { money, num, relTime, shortDate } from "@/lib/format";
import type { AdminOrderRow, ResellerSummary } from "@/lib/types";

interface SummaryResp {
  reseller: ResellerSummary;
  orders_count: number;
  revenue: number;
  clicks: number;
}

export default function ResellerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<SummaryResp | null>(null);
  const [orders, setOrders] = useState<AdminOrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [d, o] = await Promise.all([
        api<SummaryResp>(`/admin/resellers/${id}/summary`),
        api<AdminOrderRow[]>(`/admin/orders?reseller_id=${id}`),
      ]);
      setData(d);
      setOrders(o);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, [id]);

  if (loading) return <Shell portal="admin" title="Reseller"><div className="text-sm">Loading…</div></Shell>;
  if (err || !data) return <Shell portal="admin" title="Reseller"><div className="text-sm text-[var(--danger)]">{err || "not found"}</div></Shell>;

  const r = data.reseller;

  return (
    <Shell portal="admin" title={r.name} subtitle="Admin view of this reseller's account.">
      <div className="mb-5 flex items-center justify-between">
        <Link href="/admin/resellers" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
          <ArrowLeft size={14} /> All resellers
        </Link>
        <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-800 border border-amber-200 rounded-full px-3 py-1.5 text-xs">
          <ShieldAlert size={14} /> You are viewing as <strong>{r.name}</strong>
        </div>
      </div>

      <Card className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-5">
          <Avatar name={r.name} size={56} />
          <div className="flex-1">
            <div className="font-display font-bold text-xl">{r.name}</div>
            <div className="text-sm text-[var(--text-secondary)]">{r.email}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge tone="neutral">{r.plan}</Badge>
              <Badge tone={statusTone(r.status)} dot>{r.status}</Badge>
              <span className="text-xs text-[var(--text-muted)]">Joined {relTime(r.created_at)}</span>
            </div>
          </div>
          {r.status === "active" ? (
            <Button variant="outline" onClick={async () => { await api(`/admin/resellers/${r.id}/suspend`, { method: "POST" }); await load(); }}>
              Suspend
            </Button>
          ) : r.status === "suspended" ? (
            <Button onClick={async () => { await api(`/admin/resellers/${r.id}/reactivate`, { method: "POST" }); await load(); }}>
              Reactivate
            </Button>
          ) : null}
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Revenue (confirmed)" value={money(data.revenue, r.currency)} caption="lifetime" />
        <StatCard label="Orders" value={num(data.orders_count)} caption="lifetime" />
        <StatCard label="Ad clicks" value={num(data.clicks)} caption="lifetime" />
      </div>

      <Card>
        <CardHeader title="Recent orders" />
        {orders.length === 0 ? (
          <div className="text-sm text-[var(--text-secondary)] p-4">No orders yet for this reseller.</div>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {orders.slice(0, 12).map((o) => (
              <li key={o.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className="text-xs font-mono w-24 text-[var(--text-secondary)]">{o.code}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{o.customer_name || "—"}</div>
                  <div className="text-xs text-[var(--text-secondary)] truncate">{o.source ?? o.customer_phone}</div>
                </div>
                <div className="text-sm font-semibold">{money(o.amount, o.currency)}</div>
                <Badge tone={statusTone(o.status)} dot>{o.status}</Badge>
                <span className="text-xs text-[var(--text-muted)]">{shortDate(o.created_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </Shell>
  );
}
