"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Shell } from "@/components/layout/Shell";
import { Card } from "@/components/ui/Card";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Table, type Column } from "@/components/ui/Table";
import { Input, Select } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { api } from "@/lib/api";
import { useDateRange } from "@/lib/dateRange";
import { money, shortDate } from "@/lib/format";
import type { AdminOrderRow, ResellerSummary, OrderStatus } from "@/lib/types";

export default function AllOrdersPage() {
  const [orders, setOrders] = useState<AdminOrderRow[]>([]);
  const [resellers, setResellers] = useState<ResellerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [channel, setChannel] = useState<"all" | "whatsapp" | "shopify">("all");
  const [status, setStatus] = useState<"all" | OrderStatus>("all");
  const [reseller, setReseller] = useState("all");
  const [q, setQ] = useState("");
  const { range } = useDateRange();

  useEffect(() => {
    Promise.all([api<AdminOrderRow[]>("/admin/orders"), api<ResellerSummary[]>("/admin/resellers")])
      .then(([o, r]) => { setOrders(o); setResellers(r); })
      .finally(() => setLoading(false));
  }, []);

  const rows = useMemo(
    () => {
      const cutoff = Date.now() - range * 24 * 3600 * 1000;
      return orders.filter((o) => {
        if (new Date(o.created_at).getTime() < cutoff) return false;
        if (channel !== "all" && o.channel !== channel) return false;
        if (status !== "all" && o.status !== status) return false;
        if (reseller !== "all" && o.reseller_id !== reseller) return false;
        if (q) {
          const hay = `${o.code} ${o.customer_name ?? ""} ${o.customer_phone ?? ""}`.toLowerCase();
          if (!hay.includes(q.toLowerCase())) return false;
        }
        return true;
      });
    },
    [orders, range, channel, status, reseller, q]
  );

  const columns: Column<AdminOrderRow>[] = [
    { key: "code", header: "Order", render: (o) => <span className="font-mono text-xs">{o.code}</span>, width: "110px" },
    { key: "reseller", header: "Reseller", render: (o) => <span className="text-sm font-medium">{o.reseller_name}</span> },
    {
      key: "customer", header: "Customer",
      render: (o) => (
        <div>
          <div className="text-sm">{o.customer_name || "—"}</div>
          <div className="text-xs text-[var(--text-secondary)]">{o.customer_phone}</div>
        </div>
      ),
    },
    { key: "amount", header: "Amount", render: (o) => <span className="font-semibold text-sm">{money(o.amount, o.currency)}</span>, align: "right" },
    { key: "channel", header: "Channel", render: (o) => <Badge tone={o.channel === "whatsapp" ? "success" : "violet"} dot>{o.channel}</Badge> },
    { key: "status", header: "Status", render: (o) => <Badge tone={statusTone(o.status)} dot>{o.status}</Badge> },
    { key: "delivery", header: "Delivery", render: (o) => <Badge tone="neutral">{o.delivery_status.replace("_", " ")}</Badge> },
    { key: "src", header: "Source", render: (o) => o.source_platform ? <Badge tone="info">{o.source_platform}</Badge> : <span className="text-xs">—</span> },
    { key: "created", header: "Created", render: (o) => <span className="text-xs text-[var(--text-secondary)]">{shortDate(o.created_at)}</span> },
  ];

  return (
    <Shell portal="admin" title="All Orders" subtitle={`${rows.length} orders across ${resellers.length} resellers`} showFilters>
      <Card padded={false}>
        <div className="p-4 md:p-5 border-b border-[var(--border)] flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[220px]">
            <Input placeholder="Search code, customer name or phone" leftIcon={<Search size={14} />} value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="w-44"><Select value={reseller} onChange={(e) => setReseller(e.target.value)} options={[
            { value: "all", label: "All resellers" },
            ...resellers.map((r) => ({ value: r.id, label: r.name })),
          ]} /></div>
          <div className="w-36"><Select value={channel} onChange={(e) => setChannel(e.target.value as typeof channel)} options={[
            { value: "all", label: "All channels" }, { value: "whatsapp", label: "WhatsApp" }, { value: "shopify", label: "Shopify" },
          ]} /></div>
          <div className="w-36"><Select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} options={[
            { value: "all", label: "All statuses" },
            { value: "confirmed", label: "Confirmed" }, { value: "hold", label: "Hold" },
            { value: "processing", label: "Processing" }, { value: "cancelled", label: "Cancelled" },
          ]} /></div>
        </div>
        <div className="p-2">
          {loading ? (
            <div className="text-sm text-[var(--text-secondary)] p-4">Loading…</div>
          ) : rows.length === 0 ? (
            <EmptyState title="No orders" />
          ) : (
            <Table columns={columns} rows={rows} />
          )}
        </div>
      </Card>
    </Shell>
  );
}
