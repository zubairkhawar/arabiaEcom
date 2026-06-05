"use client";

import { useState } from "react";
import { Shell } from "@/components/layout/Shell";
import { Card, CardHeader } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import { Button } from "@/components/ui/Button";
import { defaultAISettings } from "@/lib/mock/settings";
import type { AISettings } from "@/lib/mock/types";

export default function SettingsPage() {
  const [tab, setTab] = useState("general");
  const [s, setS] = useState<AISettings>(defaultAISettings);

  const tabs = [
    { id: "general", label: "General" },
    { id: "personality", label: "Personality" },
    { id: "language", label: "Language" },
    { id: "auto", label: "Auto Replies" },
    { id: "fallback", label: "Fallback" },
    { id: "hours", label: "Business Hours" },
    { id: "profile", label: "Profile / Billing" },
  ];

  return (
    <Shell
      portal="reseller"
      title="AI Settings"
      subtitle="Shape how your AI agent talks, sells, and hands off."
    >
      <Card padded={false}>
        <div className="p-5 border-b border-[var(--border)] overflow-x-auto">
          <Tabs value={tab} onChange={setTab} variant="underline" tabs={tabs} />
        </div>
        <div className="p-6 md:p-7">
          {tab === "general" && (
            <div className="grid md:grid-cols-2 gap-5 max-w-3xl">
              <Input
                label="AI Name"
                value={s.aiName}
                onChange={(e) => setS((p) => ({ ...p, aiName: e.target.value }))}
                hint="The name customers will see in chat."
              />
              <Select
                label="Tone"
                value={s.tone}
                onChange={(e) => setS((p) => ({ ...p, tone: e.target.value as AISettings["tone"] }))}
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
                  onChange={(e) => setS((p) => ({ ...p, role: e.target.value }))}
                />
              </div>
              <div>
                <span className="block mb-1.5 text-xs font-medium text-[var(--text-secondary)]">
                  Creativity ({s.creativity}%)
                </span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={s.creativity}
                  onChange={(e) => setS((p) => ({ ...p, creativity: Number(e.target.value) }))}
                  className="w-full accent-emerald-500"
                />
              </div>
              <Select
                label="Response Length"
                value={s.responseLength}
                onChange={(e) => setS((p) => ({ ...p, responseLength: e.target.value as AISettings["responseLength"] }))}
                options={[
                  { value: "Short", label: "Short" },
                  { value: "Medium", label: "Medium" },
                  { value: "Long", label: "Long" },
                ]}
              />
            </div>
          )}

          {tab === "personality" && (
            <div className="space-y-5 max-w-2xl">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {["Concise", "Warm", "Enthusiastic", "Consultative"].map((preset) => (
                  <button
                    key={preset}
                    className="rounded-xl border border-[var(--border)] hover:border-[var(--accent)] bg-white p-3 text-sm font-medium text-left"
                  >
                    <div className="text-[var(--text-primary)]">{preset}</div>
                    <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                      Persona preset
                    </div>
                  </button>
                ))}
              </div>

              <Toggle
                checked={s.alwaysSoundHuman}
                onChange={(v) => setS((p) => ({ ...p, alwaysSoundHuman: v }))}
                label="Always sound human"
                description="Strip robotic phrasing and emoji-stuffing. Reads more like a person."
              />

              <Toggle
                checked={s.convinceHesitant}
                onChange={(v) => setS((p) => ({ ...p, convinceHesitant: v }))}
                label="Convince hesitant customers"
                description="When a customer goes quiet or asks for time, the AI sends a friendly follow-up with a soft incentive."
              />

              <div>
                <span className="block mb-1.5 text-xs font-medium text-[var(--text-secondary)]">
                  Upsell aggressiveness ({s.upsellAggressiveness}%)
                </span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={s.upsellAggressiveness}
                  onChange={(e) =>
                    setS((p) => ({ ...p, upsellAggressiveness: Number(e.target.value) }))
                  }
                  className="w-full accent-emerald-500"
                />
              </div>
            </div>
          )}

          {tab === "language" && (
            <div className="space-y-5 max-w-xl">
              <Select
                label="Primary language"
                value={s.primaryLanguage}
                onChange={(e) => setS((p) => ({ ...p, primaryLanguage: e.target.value }))}
                options={[
                  { value: "English", label: "English" },
                  { value: "Arabic", label: "Arabic" },
                  { value: "Urdu", label: "Urdu" },
                ]}
              />
              <div>
                <span className="block mb-1.5 text-xs font-medium text-[var(--text-secondary)]">
                  Supported languages
                </span>
                <div className="flex flex-wrap gap-2">
                  {["English", "Arabic", "Urdu", "French", "Hindi", "Turkish"].map((l) => {
                    const on = s.supportedLanguages.includes(l);
                    return (
                      <button
                        key={l}
                        onClick={() =>
                          setS((p) => ({
                            ...p,
                            supportedLanguages: on
                              ? p.supportedLanguages.filter((x) => x !== l)
                              : [...p.supportedLanguages, l],
                          }))
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
              </div>
            </div>
          )}

          {tab === "auto" && (
            <div className="space-y-4 max-w-2xl">
              <Textarea
                label="Greeting message"
                defaultValue="Hi! Welcome to Aurora Store 👋 How can I help today?"
              />
              <Textarea
                label="Out-of-stock template"
                defaultValue="Sorry, {{product}} is out of stock. I can notify you when it's back!"
              />
              <Textarea
                label="Order confirmation"
                defaultValue="Thanks {{name}}! Your order {{orderId}} is confirmed. We'll ship within 24h."
              />
            </div>
          )}

          {tab === "fallback" && (
            <div className="space-y-5 max-w-xl">
              <Toggle
                checked={s.fallbackToHuman}
                onChange={(v) => setS((p) => ({ ...p, fallbackToHuman: v }))}
                label="Fallback to human"
                description="If the AI can't answer confidently, escalate the chat to a human agent."
              />
              <Select
                label="Escalate after"
                defaultValue="3"
                options={[
                  { value: "1", label: "1 unclear reply" },
                  { value: "2", label: "2 unclear replies" },
                  { value: "3", label: "3 unclear replies" },
                ]}
              />
              <Input label="Notify on escalation" placeholder="+971 50 ..." />
            </div>
          )}

          {tab === "hours" && (
            <div className="max-w-2xl">
              <CardHeader title="Business Hours" subtitle="When the AI should respond" />
              <div className="rounded-xl border border-[var(--border)] divide-y divide-[var(--border)]">
                {s.businessHours.map((h, i) => (
                  <div
                    key={h.day}
                    className="grid grid-cols-[80px_1fr_1fr_60px] items-center gap-3 px-4 py-3"
                  >
                    <div className="font-medium text-sm">{h.day}</div>
                    <input
                      type="time"
                      value={h.open}
                      onChange={(e) =>
                        setS((p) => {
                          const next = [...p.businessHours];
                          next[i] = { ...next[i], open: e.target.value };
                          return { ...p, businessHours: next };
                        })
                      }
                      disabled={!h.enabled}
                      className="h-9 rounded-lg border border-[var(--border)] px-3 text-sm bg-white disabled:bg-slate-50 disabled:text-slate-400"
                    />
                    <input
                      type="time"
                      value={h.close}
                      onChange={(e) =>
                        setS((p) => {
                          const next = [...p.businessHours];
                          next[i] = { ...next[i], close: e.target.value };
                          return { ...p, businessHours: next };
                        })
                      }
                      disabled={!h.enabled}
                      className="h-9 rounded-lg border border-[var(--border)] px-3 text-sm bg-white disabled:bg-slate-50 disabled:text-slate-400"
                    />
                    <Toggle
                      checked={h.enabled}
                      onChange={(v) =>
                        setS((p) => {
                          const next = [...p.businessHours];
                          next[i] = { ...next[i], enabled: v };
                          return { ...p, businessHours: next };
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "profile" && (
            <div className="max-w-2xl space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <Input label="Business name" defaultValue="Aurora Store" />
                <Input label="Owner email" defaultValue="layla@aurorastore.ae" />
                <Input label="Country" defaultValue="United Arab Emirates" />
                <Input label="Default currency" defaultValue="AED" />
              </div>
              <div className="rounded-xl bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border border-emerald-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-emerald-700 font-medium">
                      Current plan
                    </div>
                    <div className="font-display font-bold text-xl mt-0.5">Scale · AED 749/mo</div>
                    <div className="text-sm text-[var(--text-secondary)] mt-1">
                      Renews on 2026-07-01 · 3 stores · 5 universal numbers · unlimited
                      conversations.
                    </div>
                  </div>
                  <Button variant="outline">Manage</Button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-7 flex justify-end gap-2">
            <Button variant="outline">Cancel</Button>
            <Button>Save changes</Button>
          </div>
        </div>
      </Card>
    </Shell>
  );
}
