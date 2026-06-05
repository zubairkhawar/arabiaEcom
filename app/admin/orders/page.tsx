"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Shell } from "@/components/layout/Shell";
import { Card } from "@/components/ui/Card";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Table, type Column } from "@/components/ui/Table";
import { Input, Select } from "@/components/ui/Input";
import { orders } from "@/lib/mock/orders";
import { customerById } from "@/lib/mock/customers";
import { resellers, resellerById } from "@/lib/mock/resellers";
import { productById } from "@/lib/mock/products";
import { money, shortDate } from "@/lib/format";
import type { Order, OrderStatus } from "@/lib/mock/types";

export default function AllOrdersPage() {
  const [channel, setChannel] = useState<"all" | "whatsapp" | "shopify">("all");
  const [status, setStatus] = useState<"all" | OrderStatus>("all");
  const [reseller, setReseller] = useState("all");
  const [q, setQ] = useState("");

  const rows = useMemo(
    () =>
      orders.filter((o) => {
        if (channel !== "all" && o.channel !== channel) return false;
        if (status !== "all" && o.status !== status) return false;
        if (reseller !== "all" && o.resellerId !== reseller) return false;
        if (q) {
          const c = customerById(o.customerId);
          const hay = `${o.id} ${c?.name ?? ""} ${c?.phone ?? ""}`.toLowerCase();
          if (!hay.includes(q.toLowerCase())) return false;
        }
        return true;
      }),
    [channel, status, reseller, q]
  );

  const columns: Column<Order>[] = [
    { key: "id", header: "Order", render: (o) => <span className="font-mono text-xs">{o.id}</span>, width: "110px" },
    {
      key: "reseller",
      header: "Reseller",
      render: (o) => (
        <span className="text-sm font-medium">{resellerById(o.resellerId)?.name}</span>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (o) => {
        const c = customerById(o.customerId);
        return (
          <div>
            <div className="text-sm">{c?.name}</div>
            <div className="text-xs text-[var(--text-secondary)]">{c?.phone}</div>
          </div>
        );
      },
    },
    {
      key: "items",
      header: "Items",
      render: (o) => (
        <div className="text-sm truncate max-w-[180px]">
          {o.items
            .map((i) => `${i.qty}× ${productById(i.productId)?.name}`)
            .join(", ")}
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      render: (o) => <span className="font-semibold text-sm">{money(o.amount, o.currency)}</span>,
      align: "right",
    },
    {
      key: "channel",
      header: "Channel",
      render: (o) => (
        <Badge tone={o.channel === "whatsapp" ? "success" : "violet"} dot>
          {o.channel === "whatsapp" ? "WhatsApp" : "Shopify"}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (o) => (
        <Badge tone={statusTone(o.status)} dot>
          {o.status}
        </Badge>
      ),
    },
    {
      key: "created",
      header: "Created",
      render: (o) => (
        <span className="text-xs text-[var(--text-secondary)]">{shortDate(o.createdAt)}</span>
      ),
    },
  ];

  return (
    <Shell
      portal="admin"
      title="All Orders"
      subtitle={`${rows.length} orders across ${resellers.length} resellers`}
    >
      <Card padded={false}>
        <div className="p-4 md:p-5 border-b border-[var(--border)] flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[220px]">
            <Input
              placeholder="Search order ID, customer name or phone"
              leftIcon={<Search size={14} />}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="w-44">
            <Select
              value={reseller}
              onChange={(e) => setReseller(e.target.value)}
              options={[
                { value: "all", label: "All resellers" },
                ...resellers.map((r) => ({ value: r.id, label: r.name })),
              ]}
            />
          </div>
          <div className="w-36">
            <Select
              value={channel}
              onChange={(e) => setChannel(e.target.value as typeof channel)}
              options={[
                { value: "all", label: "All channels" },
                { value: "whatsapp", label: "WhatsApp" },
                { value: "shopify", label: "Shopify" },
              ]}
            />
          </div>
          <div className="w-36">
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
              options={[
                { value: "all", label: "All statuses" },
                { value: "confirmed", label: "Confirmed" },
                { value: "hold", label: "Hold" },
                { value: "processing", label: "Processing" },
                { value: "cancelled", label: "Cancelled" },
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
