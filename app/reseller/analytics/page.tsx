"use client";

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
  Legend,
} from "recharts";
import { Shell } from "@/components/layout/Shell";
import { Card, CardHeader } from "@/components/ui/Card";
import { conversationsSeries } from "@/lib/mock/dashboard";

const funnel = [
  { stage: "Clicked link", value: 4820 },
  { stage: "Started chat", value: 3140 },
  { stage: "Gave details", value: 1865 },
  { stage: "Confirmed", value: 1184 },
];

const aiSplit = [
  { name: "AI handled", value: 92, color: "var(--accent)" },
  { name: "Human", value: 8, color: "var(--warning)" },
];

const revenueByProduct = [
  { product: "Earbuds Pro", revenue: 12780 },
  { product: "Projector HD", revenue: 9560 },
  { product: "Fit Watch", revenue: 7430 },
  { product: "Diffuser", revenue: 3140 },
  { product: "Desk Lamp", revenue: 2820 },
];

const revenueByCountry = [
  { country: "UAE", value: 56 },
  { country: "KSA", value: 24 },
  { country: "PAK", value: 20 },
];

const countryColors = ["var(--accent)", "var(--accent-violet)", "var(--info)"];

export default function AnalyticsPage() {
  return (
    <Shell
      portal="reseller"
      title="Analytics"
      subtitle="Track what's driving your AI-powered orders."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Conversations & Orders over time"
            subtitle="Last 7 days"
          />
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={conversationsSeries}>
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
                <Area
                  type="monotone"
                  dataKey="conversations"
                  stroke="var(--accent-violet)"
                  fill="url(#convo)"
                  strokeWidth={2.5}
                />
                <Area
                  type="monotone"
                  dataKey="orders"
                  stroke="var(--accent)"
                  fill="url(#ord)"
                  strokeWidth={2.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Conversion Funnel" subtitle="From ad click to confirmed order" />
          <ul className="space-y-3">
            {funnel.map((s, idx) => {
              const max = funnel[0].value;
              const pct = (s.value / max) * 100;
              const conv = idx === 0 ? 100 : (s.value / funnel[idx - 1].value) * 100;
              return (
                <li key={s.stage}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{s.stage}</span>
                    <span className="text-[var(--text-secondary)]">
                      {s.value.toLocaleString()}{" "}
                      <span className="text-xs text-[var(--text-muted)]">
                        ({conv.toFixed(0)}%)
                      </span>
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-[var(--accent)] rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card>
          <CardHeader title="AI vs Human" subtitle="Chat handling split" />
          <div className="flex items-center gap-6">
            <div className="w-40 h-40">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={aiSplit} dataKey="value" innerRadius={48} outerRadius={70} stroke="none">
                    {aiSplit.map((s, i) => (
                      <Cell key={i} fill={s.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="space-y-2 text-sm">
              {aiSplit.map((s) => (
                <li key={s.name} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                  <span className="font-medium">{s.name}</span>
                  <span className="text-[var(--text-secondary)]">{s.value}%</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <Card>
          <CardHeader title="Revenue by Product" subtitle="Top 5 (AED)" />
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={revenueByProduct} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F6" horizontal={false} />
                <XAxis type="number" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="product" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} width={100} />
                <Tooltip contentStyle={{ border: "1px solid var(--border)", borderRadius: 10, fontSize: 12 }} />
                <Bar dataKey="revenue" fill="var(--accent)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Revenue by Country" subtitle="Universal number routing" />
          <div className="flex items-center gap-6">
            <div className="w-40 h-40">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={revenueByCountry} dataKey="value" innerRadius={48} outerRadius={70} stroke="none">
                    {revenueByCountry.map((_, i) => (
                      <Cell key={i} fill={countryColors[i % countryColors.length]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="space-y-2 text-sm">
              {revenueByCountry.map((c, i) => (
                <li key={c.country} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: countryColors[i] }} />
                  <span className="font-medium">{c.country}</span>
                  <span className="text-[var(--text-secondary)]">{c.value}%</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>
    </Shell>
  );
}
