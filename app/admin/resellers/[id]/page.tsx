"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldAlert, UserCog } from "lucide-react";
import { Shell } from "@/components/layout/Shell";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import { resellerById } from "@/lib/mock/resellers";
import { orders } from "@/lib/mock/orders";
import { chats } from "@/lib/mock/chats";
import { money, num, relTime } from "@/lib/format";
import { notFound } from "next/navigation";
import { customerById } from "@/lib/mock/customers";
import { useState } from "react";

export default function ResellerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const r = resellerById(id);
  if (!r) return notFound();
  const myOrders = orders.filter((o) => o.resellerId === r.id);
  const myChats = chats.filter((c) => c.resellerId === r.id);
  const [convince, setConvince] = useState(true);

  return (
    <Shell
      portal="admin"
      title={r.name}
      subtitle="Admin is viewing this account on behalf of the reseller."
    >
      <div className="mb-5 flex items-center justify-between">
        <Link
          href="/admin/resellers"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <ArrowLeft size={14} /> All resellers
        </Link>
        <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-800 border border-amber-200 rounded-full px-3 py-1.5 text-xs">
          <ShieldAlert size={14} /> You are viewing this portal as <strong>{r.name}</strong>
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
              <Badge tone={statusTone(r.status)} dot>
                {r.status}
              </Badge>
              {r.channels.includes("whatsapp") && <Badge tone="success">WhatsApp</Badge>}
              {r.channels.includes("shopify") && <Badge tone="violet">Shopify</Badge>}
              <span className="text-xs text-[var(--text-muted)]">
                Last active {relTime(r.lastActive)}
              </span>
            </div>
          </div>
          <Button variant="outline" leftIcon={<UserCog size={14} />}>
            Sign in as reseller
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <StatCard label="Revenue" value={money(r.revenue)} delta={18.4} icon={<></>} />
        <StatCard label="Orders" value={num(r.ordersCount)} delta={11.2} icon={<></>} />
        <StatCard label="Products" value={num(r.productsCount)} delta={4.1} icon={<></>} />
        <StatCard label="Chats (7d)" value={num(myChats.length * 18)} delta={9.7} icon={<></>} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader title="Recent orders" />
          <ul className="divide-y divide-[var(--border)]">
            {myOrders.slice(0, 8).map((o) => {
              const cust = customerById(o.customerId);
              return (
                <li key={o.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="text-xs font-mono w-20 text-[var(--text-secondary)]">
                    {o.id}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{cust?.name}</div>
                    <div className="text-xs text-[var(--text-secondary)] truncate">
                      {o.source}
                    </div>
                  </div>
                  <div className="text-sm font-semibold">{money(o.amount, o.currency)}</div>
                  <Badge tone={statusTone(o.status)} dot>
                    {o.status}
                  </Badge>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card>
          <CardHeader title="Edit reseller settings" subtitle="Admin overrides" />
          <div className="space-y-4">
            <Input label="AI name" defaultValue="Max" />
            <Select
              label="Tone"
              defaultValue="Friendly"
              options={[
                { value: "Friendly", label: "Friendly" },
                { value: "Professional", label: "Professional" },
                { value: "Playful", label: "Playful" },
                { value: "Direct", label: "Direct" },
              ]}
            />
            <Select
              label="Number type"
              defaultValue="own"
              options={[
                { value: "own", label: "Own number" },
                { value: "universal", label: "Universal pool" },
              ]}
            />
            <Input label="Monthly conversation limit" defaultValue="Unlimited" />
            <Toggle
              checked={convince}
              onChange={setConvince}
              label="Convince hesitant customers"
              description="Force-enable the persuasion behavior."
            />
            <Button className="w-full">Save overrides</Button>
          </div>
        </Card>
      </div>
    </Shell>
  );
}
