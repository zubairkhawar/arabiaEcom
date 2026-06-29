"use client";

import { useEffect, useState } from "react";
import { Bot, Clock, User } from "lucide-react";
import { Shell } from "@/components/layout/Shell";
import { Card } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import type { AISettingsOut } from "@/lib/types";
import { useRole } from "@/lib/role";

export default function SettingsPage() {
  const [tab, setTab] = useState("general");
  const [s, setS] = useState<AISettingsOut | null>(null);
  const [original, setOriginal] = useState<AISettingsOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const { profile } = useRole();

  useEffect(() => {
    api<AISettingsOut>("/me/ai-settings")
      .then((d) => { setS(d); setOriginal(d); })
      .catch((e) => setErr(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  const update = <K extends keyof AISettingsOut>(k: K, v: AISettingsOut[K]) => {
    if (!s) return;
    setS({ ...s, [k]: v });
    setOk(null);
  };

  const save = async () => {
    if (!s) return;
    setBusy(true);
    setErr(null);
    setOk(null);
    try {
      const patch: Partial<AISettingsOut> = {};
      if (original) {
        (Object.keys(s) as (keyof AISettingsOut)[]).forEach((k) => {
          if (JSON.stringify(s[k]) !== JSON.stringify(original[k])) {
            (patch as Record<string, unknown>)[k] = s[k];
          }
        });
      }
      if (Object.keys(patch).length === 0) {
        setOk("No changes to save.");
        setBusy(false);
        return;
      }
      const next = await api<AISettingsOut>("/me/ai-settings", { method: "PATCH", body: patch });
      setS(next); setOriginal(next);
      setOk("Saved.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  const reset = () => { if (original) setS(original); };

  const tabs = [
    { id: "general", label: "General" },
    { id: "hours", label: "Business Hours" },
    { id: "profile", label: "Profile" },
  ];

  if (loading || !s) {
    return (
      <Shell portal="reseller" title="Settings">
        <div className="text-sm text-[var(--text-secondary)]">Loading…</div>
      </Shell>
    );
  }

  return (
    <Shell portal="reseller" title="Settings" subtitle="Customize how your AI greets customers, when it answers, and your account.">
      <Card padded={false}>
        <div className="p-5 border-b border-[var(--border)] overflow-x-auto">
          <Tabs value={tab} onChange={setTab} variant="underline" tabs={tabs} />
        </div>
        <div className="p-6 md:p-7">
          {tab === "general" && (
            <div className="space-y-6 max-w-3xl">
              <div className="flex items-start gap-3 text-sm text-[var(--text-secondary)]">
                <Bot size={18} className="text-emerald-600 mt-0.5 shrink-0" />
                <p>How your AI agent introduces itself and replies on WhatsApp.</p>
              </div>
              <Input
                label="AI Name"
                value={s.ai_name}
                onChange={(e) => update("ai_name", e.target.value)}
                hint="Customers see this name when chatting."
              />
              <Textarea
                label="Opening message"
                value={s.opening_message ?? ""}
                onChange={(e) => update("opening_message", e.target.value)}
                hint="The first thing the AI says to a new customer. Translated automatically into their language."
                rows={3}
              />
              <Select
                label="Reply length"
                value={s.response_length}
                onChange={(e) => update("response_length", e.target.value as AISettingsOut["response_length"])}
                options={[
                  { value: "Short", label: "Short — 1 sentence" },
                  { value: "Medium", label: "Medium — 2-3 sentences (recommended)" },
                  { value: "Long", label: "Long — full paragraphs" },
                ]}
              />
            </div>
          )}

          {tab === "hours" && (
            <div className="max-w-2xl">
              <div className="flex items-start gap-3 text-sm text-[var(--text-secondary)] mb-5">
                <Clock size={18} className="text-emerald-600 mt-0.5 shrink-0" />
                <p>When the AI should respond. Outside these hours new chats go straight to human mode.</p>
              </div>
              <div className="rounded-xl border border-[var(--border)] divide-y divide-[var(--border)]">
                {(s.business_hours ?? []).map((h, i) => (
                  <div key={h.day} className="grid grid-cols-[80px_1fr_1fr_60px] items-center gap-3 px-4 py-3">
                    <div className="font-medium text-sm">{h.day}</div>
                    <input
                      type="time"
                      value={h.open}
                      onChange={(e) => {
                        const next = [...(s.business_hours ?? [])];
                        next[i] = { ...next[i], open: e.target.value };
                        update("business_hours", next);
                      }}
                      disabled={!h.enabled}
                      className="h-9 rounded-lg border border-[var(--border)] px-3 text-sm bg-white disabled:bg-slate-50 disabled:text-slate-400"
                    />
                    <input
                      type="time"
                      value={h.close}
                      onChange={(e) => {
                        const next = [...(s.business_hours ?? [])];
                        next[i] = { ...next[i], close: e.target.value };
                        update("business_hours", next);
                      }}
                      disabled={!h.enabled}
                      className="h-9 rounded-lg border border-[var(--border)] px-3 text-sm bg-white disabled:bg-slate-50 disabled:text-slate-400"
                    />
                    <Toggle
                      checked={h.enabled}
                      onChange={(v) => {
                        const next = [...(s.business_hours ?? [])];
                        next[i] = { ...next[i], enabled: v };
                        update("business_hours", next);
                      }}
                    />
                  </div>
                ))}
              </div>
              {(s.business_hours ?? []).length === 0 && (
                <div className="rounded-lg bg-slate-50 border border-[var(--border)] p-4 text-sm text-[var(--text-secondary)] mt-3">
                  Defaulting to 24/7 — your AI will answer any time. Contact support to enforce a schedule.
                </div>
              )}
            </div>
          )}

          {tab === "profile" && (
            <div className="max-w-2xl space-y-6">
              <div className="flex items-start gap-3 text-sm text-[var(--text-secondary)]">
                <User size={18} className="text-emerald-600 mt-0.5 shrink-0" />
                <p>Your account info.</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <Input label="Business name" value={profile?.name ?? ""} readOnly />
                <Input label="Email" value={profile?.email ?? ""} readOnly />
                <Input label="Country" value={profile?.country ?? ""} readOnly />
                <Input label="Default currency" value={profile?.currency ?? ""} readOnly />
                <Input label="Plan" value={profile?.plan ?? ""} readOnly />
              </div>
              <div className="rounded-xl bg-slate-50 border border-[var(--border)] p-4 text-sm text-[var(--text-secondary)]">
                Need to change your password? Click your avatar in the top-right → <strong>Change password</strong>.
                To edit other profile fields, contact support.
              </div>
            </div>
          )}

          {err && <div className="mt-5 text-sm text-[var(--danger)] bg-[var(--danger-soft)] border border-red-200 rounded-lg px-3 py-2">{err}</div>}
          {ok && <div className="mt-5 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">{ok}</div>}

          {tab !== "profile" && (
            <div className="mt-7 flex justify-end gap-2">
              <Button variant="outline" onClick={reset} disabled={busy}>Reset</Button>
              <Button onClick={save} disabled={busy}>{busy ? "Saving…" : "Save changes"}</Button>
            </div>
          )}
        </div>
      </Card>
    </Shell>
  );
}
