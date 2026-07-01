"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Settings2,
  Package,
  ShoppingCart,
  MessageSquare,
  BarChart3,
  Settings,
  Users,
  Phone,
  Sparkles,
  CreditCard,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRole } from "@/lib/role";
import { cn } from "@/lib/cn";
import { api } from "@/lib/api";
import type { SubscriptionOut } from "@/lib/types";
import { CreditMeter } from "@/components/billing/CreditMeter";

const resellerNav = [
  { href: "/reseller", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/reseller/setup", label: "Channel Setup", icon: Settings2 },
  { href: "/reseller/products", label: "Products", icon: Package },
  { href: "/reseller/orders", label: "Orders", icon: ShoppingCart },
  { href: "/reseller/chats", label: "Live Chats", icon: MessageSquare },
  { href: "/reseller/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/reseller/billing", label: "Billing", icon: CreditCard },
  { href: "/reseller/settings", label: "Settings", icon: Settings },
];

const adminNav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/resellers", label: "Resellers", icon: Users },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/admin/chats", label: "All Chats", icon: MessageSquare },
  { href: "/admin/orders", label: "All Orders", icon: ShoppingCart },
  { href: "/admin/number-pool", label: "Number Pool", icon: Phone },
  { href: "/admin/settings", label: "Platform Settings", icon: Settings },
];

export function Sidebar() {
  const { role } = useRole();
  const pathname = usePathname();
  const nav = role === "admin" ? adminNav : resellerNav;
  const [sub, setSub] = useState<SubscriptionOut | null>(null);

  useEffect(() => {
    if (role !== "reseller") return;
    let cancelled = false;
    api<SubscriptionOut>("/billing/me/subscription")
      .then((s) => { if (!cancelled) setSub(s); })
      .catch(() => { /* silent — sidebar shouldn't crash on billing fetch */ });
    return () => { cancelled = true; };
  }, [role, pathname]);

  return (
    <aside className="hidden lg:flex w-[250px] shrink-0 flex-col bg-[var(--bg-sidebar)] text-slate-300">
      <div className="px-5 pt-6 pb-5 flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white">
          <Sparkles size={18} />
        </div>
        <div>
          <div className="font-display font-bold text-white text-[15px] leading-tight">
            Arabia AI
          </div>
          <div className="text-[11px] text-slate-400 capitalize">{role} Portal</div>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto scrollbar-thin">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-[var(--bg-sidebar-active)] text-white"
                  : "text-slate-400 hover:text-white hover:bg-[var(--bg-sidebar-active)]/60"
              )}
            >
              <Icon size={18} className={active ? "text-[var(--accent)]" : ""} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {role === "reseller" && sub && (
        <div className="p-3">
          <CreditMeter sub={sub} />
        </div>
      )}
    </aside>
  );
}
