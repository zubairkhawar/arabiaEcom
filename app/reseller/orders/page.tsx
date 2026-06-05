"use client";

import { useState, useMemo } from "react";
import { Search, X, MessageSquare } from "lucide-react";
import { Shell } from "@/components/layout/Shell";
import { Card } from "@/components/ui/Card";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Table, type Column } from "@/components/ui/Table";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { orders } from "@/lib/mock/orders";
import { customerById } from "@/lib/mock/customers";
import { productById } from "@/lib/mock/products";
import { money, shortDate } from "@/lib/format";
import type { Order, OrderStatus } from "@/lib/mock/types";

export default function OrdersPage() {
  const [channel, setChannel] = useState<"all" | "whatsapp" | "shopify">("all");
  const [status, setStatus] = useState<"all" | OrderStatus>("all");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Order | null>(null);

  const rows = useMemo(
    () =>
      orders.filter((o) => {
        if (channel !== "all" && o.channel !== channel) return false;
        if (status !== "all" && o.status !== status) return false;
        if (q) {
          const cust = customerById(o.customerId);
          const haystack =
            `${o.id} ${cust?.name ?? ""} ${cust?.phone ?? ""}`.toLowerCase();
          if (!haystack.includes(q.toLowerCase())) return false;
        }
        return true;
      }),
    [channel, status, q]
  );

  const columns: Column<Order>[] = [
    { key: "id", header: "Order", render: (o) => <span className="font-mono text-xs">{o.id}</span>, width: "110px" },
    {
      key: "customer",
      header: "Customer",
      render: (o) => {
        const c = customerById(o.customerId);
        return (
          <div>
            <div className="font-medium text-sm">{c?.name}</div>
            <div className="text-xs text-[var(--text-secondary)]">{c?.phone}</div>
          </div>
        );
      },
    },
    {
      key: "items",
      header: "Products",
      render: (o) => (
        <div className="text-sm">
          {o.items.map((i, idx) => {
            const p = productById(i.productId);
            return (
              <div key={idx} className="truncate max-w-[200px]">
                <span className="text-[var(--text-muted)] mr-1">{i.qty}×</span>
                {p?.name}
              </div>
            );
          })}
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      render: (o) => (
        <span className="font-semibold">{money(o.amount, o.currency)}</span>
      ),
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
          {o.status[0].toUpperCase() + o.status.slice(1)}
        </Badge>
      ),
    },
    {
      key: "source",
      header: "Source",
      render: (o) => (
        <span className="text-xs text-[var(--text-secondary)]">{o.source}</span>
      ),
    },
    {
      key: "created",
      header: "Created",
      render: (o) => (
        <span className="text-xs text-[var(--text-secondary)]">
          {shortDate(o.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <Shell
      portal="reseller"
      title="Orders"
      subtitle={`${rows.length} orders matching your filters`}
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
          <div className="w-40">
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
          <div className="w-40">
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
          <Table
            columns={columns}
            rows={rows}
            onRowClick={(r) => setSelected(r)}
          />
        </div>
      </Card>

      {selected && (
        <OrderDrawer order={selected} onClose={() => setSelected(null)} />
      )}
    </Shell>
  );
}

function OrderDrawer({ order, onClose }: { order: Order; onClose: () => void }) {
  const cust = customerById(order.customerId);
  const [status, setStatus] = useState<OrderStatus>(order.status);
  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="absolute inset-0 bg-slate-900/30" onClick={onClose} />
      <div className="ml-auto relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col">
        <header className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <div>
            <div className="text-xs text-[var(--text-secondary)]">Order</div>
            <div className="font-display font-bold text-lg">{order.id}</div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 p-1 rounded hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin">
          <section>
            <h4 className="text-xs uppercase tracking-wide text-[var(--text-secondary)] mb-2">
              Customer
            </h4>
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="font-medium">{cust?.name}</div>
              <div className="text-sm text-[var(--text-secondary)]">{cust?.phone}</div>
              <div className="text-sm text-[var(--text-secondary)]">{cust?.location}</div>
            </div>
          </section>

          <section>
            <h4 className="text-xs uppercase tracking-wide text-[var(--text-secondary)] mb-2">
              Items
            </h4>
            <ul className="rounded-xl border border-[var(--border)] divide-y divide-[var(--border)]">
              {order.items.map((i, idx) => {
                const p = productById(i.productId);
                return (
                  <li
                    key={idx}
                    className="px-4 py-3 flex items-center justify-between text-sm"
                  >
                    <div>
                      <div className="font-medium">{p?.name}</div>
                      <div className="text-xs text-[var(--text-secondary)]">
                        Qty {i.qty} · {money((p?.price ?? 0), order.currency)} each
                      </div>
                    </div>
                    <div className="font-semibold">
                      {money((p?.price ?? 0) * i.qty, order.currency)}
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="flex justify-between mt-3 px-4 text-sm">
              <span className="text-[var(--text-secondary)]">Total</span>
              <span className="font-bold font-display text-base">
                {money(order.amount, order.currency)}
              </span>
            </div>
          </section>

          <section>
            <h4 className="text-xs uppercase tracking-wide text-[var(--text-secondary)] mb-2">
              Status
            </h4>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus)}
              options={[
                { value: "confirmed", label: "Confirmed" },
                { value: "hold", label: "Hold" },
                { value: "processing", label: "Processing" },
                { value: "cancelled", label: "Cancelled" },
              ]}
            />
            <div className="mt-2">
              <Badge tone={statusTone(status)} dot>
                {status[0].toUpperCase() + status.slice(1)}
              </Badge>
            </div>
          </section>

          <section>
            <h4 className="text-xs uppercase tracking-wide text-[var(--text-secondary)] mb-2">
              Source
            </h4>
            <div className="text-sm text-[var(--text-primary)]">{order.source}</div>
            {order.channel === "shopify" && (
              <div className="mt-1 text-xs text-[var(--text-secondary)]">
                Synced to Shopify storefront
              </div>
            )}
          </section>
        </div>
        <footer className="p-4 border-t border-[var(--border)] flex gap-2">
          <Button variant="outline" leftIcon={<MessageSquare size={14} />} className="flex-1">
            View conversation
          </Button>
          <Button className="flex-1">Save</Button>
        </footer>
      </div>
    </div>
  );
}
