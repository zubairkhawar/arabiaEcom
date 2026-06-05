"use client";

import { useState } from "react";
import { Plus, Trash2, Mail } from "lucide-react";
import { Shell } from "@/components/layout/Shell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Modal } from "@/components/ui/Modal";
import { Input, Select } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import { admins as seed } from "@/lib/mock/admins";
import type { AdminUser } from "@/lib/mock/types";

export default function AdminsPage() {
  const [list, setList] = useState<AdminUser[]>(seed);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ name: "", email: "", level: "Admin" as AdminUser["level"] });

  const toggle = (id: string) =>
    setList((l) => l.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)));

  const add = () => {
    if (!draft.email || !draft.name) return;
    setList((l) => [
      ...l,
      {
        id: "a" + (l.length + 1),
        name: draft.name,
        email: draft.email,
        level: draft.level,
        enabled: true,
        addedAt: new Date().toISOString().slice(0, 10),
      },
    ]);
    setDraft({ name: "", email: "", level: "Admin" });
    setOpen(false);
  };

  const remove = (id: string) => setList((l) => l.filter((a) => a.id !== id));

  return (
    <Shell
      portal="admin"
      title="Admin Access"
      subtitle="Add admin emails and toggle access per user."
    >
      <div className="flex justify-end mb-5">
        <Button leftIcon={<Plus size={14} />} onClick={() => setOpen(true)}>
          Add admin
        </Button>
      </div>

      <Card padded={false}>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-[var(--border)]">
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                Admin
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                Email
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                Level
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                Added
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)] text-right">
                Access
              </th>
              <th className="px-5 py-3.5"></th>
            </tr>
          </thead>
          <tbody>
            {list.map((a) => (
              <tr key={a.id} className="border-b border-[var(--border)] last:border-0">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={a.name} size={32} />
                    <span className="font-medium">{a.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-[var(--text-secondary)] text-sm">
                  <span className="inline-flex items-center gap-1.5">
                    <Mail size={13} className="text-slate-400" />
                    {a.email}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <Badge tone={a.level === "Owner" ? "success" : a.level === "Admin" ? "violet" : "neutral"}>
                    {a.level}
                  </Badge>
                </td>
                <td className="px-5 py-3.5 text-xs text-[var(--text-secondary)]">
                  {a.addedAt}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="inline-flex items-center gap-3">
                    <span className="text-xs text-[var(--text-secondary)]">
                      {a.enabled ? "Enabled" : "Disabled"}
                    </span>
                    <Toggle
                      checked={a.enabled}
                      onChange={() => toggle(a.id)}
                    />
                  </div>
                </td>
                <td className="px-5 py-3.5 text-right">
                  {a.level !== "Owner" && (
                    <button
                      onClick={() => remove(a.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                      title="Remove admin"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add admin"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={add}>Add admin</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Full name"
            placeholder="Jane Doe"
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
          />
          <Input
            label="Email"
            type="email"
            placeholder="jane@arabia-ai.com"
            value={draft.email}
            onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
          />
          <Select
            label="Access level"
            value={draft.level}
            onChange={(e) => setDraft((d) => ({ ...d, level: e.target.value as AdminUser["level"] }))}
            options={[
              { value: "Admin", label: "Admin — full access" },
              { value: "Support", label: "Support — read-only, can chat" },
            ]}
          />
        </div>
      </Modal>
    </Shell>
  );
}
