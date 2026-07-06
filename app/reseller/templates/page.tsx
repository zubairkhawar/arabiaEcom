"use client";

import { useEffect, useState } from "react";
import { Plus, RefreshCw, Send, X, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { Shell } from "@/components/layout/Shell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { api } from "@/lib/api";
import { shortDate } from "@/lib/format";
import type { TemplateOut } from "@/lib/types";

const STATUS_TONE: Record<string, "neutral" | "info" | "success" | "danger" | "warning"> = {
  pending: "neutral",
  submitted: "info",
  approved: "success",
  rejected: "danger",
  paused: "warning",
  disabled: "danger",
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  pending: <Clock size={12} />,
  submitted: <RefreshCw size={12} />,
  approved: <CheckCircle2 size={12} />,
  rejected: <AlertCircle size={12} />,
  paused: <AlertCircle size={12} />,
};

const CATEGORIES = [
  { value: "UTILITY", label: "Utility (transactional)" },
  { value: "MARKETING", label: "Marketing (promotional)" },
  { value: "AUTHENTICATION", label: "Authentication (OTP)" },
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "ar", label: "Arabic" },
  { value: "en_US", label: "English (US)" },
  { value: "en_GB", label: "English (UK)" },
];

interface TemplateFormData {
  name: string;
  category: string;
  language: string;
  header_text: string;
  body: string;
  footer_text: string;
}

