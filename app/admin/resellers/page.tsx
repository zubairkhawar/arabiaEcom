"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Search, Eye, Ban, RotateCcw } from "lucide-react";
import { Shell } from "@/components/layout/Shell";
import { Card } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Input";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Table, type Column } from "@/components/ui/Table";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { api } from "@/lib/api";
import { relTime } from "@/lib/format";
import type { ResellerSummary } from "@/lib/types";

export default function ResellersPage() {
  const [items, setItems] = useState<ResellerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [plan, setPlan] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const rows = await api<ResellerSummary[]>("/admin/resellers");
      setItems(rows);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const rows = useMemo(
    () =>
      items.filter((r) => {
        if (plan !== "all" && r.plan !== plan) return false;
        if (statusFilter !== "all" && r.status !== statusFilter) return false;
        if (q && !`${r.name} ${r.email}`.toLowerCase().includes(q.toLowerCase())) return false;
        return true;
      }),
    [items, q, plan, statusFilter]
  );

  const suspend = async (id: string) => {
    await api(`/admin/resellers/${id}/suspend`, { method: "POST" });
    await load();
  };
  const reactivate = async (id: string) => {
    await api(`/admin/resellers/${id}/reactivate`, { method: "POST" });
    await load();
  };

  const columns: Column<ResellerSummary>[] = [
    {
      key: "name", header: "Reseller",
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
    { key: "plan", header: "Plan", render: (r) => <Badge tone="neutral">{r.plan}</Badge> },
    { key: "country", header: "Country", render: (r) => <span className="text-xs">{r.country}</span> },
    { key: "currency", header: "Currency", render: (r) => <span className="text-xs">{r.currency}</span> },
    {
      key: "status", header: "Status",
      render: (r) => <Badge tone={statusTone(r.status)} dot>{r.status}</Badge>,
    },
    {
      key: "joined", header: "Joined",
      render: (r) => <span className="text-xs text-[var(--text-secondary)]">{relTime(r.created_at)}</span>,
    },
    {
      key: "actions", header: "", align: "right",
      render: (r) => (
        <div className="flex items-center gap-1 justify-end">
          <Link href={`/admin/resellers/${r.id}`} className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded" title="View">
            <Eye size={15} />
          </Link>
          {r.status === "suspended" ? (
            <button
              onClick={() => reactivate(r.id)}
              className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded"
              title="Reactivate"
            >
              <RotateCcw size={15} />
            </button>
          ) : (
            <button
              onClick={() => suspend(r.id)}
              className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded"
              title="Suspend"
            >
              <Ban size={15} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <Shell portal="admin" title="Resellers" subtitle={`${rows.length} of ${items.length} resellers`}>
      <Card padded={false}>
        <div className="p-4 md:p-5 border-b border-[var(--border)] flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[240px]">
            <Input placeholder="Search by name or email" leftIcon={<Search size={14} />} value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="w-36">
            <Select value={plan} onChange={(e) => setPlan(e.target.value)} options={[
              { value: "all", label: "All plans" },
              { value: "silver", label: "Silver" },
              { value: "gold", label: "Gold" },
              { value: "platinum", label: "Platinum" },
            ]} />
          </div>
          <div className="w-36">
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={[
              { value: "all", label: "All statuses" },
              { value: "active", label: "Active" },
              { value: "trial", label: "Trial" },
              { value: "suspended", label: "Suspended" },
            ]} />
          </div>
        </div>
        <div className="p-2">
          {loading ? (
            <div className="text-sm text-[var(--text-secondary)] p-4">Loading…</div>
          ) : err ? (
            <div className="text-sm text-[var(--danger)] p-4">{err}</div>
          ) : rows.length === 0 ? (
            <EmptyState title="No resellers" />
          ) : (
            <Table columns={columns} rows={rows} />
          )}
        </div>
      </Card>
    </Shell>
  );
}
