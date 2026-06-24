"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, X, MessageSquare, Download, Upload, Send } from "lucide-react";
import { Shell } from "@/components/layout/Shell";
import { Card } from "@/components/ui/Card";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Table, type Column } from "@/components/ui/Table";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { api, API_BASE, getToken } from "@/lib/api";
import { money, shortDate } from "@/lib/format";
import type { OrderOut, OrderStatus, DeliveryStatus } from "@/lib/types";

const DELIVERY_TONES: Record<DeliveryStatus, "neutral" | "info" | "violet" | "success" | "danger" | "warning"> = {
  pending: "neutral",
  dispatched: "info",
  in_transit: "violet",
  delivered: "success",
  returned: "danger",
  failed: "warning",
};

interface TemplateOut {
  id: string;
  name: string;
  status: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [channel, setChannel] = useState<"all" | "whatsapp" | "shopify">("all");
  const [status, setStatus] = useState<"all" | OrderStatus>("all");
  const [deliveryFilter, setDeliveryFilter] = useState<"all" | DeliveryStatus>("all");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<OrderOut | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const rows = await api<OrderOut[]>("/orders");
      setOrders(rows);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const rows = useMemo(
    () =>
      orders.filter((o) => {
        if (channel !== "all" && o.channel !== channel) return false;
        if (status !== "all" && o.status !== status) return false;
        if (deliveryFilter !== "all" && o.delivery_status !== deliveryFilter) return false;
        if (q) {
          const hay = `${o.code} ${o.customer_name ?? ""} ${o.customer_phone ?? ""}`.toLowerCase();
          if (!hay.includes(q.toLowerCase())) return false;
        }
        return true;
      }),
    [orders, channel, status, deliveryFilter, q]
  );

  const exportCsv = async () => {
    const token = getToken();
    const res = await fetch(`${API_BASE}/orders/export/csv`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "orders.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns: Column<OrderOut>[] = [
    { key: "code", header: "Order", render: (o) => <span className="font-mono text-xs">{o.code}</span>, width: "110px" },
    {
      key: "customer",
      header: "Customer",
      render: (o) => (
        <div>
          <div className="font-medium text-sm">{o.customer_name || "—"}</div>
          <div className="text-xs text-[var(--text-secondary)]">{o.customer_phone}</div>
        </div>
      ),
    },
    {
      key: "items",
      header: "Products",
      render: (o) => (
        <div className="text-sm">
          {o.items.map((i, idx) => (
            <div key={idx} className="truncate max-w-[180px]">
              <span className="text-[var(--text-muted)] mr-1">{i.qty}×</span>{i.product_name}
              {i.variant_label && <span className="text-[var(--text-muted)] ml-1">({i.variant_label})</span>}
            </div>
          ))}
        </div>
      ),
    },
    { key: "amount", header: "Amount", render: (o) => <span className="font-semibold">{money(o.amount, o.currency)}</span>, align: "right" },
    { key: "channel", header: "Channel", render: (o) => <Badge tone={o.channel === "whatsapp" ? "success" : "violet"} dot>{o.channel}</Badge> },
    { key: "status", header: "Status", render: (o) => <Badge tone={statusTone(o.status)} dot>{o.status}</Badge> },
    {
      key: "delivery",
      header: "Delivery",
      render: (o) => <Badge tone={DELIVERY_TONES[o.delivery_status]}>{o.delivery_status.replace("_", " ")}</Badge>,
    },
    {
      key: "tracking",
      header: "Tracking",
      render: (o) => <span className="text-xs text-[var(--text-secondary)] font-mono">{o.tracking_number ?? "—"}</span>,
    },
    {
      key: "src",
      header: "Source",
      render: (o) => o.source_platform ? <Badge tone="info">{o.source_platform}</Badge> : <span className="text-xs text-[var(--text-muted)]">—</span>,
    },
    {
      key: "follow_up",
      header: "Follow-up",
      render: (o) => o.follow_up_sent_at ? <Badge tone="success" dot>Sent</Badge> : (o.delivery_status === "returned" ? <Badge tone="warning" dot>Due</Badge> : <span className="text-xs text-[var(--text-muted)]">—</span>),
    },
    { key: "created", header: "Created", render: (o) => <span className="text-xs text-[var(--text-secondary)]">{shortDate(o.created_at)}</span> },
  ];

  return (
    <Shell portal="reseller" title="Orders" subtitle={`${rows.length} of ${orders.length} orders`}>
      <Card padded={false}>
        <div className="p-4 md:p-5 border-b border-[var(--border)] flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[220px]">
            <Input
              placeholder="Search order code, customer name or phone"
              leftIcon={<Search size={14} />}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="w-36"><Select value={channel} onChange={(e) => setChannel(e.target.value as typeof channel)} options={[
            { value: "all", label: "All channels" }, { value: "whatsapp", label: "WhatsApp" }, { value: "shopify", label: "Shopify" },
          ]} /></div>
          <div className="w-36"><Select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} options={[
            { value: "all", label: "All statuses" }, { value: "confirmed", label: "Confirmed" }, { value: "hold", label: "Hold" },
            { value: "processing", label: "Processing" }, { value: "cancelled", label: "Cancelled" },
          ]} /></div>
          <div className="w-36"><Select value={deliveryFilter} onChange={(e) => setDeliveryFilter(e.target.value as typeof deliveryFilter)} options={[
            { value: "all", label: "All deliveries" },
            { value: "pending", label: "Pending" },
            { value: "dispatched", label: "Dispatched" },
            { value: "in_transit", label: "In Transit" },
            { value: "delivered", label: "Delivered" },
            { value: "returned", label: "Returned" },
            { value: "failed", label: "Failed" },
          ]} /></div>
          <Button variant="outline" size="sm" leftIcon={<Upload size={14} />} onClick={() => setImportOpen(true)}>Import</Button>
          <Button variant="outline" size="sm" leftIcon={<Download size={14} />} onClick={exportCsv}>Export</Button>
        </div>

        <div className="p-2">
          {loading ? (
            <div className="text-sm text-[var(--text-secondary)] p-4">Loading…</div>
          ) : rows.length === 0 ? (
            <EmptyState
              icon={<MessageSquare />}
              title="No orders yet"
              description="When the AI confirms a customer order, it'll show up here."
            />
          ) : (
            <Table columns={columns} rows={rows.map((r) => ({ ...r, id: r.id }))} onRowClick={(r) => setSelected(r)} />
          )}
        </div>
      </Card>

      {selected && (
        <OrderDrawer
          order={selected}
          onClose={() => setSelected(null)}
          onSaved={async () => { await load(); setSelected(null); }}
        />
      )}

      {importOpen && (
        <ImportModal
          onClose={() => setImportOpen(false)}
          onDone={async () => { await load(); setImportOpen(false); }}
        />
      )}
    </Shell>
  );
}

