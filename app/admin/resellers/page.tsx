"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Eye, Settings, Ban } from "lucide-react";
import { Shell } from "@/components/layout/Shell";
import { Card } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Input";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Table, type Column } from "@/components/ui/Table";
import { Avatar } from "@/components/ui/Avatar";
import { resellers } from "@/lib/mock/resellers";
import { money, relTime } from "@/lib/format";
import type { Reseller } from "@/lib/mock/types";

export default function ResellersPage() {
  const [q, setQ] = useState("");
  const [plan, setPlan] = useState("all");
  const [status, setStatus] = useState("all");

  const rows = useMemo(
    () =>
      resellers.filter((r) => {
        if (plan !== "all" && r.plan !== plan) return false;
        if (status !== "all" && r.status !== status) return false;
        if (q && !`${r.name} ${r.email}`.toLowerCase().includes(q.toLowerCase()))
          return false;
        return true;
      }),
    [q, plan, status]
  );

  const columns: Column<Reseller>[] = [
    {
      key: "name",
      header: "Reseller",
      render: (r) => (
        <Link href={`/admin/resellers/${r.id}`} className="flex items-center gap-3 group">
          <Avatar name={r.name} size={36} />
          <div>
            <div className="font-medium text-sm group-hover:underline">{r.name}</div>
            <div className="text-xs text-[var(--text-secondary)]">{r.email}</div>
          </div>
        </Link>
      ),
    },
    {
      key: "plan",
      header: "Plan",
      render: (r) => <Badge tone="neutral">{r.plan}</Badge>,
    },
    {
      key: "channels",
      header: "Channels",
      render: (r) => (
        <div className="flex gap-1.5">
          {r.channels.includes("whatsapp") && <Badge tone="success">WA</Badge>}
          {r.channels.includes("shopify") && <Badge tone="violet">Shopify</Badge>}
        </div>
      ),
    },
    { key: "products", header: "Products", render: (r) => <span className="text-sm">{r.productsCount}</span>, align: "right" },
    { key: "orders", header: "Orders", render: (r) => <span className="text-sm">{r.ordersCount}</span>, align: "right" },
    {
      key: "revenue",
      header: "Revenue",
      render: (r) => <span className="font-semibold text-sm">{money(r.revenue)}</span>,
      align: "right",
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <Badge tone={statusTone(r.status)} dot>
          {r.status}
        </Badge>
      ),
    },
    {
      key: "last",
      header: "Last active",
      render: (r) => (
        <span className="text-xs text-[var(--text-secondary)]">{relTime(r.lastActive)}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (r) => (
        <div className="flex items-center gap-1 justify-end">
          <Link
            href={`/admin/resellers/${r.id}`}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded"
            title="View"
          >
            <Eye size={15} />
          </Link>
          <button className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded" title="Edit settings">
            <Settings size={15} />
          </button>
          <button className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded" title="Suspend">
            <Ban size={15} />
          </button>
        </div>
      ),
      align: "right",
    },
  ];

  return (
    <Shell
      portal="admin"
      title="Resellers"
      subtitle={`${rows.length} of ${resellers.length} resellers`}
    >
      <Card padded={false}>
        <div className="p-4 md:p-5 border-b border-[var(--border)] flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[240px]">
            <Input
              placeholder="Search by name or email"
              leftIcon={<Search size={14} />}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="w-36">
            <Select
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              options={[
                { value: "all", label: "All plans" },
                { value: "Starter", label: "Starter" },
                { value: "Growth", label: "Growth" },
                { value: "Scale", label: "Scale" },
              ]}
            />
          </div>
          <div className="w-36">
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: "all", label: "All statuses" },
                { value: "active", label: "Active" },
                { value: "trial", label: "Trial" },
                { value: "suspended", label: "Suspended" },
              ]}
            />
          </div>
        </div>
        <div className="p-2">
          <Table columns={columns} rows={rows} />
        </div>
      </Card>
    </Shell>
  );
}
