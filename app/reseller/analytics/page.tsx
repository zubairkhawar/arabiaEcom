"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronRight, Download, ExternalLink, ImageIcon } from "lucide-react";
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
import { Tabs } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { api, API_BASE, getToken } from "@/lib/api";
import { useDateRange } from "@/lib/dateRange";
import type { DashboardOut, TrackingOverview, TrackingLinksOut, LinkRow } from "@/lib/types";

const COUNTRY_COLORS = ["var(--accent)", "var(--accent-violet)", "var(--info)", "var(--warning)", "var(--danger)"];

type AnalyticsTab = "overview" | "links";

export default function AnalyticsPage() {
  const [dash, setDash] = useState<DashboardOut | null>(null);
  const [tracking, setTracking] = useState<TrackingOverview | null>(null);
  const [links, setLinks] = useState<TrackingLinksOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [tab, setTab] = useState<AnalyticsTab>("overview");
  const { range } = useDateRange();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api<DashboardOut>(`/me/dashboard?days=${range}`),
      api<TrackingOverview>(`/tracking/overview?days=${range}`),
      api<TrackingLinksOut>(`/tracking/links?days=${range}`),
    ])
      .then(([d, t, l]) => { setDash(d); setTracking(t); setLinks(l); })
      .catch((e) => setErr(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [range]);

  if (loading) {
    return <Shell portal="reseller" title="Analytics"><div className="text-sm">Loading…</div></Shell>;
  }
  if (err || !dash || !tracking || !links) {
    return <Shell portal="reseller" title="Analytics"><div className="text-sm text-[var(--danger)]">{err || "no data"}</div></Shell>;
  }

  const aiSplit = [
    { name: "AI handled", value: dash.ai_performance.success_rate, color: "var(--accent)" },
    { name: "Human", value: Math.max(0, 100 - dash.ai_performance.success_rate), color: "var(--warning)" },
  ];

  const platformWithData = tracking.by_platform.filter((p) => p.clicks > 0 || p.orders > 0);
  const allZero = tracking.total_clicks === 0 && tracking.total_orders === 0;

  const exportCsv = async () => {
    const token = getToken();
    const res = await fetch(`${API_BASE}/me/analytics/export/csv?days=${range}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics_${range}d.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Shell portal="reseller" title="Analytics" subtitle="Live data from your orders, chats, and ad clicks." showFilters>
      <div className="mb-5 flex items-center gap-3">
        <div className="flex-1">
          <Tabs
            variant="underline"
            value={tab}
            onChange={(id) => setTab(id as AnalyticsTab)}
            tabs={[
              { id: "overview", label: "Overview" },
              { id: "links", label: "Link Tracking", badge: links.rows.length || undefined },
            ]}
          />
        </div>
        <Button variant="outline" size="sm" leftIcon={<Download size={14} />} onClick={exportCsv}>
          Export CSV
        </Button>
      </div>

      {tab === "links" && <LinkTrackingPanel data={links} />}

      {tab === "overview" && (
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
      )}
    </Shell>
  );
}

function LinkTrackingPanel({ data }: { data: TrackingLinksOut }) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  if (data.rows.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<></>}
          title="No link activity in this window"
          description="Once customers click a product link, that link will show up here with click-through and order numbers."
        />
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <KPI label="Clicks" value={data.total_clicks} />
        <KPI label="Orders (attributed)" value={data.total_orders} />
        <KPI label="Delivered" value={data.total_delivered} />
        <KPI label="Returned" value={data.total_returned} />
        <KPI label="Unattributed orders" value={data.total_orders_unattributed} muted />
      </div>

      {data.total_orders_unattributed > 0 && (
        <div className="text-xs text-[var(--text-secondary)] bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          {data.total_orders_unattributed} order{data.total_orders_unattributed === 1 ? "" : "s"} in
          this window could not be attributed to a link (no click recorded — direct chats or
          imported orders). These are excluded from the per-link rows below.
        </div>
      )}

      <div className="space-y-2">
        {data.rows.map((row) => (
          <LinkRowCard
            key={row.product_id}
            row={row}
            open={openIds.has(row.product_id)}
            onToggle={() => toggle(row.product_id)}
          />
        ))}
      </div>
    </div>
  );
}

function KPI({ label, value, muted }: { label: string; value: number; muted?: boolean }) {
  return (
    <Card padded={false} className="p-4">
      <div className={`text-2xl font-bold font-display ${muted ? "text-[var(--text-secondary)]" : ""}`}>
        {value.toLocaleString()}
      </div>
      <div className="text-xs text-[var(--text-muted)] mt-0.5">{label}</div>
    </Card>
  );
}

function LinkRowCard({ row, open, onToggle }: { row: LinkRow; open: boolean; onToggle: () => void }) {
  const activeSources = useMemo(
    () => row.by_source.filter((s) => s.clicks > 0 || s.orders > 0),
    [row.by_source]
  );

  return (
    <Card padded={false} className="overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50"
        aria-expanded={open}
      >
        <span className="text-slate-400">
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
        <div className="relative w-10 h-10 rounded bg-slate-100 overflow-hidden shrink-0">
          {row.image_url ? (
            <Image src={row.image_url} alt="" fill sizes="40px" className="object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-slate-300">
              <ImageIcon size={16} />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-[var(--text-primary)] truncate">{row.product_name}</div>
          <div className="text-xs text-[var(--text-muted)] truncate">/r/{row.slug}</div>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm text-[var(--text-secondary)]">
          <Stat label="Clicks" value={row.clicks} />
          <Stat label="Orders" value={row.orders} sub={`${row.conversion_rate.toFixed(1)}%`} />
          <Stat label="Delivered" value={row.delivered} sub={`${row.delivery_rate.toFixed(1)}%`} />
          <Stat label="Returned" value={row.returned} />
        </div>
        <a
          href={row.generated_url}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-slate-400 hover:text-[var(--accent)] p-1.5 hover:bg-emerald-50 rounded"
          aria-label="Open link"
        >
          <ExternalLink size={15} />
        </a>
      </button>

      <div className="md:hidden px-4 pb-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-[var(--text-secondary)]">
        <span>Clicks <b className="text-[var(--text-primary)]">{row.clicks}</b></span>
        <span>Orders <b className="text-[var(--text-primary)]">{row.orders}</b> ({row.conversion_rate.toFixed(1)}%)</span>
        <span>Delivered <b className="text-[var(--text-primary)]">{row.delivered}</b> ({row.delivery_rate.toFixed(1)}%)</span>
        <span>Returned <b className="text-[var(--text-primary)]">{row.returned}</b></span>
      </div>

      {open && (
        <div className="border-t border-[var(--border)] bg-slate-50/50 px-4 py-3">
          {activeSources.length === 0 ? (
            <div className="text-xs text-[var(--text-muted)] py-2">No source activity in this window.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-[var(--text-secondary)]">
                  <th className="px-2 py-1.5 font-medium">Source</th>
                  <th className="px-2 py-1.5 font-medium text-right">Clicks</th>
                  <th className="px-2 py-1.5 font-medium text-right">Orders</th>
                </tr>
              </thead>
              <tbody>
                {activeSources.map((s) => (
                  <tr key={s.platform} className="border-t border-[var(--border)] first:border-0">
                    <td className="px-2 py-1.5 capitalize">{s.platform}</td>
                    <td className="px-2 py-1.5 text-right">{s.clicks}</td>
                    <td className="px-2 py-1.5 text-right">{s.orders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </Card>
  );
}

function Stat({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="text-right">
      <div className="font-semibold text-[var(--text-primary)]">{value.toLocaleString()}</div>
      <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide">
        {label}{sub && <span className="text-[var(--text-secondary)] normal-case tracking-normal ml-1">· {sub}</span>}
      </div>
    </div>
  );
}
