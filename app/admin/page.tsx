"use client";

import {
  Users,
  MessageSquare,
  Phone,
  ShoppingBag,
  ShoppingCart,
  Wallet,
  Sparkles,
} from "lucide-react";
import { Shell } from "@/components/layout/Shell";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { adminStats } from "@/lib/mock/dashboard";
import { poolNumbers } from "@/lib/mock/numberPool";
import { resellers } from "@/lib/mock/resellers";
import { money, num, pct } from "@/lib/format";
import Link from "next/link";

export default function AdminDashboard() {
  const topResellers = [...resellers].sort((a, b) => b.revenue - a.revenue).slice(0, 6);
  const byCountry: Record<string, { used: number; cap: number }> = {};
  poolNumbers.forEach((n) => {
    byCountry[n.countryCode] = byCountry[n.countryCode] || { used: 0, cap: 0 };
    byCountry[n.countryCode].used += n.assigned;
    byCountry[n.countryCode].cap += n.capacity;
  });

  return (
    <Shell
      portal="admin"
      title="Platform Dashboard"
      subtitle="Rollup across all resellers, channels, and numbers."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Resellers"
          value={num(adminStats.totalResellers.value)}
          delta={adminStats.totalResellers.delta}
          icon={<Users size={18} />}
        />
        <StatCard
          label="Active WhatsApp"
          value={num(adminStats.activeWhatsApp.value)}
          delta={adminStats.activeWhatsApp.delta}
          icon={<MessageSquare size={18} />}
        />
        <StatCard
          label="Active Shopify"
          value={num(adminStats.activeShopify.value)}
          delta={adminStats.activeShopify.delta}
          icon={<ShoppingBag size={18} />}
        />
        <StatCard
          label="AI Success Rate"
          value={pct(adminStats.aiSuccessRate.value)}
          delta={adminStats.aiSuccessRate.delta}
          icon={<Sparkles size={18} />}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Total Conversations"
          value={num(adminStats.totalConversations.value)}
          delta={adminStats.totalConversations.delta}
          icon={<MessageSquare size={18} />}
        />
        <StatCard
          label="Total Orders"
          value={num(adminStats.totalOrders.value)}
          delta={adminStats.totalOrders.delta}
          icon={<ShoppingCart size={18} />}
        />
        <StatCard
          label="Platform Revenue (AED)"
          value={money(adminStats.platformRevenue.value)}
          delta={adminStats.platformRevenue.delta}
          icon={<Wallet size={18} />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Top Resellers"
            subtitle="Sorted by revenue"
            action={
              <Link
                href="/admin/resellers"
                className="text-xs font-medium text-[var(--accent)] hover:underline"
              >
                View all
              </Link>
            }
          />
          <ul className="divide-y divide-[var(--border)]">
            {topResellers.map((r) => (
              <li key={r.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <Avatar name={r.name} size={36} />
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/admin/resellers/${r.id}`}
                    className="font-medium text-sm hover:underline truncate block"
                  >
                    {r.name}
                  </Link>
                  <div className="text-xs text-[var(--text-secondary)]">
                    {r.ordersCount} orders · {r.productsCount} products
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {r.channels.includes("whatsapp") && (
                    <Badge tone="success">WA</Badge>
                  )}
                  {r.channels.includes("shopify") && (
                    <Badge tone="violet">Shopify</Badge>
                  )}
                </div>
                <div className="text-right font-semibold text-sm w-28">
                  {money(r.revenue)}
                </div>
                <Badge tone={statusTone(r.status)} dot>
                  {r.status}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader
            title="Number Pool Utilization"
            subtitle="Capacity per country"
            action={
              <Link
                href="/admin/number-pool"
                className="text-xs font-medium text-[var(--accent)] hover:underline"
              >
                Manage
              </Link>
            }
          />
          <ul className="space-y-4">
            {Object.entries(byCountry).map(([code, v]) => {
              const pctUsed = (v.used / v.cap) * 100;
              return (
                <li key={code}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="font-medium flex items-center gap-2">
                      <Phone size={14} className="text-slate-400" /> {code}
                    </span>
                    <span className="text-[var(--text-secondary)]">
                      {v.used} / {v.cap} resellers
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pctUsed}%`,
                        background:
                          pctUsed > 90
                            ? "var(--danger)"
                            : pctUsed > 70
                            ? "var(--warning)"
                            : "var(--accent)",
                      }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </Shell>
  );
}
