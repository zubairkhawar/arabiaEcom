"use client";

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
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { CopyField } from "@/components/ui/CopyField";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import {
  resellerStats,
  conversationsSeries,
  orderStatusBreakdown,
  topProducts,
  aiPerformance,
  onboardingSteps,
} from "@/lib/mock/dashboard";
import { chats } from "@/lib/mock/chats";
import { customerById } from "@/lib/mock/customers";
import { products } from "@/lib/mock/products";
import { money, num, pct, relTime } from "@/lib/format";

export default function ResellerDashboard() {
  const recentChats = chats.slice(0, 4);
  const totalStatusOrders = orderStatusBreakdown.reduce((a, b) => a + b.value, 0);
  const completedOnboarding = onboardingSteps.filter((s) => s.done).length;

  return (
    <Shell
      portal="reseller"
      title="Dashboard"
      subtitle="Here's what's happening across your channels today."
    >
      {/* Stat row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        <StatCard
          label="Total Conversations"
          value={num(resellerStats.totalConversations.value)}
          delta={resellerStats.totalConversations.delta}
          icon={<MessageSquare size={18} />}
        />
        <StatCard
          label="Orders Created"
          value={num(resellerStats.ordersCreated.value)}
          delta={resellerStats.ordersCreated.delta}
          icon={<ShoppingCart size={18} />}
        />
        <StatCard
          label="Confirmed Orders"
          value={num(resellerStats.confirmedOrders.value)}
          delta={resellerStats.confirmedOrders.delta}
          icon={<CheckCircle2 size={18} />}
        />
        <StatCard
          label="Conversion Rate"
          value={pct(resellerStats.conversionRate.value)}
          delta={resellerStats.conversionRate.delta}
          icon={<TrendingUp size={18} />}
        />
        <StatCard
          label="Revenue (AED)"
          value={money(resellerStats.revenue.value)}
          delta={resellerStats.revenue.delta}
          icon={<Wallet size={18} />}
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {/* Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader
                title="Conversations & Orders"
                subtitle="Daily breakdown"
                action={
                  <button className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-[var(--border)] text-xs text-slate-700 hover:bg-slate-50">
                    Last 7 Days <ChevronDown size={12} />
                  </button>
                }
              />
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={conversationsSeries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F6" vertical={false} />
                    <XAxis
                      dataKey="day"
                      stroke="#94A3B8"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#94A3B8"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        border: "1px solid var(--border)",
                        borderRadius: 10,
                        fontSize: 12,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="conversations"
                      stroke="var(--accent-violet)"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="var(--accent)"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-5 mt-2 text-xs text-[var(--text-secondary)]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-violet)]" />
                  Conversations
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)]" />
                  Orders
                </span>
              </div>
            </Card>

            <Card>
              <CardHeader title="Order Status" subtitle="Last 7 days" />
              <div className="relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height={170}>
                  <PieChart>
                    <Pie
                      data={orderStatusBreakdown}
                      innerRadius={50}
                      outerRadius={72}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {orderStatusBreakdown.map((c, i) => (
                        <Cell key={i} fill={c.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className="text-xs text-[var(--text-secondary)]">Total</div>
                  <div className="text-xl font-bold font-display">{totalStatusOrders}</div>
                </div>
              </div>
              <ul className="mt-3 space-y-1.5">
                {orderStatusBreakdown.map((s) => (
                  <li key={s.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ background: s.color }}
                      />
                      {s.name}
                    </span>
                    <span className="text-[var(--text-primary)] font-medium">
                      {s.value} · {Math.round((s.value / totalStatusOrders) * 100)}%
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader title="Top Products" />
              <ul className="space-y-3">
                {topProducts.map((p) => (
                  <li key={p.productId} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden relative shrink-0">
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[var(--text-primary)] truncate">
                        {p.name}
                      </div>
                      <div className="text-xs text-[var(--text-secondary)]">
                        {p.orders} orders
                      </div>
                    </div>
                    <Badge tone={p.trend >= 0 ? "success" : "danger"}>
                      {p.trend >= 0 ? "+" : ""}
                      {p.trend}%
                    </Badge>
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <CardHeader
                title="Recent Conversations"
                action={
                  <Link
                    href="/reseller/chats"
                    className="text-xs font-medium text-[var(--accent)] hover:underline"
                  >
                    View all
                  </Link>
                }
              />
              <ul className="space-y-3">
                {recentChats.map((c) => {
                  const cust = customerById(c.customerId);
                  if (!cust) return null;
                  const last = c.messages[c.messages.length - 1];
                  return (
                    <li key={c.id} className="flex items-center gap-3">
                      <Avatar name={cust.name} size={36} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-[var(--text-primary)] truncate">
                            {cust.name}
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)]">
                            {relTime(last.at)}
                          </span>
                        </div>
                        <div className="text-xs text-[var(--text-secondary)] truncate">
                          {last.text}
                        </div>
                      </div>
                      {c.unread > 0 ? (
                        <span className="bg-[var(--accent)] text-white text-[10px] font-semibold px-1.5 rounded-full min-w-[18px] text-center">
                          {c.unread}
                        </span>
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                      )}
                    </li>
                  );
                })}
              </ul>
            </Card>

            <Card>
              <CardHeader title="AI Performance" subtitle="Last 7 days" />
              <div className="flex justify-center mb-4">
                <ProgressRing
                  value={aiPerformance.successRate}
                  size={130}
                  thickness={10}
                  sublabel="AI Success"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-slate-50 p-3">
                  <div className="text-xs text-[var(--text-secondary)]">Handled by AI</div>
                  <div className="text-base font-semibold mt-1">
                    {num(aiPerformance.handledByAI.value)}
                  </div>
                  <div className="text-[10px] text-[var(--accent)] font-medium">
                    ▲ {aiPerformance.handledByAI.delta}%
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <div className="text-xs text-[var(--text-secondary)]">Human Takeover</div>
                  <div className="text-base font-semibold mt-1">
                    {num(aiPerformance.humanTakeover.value)}
                  </div>
                  <div className="text-[10px] text-[var(--danger)] font-medium">
                    ▼ {Math.abs(aiPerformance.humanTakeover.delta)}%
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Right rail */}
        <div className="space-y-6">
          <Card>
            <CardHeader title="Create Ad / WhatsApp Link" subtitle="Generate a tracking link in seconds" />
            <div className="space-y-3">
              <Select
                label="Product"
                options={products.map((p) => ({ value: p.id, label: p.name }))}
                defaultValue="p1"
              />
              <Select
                label="Campaign (optional)"
                options={[
                  { value: "", label: "None" },
                  { value: "summer", label: "Summer Push 2026" },
                  { value: "eid", label: "Eid Promo" },
                  { value: "tiktok", label: "TikTok Ad Set #4" },
                ]}
              />
              <CopyField
                label="Tracking Link"
                value="https://chat.arabia-ai.com/r/aurora/p/earbuds-pro?utm=summer"
              />
              <div className="flex gap-2">
                <Button variant="outline" size="sm" leftIcon={<ExternalLink size={14} />}>
                  Open
                </Button>
                <Button variant="outline" size="sm" leftIcon={<Share2 size={14} />}>
                  Share
                </Button>
                <Button variant="outline" size="sm" leftIcon={<QrCode size={14} />}>
                  QR
                </Button>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Onboarding Progress"
              subtitle={`${completedOnboarding}/${onboardingSteps.length} completed`}
            />
            <div className="mb-3">
              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-[var(--accent)] rounded-full transition-all"
                  style={{
                    width: `${(completedOnboarding / onboardingSteps.length) * 100}%`,
                  }}
                />
              </div>
            </div>
            <ul className="space-y-2.5">
              {onboardingSteps.map((s) => (
                <li key={s.label} className="flex items-center gap-2.5 text-sm">
                  {s.done ? (
                    <CheckCircle size={16} className="text-[var(--accent)] shrink-0" />
                  ) : (
                    <Circle size={16} className="text-slate-300 shrink-0" />
                  )}
                  <span
                    className={
                      s.done
                        ? "text-[var(--text-primary)]"
                        : "text-[var(--text-secondary)]"
                    }
                  >
                    {s.label}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </Shell>
  );
}