const EMPTY_FORM: TemplateFormData = {
  name: "",
  category: "UTILITY",
  language: "en",
  header_text: "",
  body: "",
  footer_text: "",
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<TemplateOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<TemplateOut | null>(null);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const rows = await api<TemplateOut[]>("/templates");
      setTemplates(rows);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submitToMeta = async (id: string) => {
    setSubmitting(id);
    setErr(null);
    setOk(null);
    try {
      await api(`/templates/${id}/submit`, { method: "POST" });
      setOk("Submitted to Meta. Approval usually takes minutes to hours.");
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Submit failed");
    } finally {
      setSubmitting(null);
    }
  };

  const syncStatus = async (id: string) => {
    setSyncing(id);
    setErr(null);
    setOk(null);
    try {
      const t = await api<TemplateOut>(`/templates/${id}/sync-status`, { method: "POST" });
      setOk(`Status updated: ${t.status}`);
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Sync failed");
    } finally {
      setSyncing(null);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this template?")) return;
    await api(`/templates/${id}`, { method: "DELETE" });
    await load();
  };

  const approved = templates.filter((t) => t.status === "approved").length;
  const pending = templates.filter((t) => t.status === "pending").length;
  const submitted = templates.filter((t) => t.status === "submitted").length;

  return (
    <Shell
      portal="reseller"
      title="WhatsApp Templates"
      subtitle={`${templates.length} templates · ${approved} approved · ${submitted} awaiting review`}
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 flex-1 min-w-[280px]">
            <strong>How it works:</strong> Create a template below → click <em>Submit to Meta</em> → Meta reviews it (usually &lt;24h) → once Approved you can use it in follow-up messages.
          </div>
          <Button leftIcon={<Plus size={14} />} onClick={() => setShowCreate(true)}>New template</Button>
        </div>

        {err && <div className="text-sm text-[var(--danger)] bg-[var(--danger-soft)] border border-red-200 rounded-lg px-3 py-2">{err}</div>}
        {ok && <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">{ok}</div>}

        {loading ? (
          <div className="text-sm text-[var(--text-secondary)]">Loading…</div>
        ) : templates.length === 0 ? (
          <Card>
            <div className="py-10 text-center text-sm text-[var(--text-secondary)]">
              No templates yet. Create one to start sending follow-up messages to customers.
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {templates.map((t) => (
              <Card key={t.id} padded={false}>
                <div className="p-4 flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{t.name}</span>
                      <Badge tone={STATUS_TONE[t.status] ?? "neutral"}>
                        <span className="flex items-center gap-1">
                          {STATUS_ICON[t.status]}
                          {t.status}
                        </span>
                      </Badge>
                      <Badge tone="neutral">{t.category}</Badge>
                      <Badge tone="neutral">{t.language}</Badge>
                    </div>
                    {t.header_text && (
                      <div className="text-xs text-[var(--text-muted)] uppercase tracking-wide mb-0.5">Header</div>
                    )}
                    {t.header_text && (
                      <div className="text-sm font-medium text-[var(--text-primary)] mb-1">{t.header_text}</div>
                    )}
                    <div className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">{t.body}</div>
                    {t.footer_text && (
                      <div className="text-xs text-[var(--text-muted)] mt-1">{t.footer_text}</div>
                    )}
                    {t.rejection_reason && (
                      <div className="mt-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded px-2 py-1">
                        Rejected: {t.rejection_reason}
                      </div>
                    )}
                    {t.meta_template_name && (
                      <div className="text-[11px] text-[var(--text-muted)] mt-1.5 font-mono">
                        Meta name: {t.meta_template_name}
                        {t.meta_template_id && <span className="ml-2">· ID: {t.meta_template_id}</span>}
                      </div>
                    )}
                    <div className="text-[11px] text-[var(--text-muted)] mt-0.5">Created {shortDate(t.created_at)}</div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {t.status === "pending" && (
                      <Button
                        size="sm"
                        leftIcon={<Send size={12} />}
                        onClick={() => submitToMeta(t.id)}
                        disabled={submitting === t.id}
                      >
                        {submitting === t.id ? "Submitting…" : "Submit to Meta"}
                      </Button>
                    )}
                    {t.status === "submitted" && (
                      <Button
                        size="sm"
                        variant="outline"
                        leftIcon={<RefreshCw size={12} className={syncing === t.id ? "animate-spin" : ""} />}
                        onClick={() => syncStatus(t.id)}
                        disabled={syncing === t.id}
                      >
                        {syncing === t.id ? "Checking…" : "Check status"}
                      </Button>
                    )}
                    {t.status === "rejected" && (
                      <Button
                        size="sm"
                        onClick={() => { setEditing(t); }}
                      >
                        Edit & resubmit
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => setEditing(t)}>Edit</Button>
                    <button onClick={() => remove(t.id)} className="text-xs text-slate-400 hover:text-red-600 px-1">
                      <X size={14} />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {(showCreate || editing) && (
        <TemplateFormModal
          initial={editing}
          onClose={() => { setShowCreate(false); setEditing(null); }}
          onSaved={async () => {
            setShowCreate(false);
            setEditing(null);
            await load();
          }}
        />
      )}
    </Shell>
  );
}

function TemplateFormModal({
  initial,
  onClose,
  onSaved,
}: {
  initial: TemplateOut | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<TemplateFormData>(
    initial
      ? {
          name: initial.name,
          category: initial.category,
          language: initial.language,
          header_text: initial.header_text ?? "",
          body: initial.body,
          footer_text: initial.footer_text ?? "",
        }
      : EMPTY_FORM
  );
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const set = (k: keyof TemplateFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    setBusy(true);
    setErr(null);
    try {
      const body = {
        name: form.name,
        category: form.category,
        language: form.language,
        body: form.body,
        header_text: form.header_text || null,
        footer_text: form.footer_text || null,
      };
      if (initial) {
        await api(`/templates/${initial.id}`, { method: "PATCH", body });
      } else {
        await api("/templates", { method: "POST", body });
      }
      onSaved();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={initial ? "Edit template" : "New template"}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={busy || !form.name || !form.body}>
            {busy ? "Saving…" : initial ? "Save changes" : "Create template"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-lg bg-slate-50 border border-[var(--border)] p-3 text-xs text-slate-600 space-y-1">
          <div>Use <code className="font-mono bg-white px-1 rounded border">{"{{1}}"}</code> for the first variable, <code className="font-mono bg-white px-1 rounded border">{"{{2}}"}</code> for the second, etc.</div>
          <div>Example: <em>Hi {"{{1}}"}, your order {"{{2}}"} has been dispatched.</em></div>
        </div>

        <Input
          label="Template name (lowercase, underscores only)"
          value={form.name}
          onChange={set("name")}
          placeholder="order_dispatched"
          hint="This becomes the Meta template name. Use snake_case."
        />
        <div className="grid grid-cols-2 gap-4">
          <Select label="Category" value={form.category} onChange={set("category")} options={CATEGORIES} />
          <Select label="Language" value={form.language} onChange={set("language")} options={LANGUAGES} />
        </div>
        <Input
          label="Header text (optional)"
          value={form.header_text}
          onChange={set("header_text")}
          placeholder="Your order update"
        />
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
            Body <span className="text-[var(--danger)]">*</span>
          </label>
          <textarea
            value={form.body}
            onChange={set("body")}
            rows={5}
            placeholder={"Hi {{1}}, your order {{2}} has been dispatched and will arrive in 2-3 days."}
            className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[var(--accent)] resize-none"
          />
        </div>
        <Input
          label="Footer text (optional)"
          value={form.footer_text}
          onChange={set("footer_text")}
          placeholder="Reply STOP to unsubscribe"
        />
        {err && <div className="text-sm text-[var(--danger)] bg-[var(--danger-soft)] border border-red-200 rounded-lg px-3 py-2">{err}</div>}
      </div>
    </Modal>
  );
}
