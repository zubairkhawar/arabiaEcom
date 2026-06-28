"use client";

import { useEffect, useState } from "react";
import { Bot, MessageSquare, Languages, Clock, User } from "lucide-react";
import { Shell } from "@/components/layout/Shell";
import { Card, CardHeader } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import type { AISettingsOut } from "@/lib/types";
import { useRole } from "@/lib/role";

const LANGUAGES = ["English", "Arabic", "Roman Urdu", "Urdu", "Hindi", "French", "Turkish"];

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
    { id: "personality", label: "Personality" },
    { id: "language", label: "Language" },
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
    <Shell portal="reseller" title="Settings" subtitle="Customize your AI agent, business hours, and account.">
      <Card padded={false}>
        <div className="p-5 border-b border-[var(--border)] overflow-x-auto">
          <Tabs value={tab} onChange={setTab} variant="underline" tabs={tabs} />
        </div>
        <div className="p-6 md:p-7">
          {tab === "general" && (
            <div className="space-y-6 max-w-3xl">
              <div className="flex items-start gap-3 text-sm text-[var(--text-secondary)]">
                <Bot size={18} className="text-emerald-600 mt-0.5 shrink-0" />
                <p>How your AI agent introduces itself and replies to customers on WhatsApp.</p>
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <Input
                  label="AI Name"
                  value={s.ai_name}
                  onChange={(e) => update("ai_name", e.target.value)}
                  hint="Customers see this name in chat."
                />
                <Select
                  label="Tone"
                  value={s.tone}
                  onChange={(e) => update("tone", e.target.value as AISettingsOut["tone"])}
                  options={[
                    { value: "Friendly", label: "Friendly" },
                    { value: "Professional", label: "Professional" },
                    { value: "Playful", label: "Playful" },
                    { value: "Direct", label: "Direct" },
                  ]}
                />
                <div className="md:col-span-2">
                  <Textarea
                    label="AI Role / Purpose"
                    value={s.role}
                    onChange={(e) => update("role", e.target.value)}
                    hint="What you'd tell a new sales hire — your AI uses this to shape its behavior."
                  />
                </div>
                <div>
                  <span className="block mb-1.5 text-xs font-medium text-[var(--text-secondary)]">
                    Creativity ({s.creativity}%)
                  </span>
                  <input
                    type="range" min={0} max={100} value={s.creativity}
                    onChange={(e) => update("creativity", Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                  <div className="text-[11px] text-[var(--text-muted)] mt-1">
                    Lower = sticks to script. Higher = more improvisation.
                  </div>
                </div>
                <Select
                  label="Response Length"
                  value={s.response_length}
                  onChange={(e) => update("response_length", e.target.value as AISettingsOut["response_length"])}
                  options={[
                    { value: "Short", label: "Short — 1 sentence" },
                    { value: "Medium", label: "Medium — 2-3 sentences (recommended)" },
                    { value: "Long", label: "Long — full paragraphs" },
                  ]}
                />
              </div>
            </div>
          )}

          {tab === "personality" && (
            <div className="space-y-5 max-w-2xl">
              <div className="flex items-start gap-3 text-sm text-[var(--text-secondary)]">
                <MessageSquare size={18} className="text-emerald-600 mt-0.5 shrink-0" />
                <p>Fine-tune how your AI handles tone, objections, and handoffs.</p>
              </div>
              <Toggle
                checked={s.always_sound_human}
                onChange={(v) => update("always_sound_human", v)}
                label="Always sound human"
                description="Avoid robotic phrasing and emoji-stuffing — replies feel like a real person."
              />
              <Toggle
                checked={s.convince_hesitant}
                onChange={(v) => update("convince_hesitant", v)}
                label="Convince hesitant customers"
                description="When a customer goes quiet or asks for time, send a warm follow-up with a soft incentive."
              />
              <Toggle
                checked={s.fallback_to_human}
                onChange={(v) => update("fallback_to_human", v)}
                label="Escalate to human when stuck"
                description="If the AI can't answer confidently or the customer asks for a real agent, switch to human mode."
              />
              <div>
                <span className="block mb-1.5 text-xs font-medium text-[var(--text-secondary)]">
                  Upsell aggressiveness ({s.upsell_aggressiveness}%)
                </span>
                <input
                  type="range" min={0} max={100} value={s.upsell_aggressiveness}
                  onChange={(e) => update("upsell_aggressiveness", Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <div className="text-[11px] text-[var(--text-muted)] mt-1">
                  0% = never suggest extras. 100% = always pitch a bundle / upgrade.
                </div>
              </div>
            </div>
          )}

          {tab === "language" && (
            <div className="space-y-5 max-w-xl">
              <div className="flex items-start gap-3 text-sm text-[var(--text-secondary)]">
                <Languages size={18} className="text-emerald-600 mt-0.5 shrink-0" />
                <p>
                  The AI detects each customer's language automatically and replies in it.
                  Pick which languages it should be allowed to use.
                </p>
              </div>
              <Select
                label="Primary language"
                value={s.primary_language}
                onChange={(e) => update("primary_language", e.target.value)}
                options={LANGUAGES.map((l) => ({ value: l, label: l }))}
                hint="Default when customer language is unclear."
              />
              <div>
                <span className="block mb-2 text-xs font-medium text-[var(--text-secondary)]">
                  Supported languages
                </span>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map((l) => {
                    const on = s.supported_languages.includes(l);
                    return (
                      <button
                        key={l}
                        type="button"
                        onClick={() =>
                          update(
                            "supported_languages",
                            on ? s.supported_languages.filter((x) => x !== l) : [...s.supported_languages, l]
                          )
                        }
                        className={`px-3 h-8 rounded-full border text-xs font-medium ${
                          on
                            ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                            : "border-[var(--border)] bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {l}
                      </button>
                    );
                  })}
                </div>
                <div className="text-[11px] text-[var(--text-muted)] mt-2">
                  Tip: English, Arabic, and Roman Urdu are fully tested for the Gulf market.
                </div>
              </div>
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
