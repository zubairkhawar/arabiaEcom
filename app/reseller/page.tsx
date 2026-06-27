"use client";

import { useEffect, useState } from "react";
import {
  MessageSquare,
  ShoppingCart,
  CheckCircle2,
  TrendingUp,
  Wallet,
  ChevronDown,
  CheckCircle,
  Circle,
  Share2,
  QrCode,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { Shell } from "@/components/layout/Shell";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader } from "@/components/ui/Card";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { Avatar } from "@/components/ui/Avatar";
import { CopyField } from "@/components/ui/CopyField";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { api } from "@/lib/api";
import { useDateRange } from "@/lib/dateRange";
import { money, num, pct, relTime } from "@/lib/format";
import type { DashboardOut } from "@/lib/types";

interface ProductLite {
  id: string;
  name: string;
  slug: string;
  generated_url: string;
}

export default function ResellerDashboard() {
  const [data, setData] = useState<DashboardOut | null>(null);
  const [products, setProducts] = useState<ProductLite[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { range, label } = useDateRange();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api<DashboardOut>(`/me/dashboard?days=${range}`),
      api<ProductLite[]>("/products"),
    ])
      .then(([d, p]) => {
        setData(d);
        setProducts(p);
        if (p.length > 0 && !selectedProduct) setSelectedProduct(p[0].id);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  if (loading) {
    return (
      <Shell portal="reseller" title="Dashboard">
        <div className="text-sm text-[var(--text-secondary)]">Loading…</div>
      </Shell>
    );
  }

  if (error || !data) {
    return (
      <Shell portal="reseller" title="Dashboard">
        <div className="text-sm text-[var(--danger)]">{error || "No data"}</div>
      </Shell>
    );
  }

  const { stats, series, order_status, top_products, recent_chats, ai_performance, onboarding, currency } = data;
  const totalStatusOrders = order_status.reduce((a, b) => a + b.value, 0);
  const completed = onboarding.filter((s) => s.done).length;
  const selectedProductObj = products.find((p) => p.id === selectedProduct);

  return (
    <Shell
      portal="reseller"
      title="Dashboard"
      subtitle="Real-time view of your channels — pulled from live data."
      showFilters
    >
      {/* Onboarding banner */}
      {completed < onboarding.length && (
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-center gap-3 text-sm">
          <AlertTriangle size={16} className="text-amber-600 shrink-0" />
          <div className="flex-1 text-amber-900">
            <strong>{completed}/{onboarding.length}</strong> onboarding steps complete.
            Finish setup to unlock attribution.
          </div>
          <Link
            href="/reseller/setup"
            className="text-amber-900 underline text-xs font-medium hover:text-amber-700"
          >
            Go to Channel Setup
          </Link>
        </div>
      )}

      {/* Stat row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        <StatCard label="Total Conversations" value={num(stats.totalConversations.value)} delta={stats.totalConversations.delta} icon={<MessageSquare size={18} />} />
        <StatCard label="Orders Created" value={num(stats.ordersCreated.value)} delta={stats.ordersCreated.delta} icon={<ShoppingCart size={18} />} />
        <StatCard label="Confirmed Orders" value={num(stats.confirmedOrders.value)} delta={stats.confirmedOrders.delta} icon={<CheckCircle2 size={18} />} />
        <StatCard label="Conversion Rate" value={pct(stats.conversionRate.value)} delta={stats.conversionRate.delta} icon={<TrendingUp size={18} />} />
        <StatCard label={`Revenue (${currency})`} value={money(stats.revenue.value, currency)} delta={stats.revenue.delta} icon={<Wallet size={18} />} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader title="Conversations & Orders" subtitle={label} />
              {series.every((s) => s.conversations === 0 && s.orders === 0) ? (
                <EmptyState
                  icon={<TrendingUp />}
                  title="No traffic yet"
                  description="Share a product link to start collecting conversations and orders."
                />
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={series}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F6" vertical={false} />
                      <XAxis dataKey="day" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ border: "1px solid var(--border)", borderRadius: 10, fontSize: 12 }} />
                      <Line type="monotone" dataKey="conversations" stroke="var(--accent-violet)" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                      <Line type="monotone" dataKey="orders" stroke="var(--accent)" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="flex items-center gap-5 mt-2 text-xs text-[var(--text-secondary)]">
                <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-violet)]" />Conversations</span>
                <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)]" />Orders</span>
              </div>
            </Card>

            <Card>
              <CardHeader title="Order Status" subtitle={label} />
              {totalStatusOrders === 0 ? (
                <EmptyState icon={<ShoppingCart />} title="No orders yet" />
              ) : (
                <>
                  <div className="relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height={170}>
                      <PieChart>
                        <Pie data={order_status} innerRadius={50} outerRadius={72} paddingAngle={2} dataKey="value" stroke="none">
                          {order_status.map((c, i) => <Cell key={i} fill={c.color} />)}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <div className="text-xs text-[var(--text-secondary)]">Total</div>
                      <div className="text-xl font-bold font-display">{totalStatusOrders}</div>
                    </div>
                  </div>
                  <ul className="mt-3 space-y-1.5">
                    {order_status.map((s) => (
                      <li key={s.name} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2 text-[var(--text-secondary)]">
                          <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />{s.name}
                        </span>
                        <span className="text-[var(--text-primary)] font-medium">
                          {s.value} · {totalStatusOrders ? Math.round((s.value / totalStatusOrders) * 100) : 0}%
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader title="Top Products" />
              {top_products.length === 0 ? (
                <EmptyState icon={<ShoppingCart />} title="No sales yet" />
              ) : (
                <ul className="space-y-3">
                  {top_products.map((p) => (
                    <li key={p.product_id} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden relative shrink-0">
                        {p.image && <Image src={p.image} alt={p.name} fill sizes="40px" className="object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-[var(--text-primary)] truncate">{p.name}</div>
                        <div className="text-xs text-[var(--text-secondary)]">{p.orders} units</div>
                      </div>
                      {p.trend !== 0 && (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                          p.trend >= 0 ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "bg-[var(--danger-soft)] text-[var(--danger)]"
                        }`}>
                          {p.trend >= 0 ? "+" : ""}{p.trend.toFixed(1)}%
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card>
              <CardHeader
                title="Recent Conversations"
                action={
                  <Link href="/reseller/chats" className="text-xs font-medium text-[var(--accent)] hover:underline">View all</Link>
                }
              />
              {recent_chats.length === 0 ? (
                <EmptyState icon={<MessageSquare />} title="No chats yet" />
              ) : (
                <ul className="space-y-3">
                  {recent_chats.map((c) => (
                    <li key={c.chat_id} className="flex items-center gap-3">
                      <Avatar name={c.customer_name || c.customer_phone} size={36} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-[var(--text-primary)] truncate">
                            {c.customer_name || c.customer_phone}
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)]">
                            {c.last_message_at ? relTime(c.last_message_at) : ""}
                          </span>
                        </div>
                        <div className="text-xs text-[var(--text-secondary)] truncate">{c.last_message ?? "—"}</div>
                      </div>
                      {c.unread > 0 ? (
                        <span className="bg-[var(--accent)] text-white text-[10px] font-semibold px-1.5 rounded-full min-w-[18px] text-center">
                          {c.unread}
                        </span>
                      ) : (
                        <span className={`w-2 h-2 rounded-full ${c.mode === "ai" ? "bg-[var(--accent)]" : "bg-[var(--warning)]"}`} />
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card>
              <CardHeader title="AI Performance" subtitle={label} />
              <div className="flex justify-center mb-4">
                <ProgressRing value={ai_performance.success_rate} size={130} thickness={10} sublabel="AI Success" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-slate-50 p-3">
                  <div className="text-xs text-[var(--text-secondary)]">Handled by AI</div>
                  <div className="text-base font-semibold mt-1">{num(ai_performance.handled_by_ai.value)}</div>
                  {ai_performance.handled_by_ai.delta !== 0 && (
                    <div className={`text-[10px] font-medium ${ai_performance.handled_by_ai.delta >= 0 ? "text-[var(--accent)]" : "text-[var(--danger)]"}`}>
                      {ai_performance.handled_by_ai.delta >= 0 ? "▲" : "▼"} {Math.abs(ai_performance.handled_by_ai.delta)}%
                    </div>
                  )}
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <div className="text-xs text-[var(--text-secondary)]">Human Takeover</div>
                  <div className="text-base font-semibold mt-1">{num(ai_performance.human_takeover.value)}</div>
                  {ai_performance.human_takeover.delta !== 0 && (
                    <div className={`text-[10px] font-medium ${ai_performance.human_takeover.delta >= 0 ? "text-[var(--accent)]" : "text-[var(--danger)]"}`}>
                      {ai_performance.human_takeover.delta >= 0 ? "▲" : "▼"} {Math.abs(ai_performance.human_takeover.delta)}%
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Share Product Link" subtitle="Use this on your ad's Shop Now button" />
            {products.length === 0 ? (
              <EmptyState
                icon={<ShoppingCart />}
                title="No products yet"
                description="Add a product to generate a tracking link."
                action={
                  <Link href="/reseller/products" className="inline-flex items-center gap-2 h-9 px-3 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:bg-emerald-600">
                    Add Product
                  </Link>
                }
              />
            ) : (
              <div className="space-y-3">
                <Select
                  label="Product"
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  options={products.map((p) => ({ value: p.id, label: p.name }))}
                />
                {selectedProductObj && (
                  <>
                    <CopyField label="Tracking Link" value={selectedProductObj.generated_url} />
                    <div className="flex gap-2">
                      <a
                        href={selectedProductObj.generated_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[var(--border)] text-xs text-slate-700 hover:bg-slate-50"
                      >
                        <ExternalLink size={13} /> Open
                      </a>
                      <Button variant="outline" size="sm" leftIcon={<Share2 size={14} />}>Share</Button>
                      <Button variant="outline" size="sm" leftIcon={<QrCode size={14} />}>QR</Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </Card>

          <Card>
            <CardHeader title="Onboarding Progress" subtitle={`${completed}/${onboarding.length} completed`} />
            <div className="mb-3">
              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-[var(--accent)] rounded-full transition-all" style={{ width: `${(completed / onboarding.length) * 100}%` }} />
              </div>
            </div>
            <ul className="space-y-2.5">
              {onboarding.map((s) => (
                <li key={s.label} className="flex items-center gap-2.5 text-sm">
                  {s.done
                    ? <CheckCircle size={16} className="text-[var(--accent)] shrink-0" />
                    : <Circle size={16} className="text-slate-300 shrink-0" />}
                  <span className={s.done ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}>{s.label}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </Shell>
  );
}