function OrderDrawer({ order, onClose, onSaved }: { order: OrderOut; onClose: () => void; onSaved: () => void }) {
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [delivery, setDelivery] = useState<DeliveryStatus>(order.delivery_status);
  const [tracking, setTracking] = useState(order.tracking_number ?? "");
  const [templates, setTemplates] = useState<TemplateOut[]>([]);
  const [tplId, setTplId] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  useEffect(() => {
    api<TemplateOut[]>("/templates").then(setTemplates).catch(() => {});
  }, []);

  const approved = templates.filter((t) => t.status === "approved");

  const save = async () => {
    setBusy(true);
    setErr(null);
    setOk(null);
    try {
      await api(`/orders/${order.id}`, {
        method: "PATCH",
        body: { status, delivery_status: delivery, tracking_number: tracking || null },
      });
      setOk("Saved.");
      setTimeout(onSaved, 300);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  const sendFollowUp = async () => {
    if (!tplId) return;
    setBusy(true);
    setErr(null);
    setOk(null);
    try {
      await api(`/orders/${order.id}/follow-up`, {
        method: "POST",
        body: { template_id: tplId },
      });
      setOk("Follow-up sent.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Send failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="absolute inset-0 bg-slate-900/30" onClick={onClose} />
      <div className="ml-auto relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col">
        <header className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <div>
            <div className="text-xs text-[var(--text-secondary)]">Order</div>
            <div className="font-display font-bold text-lg">{order.code}</div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 p-1 rounded hover:bg-slate-100"><X size={18} /></button>
        </header>

        <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin">
          <section>
            <h4 className="text-xs uppercase tracking-wide text-[var(--text-secondary)] mb-2">Customer</h4>
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="font-medium">{order.customer_name || "Unknown"}</div>
              <div className="text-sm text-[var(--text-secondary)]">{order.customer_phone}</div>
              {order.customer_address && typeof order.customer_address.raw === "string" && (
                <div className="text-sm text-[var(--text-secondary)] mt-1">{order.customer_address.raw as string}</div>
              )}
            </div>
          </section>

          <section>
            <h4 className="text-xs uppercase tracking-wide text-[var(--text-secondary)] mb-2">Items</h4>
            <ul className="rounded-xl border border-[var(--border)] divide-y divide-[var(--border)]">
              {order.items.map((i) => (
                <li key={i.id} className="px-4 py-3 flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium">{i.product_name}</div>
                    <div className="text-xs text-[var(--text-secondary)]">
                      Qty {i.qty} · {money(i.unit_price, order.currency)} each
                      {i.variant_label && <> · {i.variant_label}</>}
                    </div>
                  </div>
                  <div className="font-semibold">{money(i.line_total, order.currency)}</div>
                </li>
              ))}
            </ul>
            <div className="flex justify-between mt-3 px-4 text-sm">
              <span className="text-[var(--text-secondary)]">Total</span>
              <span className="font-bold font-display text-base">{money(order.amount, order.currency)}</span>
            </div>
          </section>

          {order.source_platform && (
            <section>
              <h4 className="text-xs uppercase tracking-wide text-[var(--text-secondary)] mb-2">Attribution</h4>
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-900">
                ✓ Attributed to <strong>{order.source_platform}</strong> ad click
                {order.purchase_event_sent && <div className="text-xs mt-1 text-emerald-700">Purchase event sent to Meta CAPI</div>}
              </div>
            </section>
          )}

          <section>
            <h4 className="text-xs uppercase tracking-wide text-[var(--text-secondary)] mb-2">Order status</h4>
            <Select value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)} options={[
              { value: "processing", label: "Processing" },
              { value: "confirmed", label: "Confirmed" },
              { value: "hold", label: "Hold" },
              { value: "cancelled", label: "Cancelled" },
            ]} />
          </section>

          <section>
            <h4 className="text-xs uppercase tracking-wide text-[var(--text-secondary)] mb-2">Delivery status</h4>
            <Select value={delivery} onChange={(e) => setDelivery(e.target.value as DeliveryStatus)} options={[
              { value: "pending", label: "Pending" },
              { value: "dispatched", label: "Dispatched" },
              { value: "in_transit", label: "In Transit" },
              { value: "delivered", label: "Delivered" },
              { value: "returned", label: "Returned" },
              { value: "failed", label: "Failed" },
            ]} />
            <div className="mt-3">
              <Input
                label="Tracking number"
                value={tracking}
                onChange={(e) => setTracking(e.target.value)}
                placeholder="TR-12345"
              />
            </div>
          </section>

          <section>
            <h4 className="text-xs uppercase tracking-wide text-[var(--text-secondary)] mb-2">Send follow-up</h4>
            {approved.length === 0 ? (
              <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                No approved templates yet.
              </div>
            ) : (
              <div className="space-y-2">
                <Select
                  value={tplId}
                  onChange={(e) => setTplId(e.target.value)}
                  options={[{ value: "", label: "Select template…" }, ...approved.map((t) => ({ value: t.id, label: t.name }))]}
                />
                <Button onClick={sendFollowUp} disabled={!tplId || busy} leftIcon={<Send size={14} />}>
                  Send follow-up
                </Button>
              </div>
            )}
          </section>

          {err && <div className="text-sm text-[var(--danger)] bg-[var(--danger-soft)] border border-red-200 rounded-lg px-3 py-2">{err}</div>}
          {ok && <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">{ok}</div>}
        </div>

        <footer className="p-4 border-t border-[var(--border)] flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Close</Button>
          <Button className="flex-1" onClick={save} disabled={busy}>{busy ? "Saving…" : "Save"}</Button>
        </footer>
      </div>
    </div>
  );
}

function ImportModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ updated: number; not_found: number; errors: { row: number; error: string }[] } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const upload = async () => {
    if (!file) return;
    setBusy(true);
    setErr(null);
    try {
      const token = getToken();
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${API_BASE}/orders/import/csv`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.detail ?? `HTTP ${res.status}`);
      setResult(body);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Import orders CSV"
      footer={
        result ? (
          <Button onClick={onDone}>Done</Button>
        ) : (
          <>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={upload} disabled={!file || busy}>{busy ? "Uploading…" : "Import"}</Button>
          </>
        )
      }
    >
      <div className="space-y-4">
        <div className="rounded-lg bg-slate-50 border border-[var(--border)] p-3 text-xs text-slate-700">
          CSV header required: <code className="font-mono">order_id,tracking_number,delivery_status</code>.
          Only existing orders will be updated.
        </div>
        <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="text-sm" />
        {err && <div className="text-sm text-[var(--danger)] bg-[var(--danger-soft)] border border-red-200 rounded-lg px-3 py-2">{err}</div>}
        {result && (
          <div className="text-sm rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-3 text-emerald-900 space-y-1">
            <div>✓ {result.updated} updated</div>
            {result.not_found > 0 && <div>· {result.not_found} not found</div>}
            {result.errors.length > 0 && (
              <details className="text-xs"><summary>{result.errors.length} parse errors</summary>
                <ul className="list-disc pl-4 mt-1">{result.errors.slice(0, 5).map((e, i) => <li key={i}>row {e.row}: {e.error}</li>)}</ul>
              </details>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
