"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Shell } from "@/components/layout/Shell";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { api } from "@/lib/api";
import type { DashboardOut, TrackingOverview } from "@/lib/types";

const COUNTRY_COLORS = ["var(--accent)", "var(--accent-violet)", "var(--info)", "var(--warning)", "var(--danger)"];

export default function AnalyticsPage() {
  const [dash, setDash] = useState<DashboardOut | null>(null);
  const [tracking, setTracking] = useState<TrackingOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api<DashboardOut>("/me/dashboard"),
      api<TrackingOverview>("/tracking/overview"),
    ])
      .then(([d, t]) => { setDash(d); setTracking(t); })
      .catch((e) => setErr(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <Shell portal="reseller" title="Analytics"><div className="text-sm">Loading…</div></Shell>;
  }
  if (err || !dash || !tracking) {
    return <Shell portal="reseller" title="Analytics"><div className="text-sm text-[var(--danger)]">{err || "no data"}</div></Shell>;
  }

  const aiSplit = [
    { name: "AI handled", value: dash.ai_performance.success_rate, color: "var(--accent)" },
    { name: "Human", value: Math.max(0, 100 - dash.ai_performance.success_rate), color: "var(--warning)" },
  ];

  const platformWithData = tracking.by_platform.filter((p) => p.clicks > 0 || p.orders > 0);
  const allZero = tracking.total_clicks === 0 && tracking.total_orders === 0;

  return (
    <Shell portal="reseller" title="Analytics" subtitle="Live data from your orders, chats, and ad clicks.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader title="Conversations & Orders over time" subtitle="Last 7 days" />
          {dash.series.every((s) => s.conversations === 0 && s.orders === 0) ? (
            <EmptyState icon={<></>} title="No traffic in the last 7 days" description="Send your product link to ads to populate this chart." />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dash.series}>
                  <defs>
                    <linearGradient id="convo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--accent-violet)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="var(--accent-violet)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="ord" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F6" vertical={false} />
                  <XAxis dataKey="day" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ border: "1px solid var(--border)", borderRadius: 10, fontSize: 12 }} />
                  <Area type="monotone" dataKey="conversations" stroke="var(--accent-violet)" fill="url(#convo)" strokeWidth={2.5} />
                  <Area type="monotone" dataKey="orders" stroke="var(--accent)" fill="url(#ord)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Funnel" subtitle="Ad click → confirmed order" />
          {allZero ? (
            <EmptyState icon={<></>} title="No data yet" />
          ) : (
            (() => {
              const stages = [
                { stage: "Clicked link", value: tracking.total_clicks },
                { stage: "Orders created", value: tracking.total_orders },
                { stage: "Delivered", value: tracking.delivered },
              ];
              const max = stages[0].value || 1;
              return (
                <ul className="space-y-3">
                  {stages.map((s, idx) => {
                    const pct = (s.value / max) * 100;
                    const conv = idx === 0 ? 100 : (stages[idx - 1].value > 0 ? (s.value / stages[idx - 1].value) * 100 : 0);
                    return (
                      <li key={s.stage}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">{s.stage}</span>
                          <span className="text-[var(--text-secondary)]">{s.value.toLocaleString()} <span className="text-xs text-[var(--text-muted)]">({conv.toFixed(0)}%)</span></span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full bg-[var(--accent)] rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              );
            })()
          )}
        </Card>

        <Card>
          <CardHeader title="AI vs Human" subtitle="Chat handling split" />
          {dash.ai_performance.handled_by_ai.value + dash.ai_performance.human_takeover.value === 0 ? (
            <EmptyState icon={<></>} title="No chats yet" />
          ) : (
            <div className="flex items-center gap-6">
              <div className="w-40 h-40">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={aiSplit} dataKey="value" innerRadius={48} outerRadius={70} stroke="none">
                      {aiSplit.map((s, i) => <Cell key={i} fill={s.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="space-y-2 text-sm">
                {aiSplit.map((s) => (
                  <li key={s.name} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                    <span className="font-medium">{s.name}</span>
                    <span className="text-[var(--text-secondary)]">{s.value.toFixed(1)}%</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Top Products" subtitle={`Last 7 days · ${dash.currency}`} />
          {dash.top_products.length === 0 ? (
            <EmptyState icon={<></>} title="No sales yet" />
          ) : (
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={dash.top_products.map((p) => ({ product: p.name, orders: p.orders }))} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F6" horizontal={false} />
                  <XAxis type="number" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="product" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} width={120} />
                  <Tooltip contentStyle={{ border: "1px solid var(--border)", borderRadius: 10, fontSize: 12 }} />
                  <Bar dataKey="orders" fill="var(--accent)" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="By ad platform" subtitle="Clicks → orders → delivery" />
          {platformWithData.length === 0 ? (
            <EmptyState
              icon={<></>}
              title="No ad clicks recorded yet"
              description="Once customers click your product link from an ad, the source platform is captured automatically."
            />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--text-secondary)]">
                  <th className="px-3 py-2 font-medium">Platform</th>
                  <th className="px-3 py-2 font-medium text-right">Clicks</th>
                  <th className="px-3 py-2 font-medium text-right">Orders</th>
                  <th className="px-3 py-2 font-medium text-right">Delivered</th>
                  <th className="px-3 py-2 font-medium text-right">Returned</th>
                  <th className="px-3 py-2 font-medium text-right">Conv %</th>
                  <th className="px-3 py-2 font-medium text-right">Return %</th>
                </tr>
              </thead>
              <tbody>
                {platformWithData.map((p, i) => (
                  <tr key={p.platform} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-3 py-2 font-medium flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: COUNTRY_COLORS[i % COUNTRY_COLORS.length] }} />
                      {p.platform}
                    </td>
                    <td className="px-3 py-2 text-right">{p.clicks}</td>
                    <td className="px-3 py-2 text-right">{p.orders}</td>
                    <td className="px-3 py-2 text-right">{p.delivered}</td>
                    <td className="px-3 py-2 text-right">{p.returned}</td>
                    <td className="px-3 py-2 text-right">{p.conversion_rate.toFixed(1)}%</td>
                    <td className="px-3 py-2 text-right">{p.return_rate.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </Shell>
  );
}
