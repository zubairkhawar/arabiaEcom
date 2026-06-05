"use client";

import { useState } from "react";
import {
  Plus,
  Phone,
  Users,
  ChevronDown,
  ChevronRight,
  Globe2,
} from "lucide-react";
import { Shell } from "@/components/layout/Shell";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Input, Select } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { poolNumbers, poolAssignments } from "@/lib/mock/numberPool";
import { cn } from "@/lib/cn";

export default function NumberPoolPage() {
  const [open, setOpen] = useState(false);
  const [expandedCountry, setExpandedCountry] = useState<string | null>("UAE");
  const [showAssignments, setShowAssignments] = useState(false);

  const byCountry: Record<string, typeof poolNumbers> = {};
  poolNumbers.forEach((n) => {
    byCountry[n.countryCode] = byCountry[n.countryCode] || [];
    byCountry[n.countryCode].push(n);
  });

  return (
    <Shell
      portal="admin"
      title="Universal Number Pool"
      subtitle="Each universal number can host up to 50 resellers. Resellers spill to the next number when one fills up."
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="inline-flex rounded-lg bg-slate-100 p-1">
          <button
            onClick={() => setShowAssignments(false)}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md",
              !showAssignments
                ? "bg-white text-[var(--text-primary)] shadow-sm"
                : "text-[var(--text-secondary)]"
            )}
          >
            Numbers by country
          </button>
          <button
            onClick={() => setShowAssignments(true)}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md",
              showAssignments
                ? "bg-white text-[var(--text-primary)] shadow-sm"
                : "text-[var(--text-secondary)]"
            )}
          >
            Assignments
          </button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" leftIcon={<Globe2 size={14} />}>
            Add country
          </Button>
          <Button leftIcon={<Plus size={14} />} onClick={() => setOpen(true)}>
            Add number
          </Button>
        </div>
      </div>

      {!showAssignments && (
        <div className="space-y-4">
          {Object.entries(byCountry).map(([code, nums]) => {
            const expanded = expandedCountry === code;
            const totalUsed = nums.reduce((s, n) => s + n.assigned, 0);
            const totalCap = nums.reduce((s, n) => s + n.capacity, 0);
            return (
              <Card key={code} padded={false}>
                <button
                  onClick={() =>
                    setExpandedCountry(expanded ? null : code)
                  }
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{nums[0].flag}</span>
                    <div className="text-left">
                      <div className="font-semibold text-[var(--text-primary)]">
                        {nums[0].country}
                      </div>
                      <div className="text-xs text-[var(--text-secondary)]">
                        {nums.length} numbers · {totalUsed} / {totalCap} resellers
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:block w-40">
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-[var(--accent)]"
                          style={{ width: `${(totalUsed / totalCap) * 100}%` }}
                        />
                      </div>
                    </div>
                    {expanded ? (
                      <ChevronDown size={18} className="text-slate-400" />
                    ) : (
                      <ChevronRight size={18} className="text-slate-400" />
                    )}
                  </div>
                </button>

                {expanded && (
                  <div className="border-t border-[var(--border)] divide-y divide-[var(--border)]">
                    {nums.map((n) => {
                      const pct = (n.assigned / n.capacity) * 100;
                      return (
                        <div
                          key={n.id}
                          className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                              <Phone size={15} />
                            </div>
                            <div className="min-w-0">
                              <div className="font-mono text-sm font-medium">{n.number}</div>
                              <div className="text-xs text-[var(--text-secondary)]">
                                {n.assigned} / {n.capacity} resellers assigned
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 sm:w-72">
                            <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${pct}%`,
                                  background:
                                    pct >= 100
                                      ? "var(--accent-violet)"
                                      : pct > 80
                                      ? "var(--warning)"
                                      : "var(--accent)",
                                }}
                              />
                            </div>
                            <Badge tone={statusTone(n.status)} dot>
                              {n.status}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                    <div className="px-5 py-3 bg-slate-50 text-xs text-[var(--text-secondary)] flex items-center gap-2">
                      <Users size={13} />
                      Spillover: when a number reaches 50/50, new resellers are auto-assigned
                      to the next active number in the same country.
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {showAssignments && (
        <Card padded={false}>
          <CardHeader
            title="Reseller assignments"
            subtitle="Who is currently routed to which pool number"
            className="px-5 pt-5"
          />
          <div className="px-2 pb-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-[var(--border)]">
                  <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                    Reseller
                  </th>
                  <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                    Country
                  </th>
                  <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                    Assigned number
                  </th>
                  <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)] text-right">
                    Number utilization
                  </th>
                </tr>
              </thead>
              <tbody>
                {poolAssignments.map((a) => {
                  const n = poolNumbers.find((x) => x.id === a.numberId)!;
                  return (
                    <tr
                      key={a.resellerId + a.numberId}
                      className="border-b border-[var(--border)] last:border-0"
                    >
                      <td className="px-3 py-3 font-medium">{a.resellerName}</td>
                      <td className="px-3 py-3">
                        <span className="mr-1.5">{n.flag}</span>
                        {n.countryCode}
                      </td>
                      <td className="px-3 py-3 font-mono text-xs">{n.number}</td>
                      <td className="px-3 py-3 text-right">
                        <span className="text-xs text-[var(--text-secondary)]">
                          {n.assigned} / {n.capacity}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add pool number"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>Add number</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="Country"
            options={[
              { value: "UAE", label: "🇦🇪 UAE" },
              { value: "PAK", label: "🇵🇰 Pakistan" },
              { value: "KSA", label: "🇸🇦 Saudi Arabia" },
              { value: "EGY", label: "🇪🇬 Egypt" },
            ]}
          />
          <Input label="Phone number" placeholder="+971 4 555 0xxx" />
          <Select
            label="Initial status"
            defaultValue="active"
            options={[
              { value: "active", label: "Active" },
              { value: "disabled", label: "Disabled (keep offline)" },
            ]}
          />
        </div>
      </Modal>
    </Shell>
  );
}
