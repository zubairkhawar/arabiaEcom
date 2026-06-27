"use client";

import { useEffect, useState } from "react";
import {
  Users, MessageSquare, Phone, ShoppingBag, ShoppingCart, Wallet, Sparkles,
} from "lucide-react";
import Link from "next/link";
import { Shell } from "@/components/layout/Shell";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { api } from "@/lib/api";
import { money, num, pct } from "@/lib/format";
import type { AdminStatsOut } from "@/lib/types";

export default function AdminDashboard() {
  const [data, setData] = useState<AdminStatsOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api<AdminStatsOut>("/admin/stats")
      .then(setData)
      .catch((e) => setErr(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Shell portal="admin" title="Platform Dashboard"><div className="text-sm">Loading…</div></Shell>;
  if (err || !data) return <Shell portal="admin" title="Platform Dashboard"><div className="text-sm text-[var(--danger)]">{err || "no data"}</div></Shell>;

  return (
    <Shell portal="admin" title="Platform Dashboard" subtitle="Live rollup across all resellers, channels, and pool numbers." showFilters>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Resellers" value={num(data.total_resellers.value)} delta={data.total_resellers.delta} icon={<Users size={18} />} />
        <StatCard label="Active WhatsApp" value={num(data.active_whatsapp.value)} delta={data.active_whatsapp.delta} icon={<MessageSquare size={18} />} />
        <StatCard label="Active Shopify" value={num(data.active_shopify.value)} delta={data.active_shopify.delta} icon={<ShoppingBag size={18} />} />
        <StatCard label="AI Success Rate" value={pct(data.ai_success_rate.value)} delta={data.ai_success_rate.delta} icon={<Sparkles size={18} />} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Conversations" value={num(data.total_conversations.value)} delta={data.total_conversations.delta} icon={<MessageSquare size={18} />} />
        <StatCard label="Total Orders" value={num(data.total_orders.value)} delta={data.total_orders.delta} icon={<ShoppingCart size={18} />} />
        <StatCard label="Platform Revenue (AED)" value={money(data.platform_revenue.value)} delta={data.platform_revenue.delta} icon={<Wallet size={18} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Top Resellers"
            subtitle="Sorted by confirmed revenue"
            action={
              <Link href="/admin/resellers" className="text-xs font-medium text-[var(--accent)] hover:underline">View all</Link>
            }
          />
          {data.top_resellers.length === 0 ? (
            <EmptyState icon={<Users />} title="No resellers yet" />
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {data.top_resellers.map((r) => (
                <li key={r.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <Avatar name={r.name} size={36} />
                  <div className="flex-1 min-w-0">
                    <Link href={`/admin/resellers/${r.id}`} className="font-medium text-sm hover:underline truncate block">{r.name}</Link>
                    <div className="text-xs text-[var(--text-secondary)]">{r.orders} orders</div>
                  </div>
                  <Badge tone="neutral">{r.plan}</Badge>
                  <div className="text-right font-semibold text-sm w-28">{money(r.revenue)}</div>
                  <Badge tone={statusTone(r.status)} dot>{r.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Number Pool Utilization"
            subtitle="Capacity per country"
            action={
              <Link href="/admin/number-pool" className="text-xs font-medium text-[var(--accent)] hover:underline">Manage</Link>
            }
          />
          {data.pool_utilization.length === 0 ? (
            <EmptyState icon={<Phone />} title="No pool numbers" />
          ) : (
            <ul className="space-y-4">
              {data.pool_utilization.map((v) => {
                const used = v.capacity > 0 ? (v.used / v.capacity) * 100 : 0;
                return (
                  <li key={v.country_code}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="font-medium flex items-center gap-2">
                        <Phone size={14} className="text-slate-400" />{v.country_code}
                      </span>
                      <span className="text-[var(--text-secondary)]">{v.used} / {v.capacity} resellers</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{
                        width: `${used}%`,
                        background: used > 90 ? "var(--danger)" : used > 70 ? "var(--warning)" : "var(--accent)",
                      }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </Shell>
  );
}
