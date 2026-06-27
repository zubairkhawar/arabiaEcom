"use client";

import { useEffect, useState } from "react";
import { Shell } from "@/components/layout/Shell";
import { Card, CardHeader } from "@/components/ui/Card";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";

interface PlatformSettings {
  platform_name: string;
  support_email: string | null;
  support_phone: string | null;
  default_ai_name: string;
  default_ai_tone: string;
  default_response_length: string;
  default_opening_message: string | null;
  starter_chats_cap: number;
  growth_chats_cap: number;
  scale_chats_cap: number | null;
  pool_capacity_per_number: number;
  auto_escalate_after_msgs: number;
  ai_typing_delay_ms: number;
  wa_setup_video_url: string | null;
  shopify_setup_video_url: string | null;
  ai_training_video_url: string | null;
}

export default function PlatformSettingsPage() {
  const [s, setS] = useState<PlatformSettings | null>(null);
  const [original, setOriginal] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  useEffect(() => {
    api<PlatformSettings>("/admin/platform-settings")
      .then((d) => { setS(d); setOriginal(d); })
      .catch((e) => setErr(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  const set = <K extends keyof PlatformSettings>(k: K, v: PlatformSettings[K]) => {
    if (!s) return;
    setS({ ...s, [k]: v });
    setOk(null);
  };

  const save = async () => {
    if (!s || !original) return;
    setBusy(true); setErr(null); setOk(null);
    try {
      // Send only changed fields
      const patch: Partial<PlatformSettings> = {};
      (Object.keys(s) as (keyof PlatformSettings)[]).forEach((k) => {
        if (JSON.stringify(s[k]) !== JSON.stringify(original[k])) {
          (patch as Record<string, unknown>)[k] = s[k];
        }
      });
      if (Object.keys(patch).length === 0) {
        setOk("No changes to save.");
        return;
      }
      const next = await api<PlatformSettings>("/admin/platform-settings", {
        method: "PUT", body: patch,
      });
      setS(next); setOriginal(next);
      setOk("Saved.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  const reset = () => { if (original) setS(original); };

  if (loading || !s) {
    return (
      <Shell portal="admin" title="Platform Settings">
        <div className="text-sm text-[var(--text-secondary)]">Loading…</div>
      </Shell>
    );
  }

  return (
    <Shell portal="admin" title="Platform Settings" subtitle="Global defaults applied across all resellers unless overridden.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Default AI persona" subtitle="What new resellers inherit at signup" />
          <div className="space-y-4">
            <Input label="Default AI name" value={s.default_ai_name} onChange={(e) => set("default_ai_name", e.target.value)} />
            <Select label="Default tone" value={s.default_ai_tone} onChange={(e) => set("default_ai_tone", e.target.value)} options={[
              { value: "Friendly", label: "Friendly" },
              { value: "Professional", label: "Professional" },
              { value: "Playful", label: "Playful" },
              { value: "Direct", label: "Direct" },
            ]} />
            <Select label="Default response length" value={s.default_response_length} onChange={(e) => set("default_response_length", e.target.value)} options={[
              { value: "Short", label: "Short" },
              { value: "Medium", label: "Medium" },
              { value: "Long", label: "Long" },
            ]} />
            <Textarea label="Default opening message" value={s.default_opening_message ?? ""} onChange={(e) => set("default_opening_message", e.target.value)} />
          </div>
        </Card>

        <Card>
          <CardHeader title="Branding" subtitle="Shown to resellers and customers" />
          <div className="space-y-4">
            <Input label="Platform name" value={s.platform_name} onChange={(e) => set("platform_name", e.target.value)} />
            <Input label="Support email" type="email" value={s.support_email ?? ""} onChange={(e) => set("support_email", e.target.value || null)} placeholder="support@arabia-ai.com" />
            <Input label="Support phone" value={s.support_phone ?? ""} onChange={(e) => set("support_phone", e.target.value || null)} placeholder="+971 4 555 0100" />
          </div>
        </Card>

        <Card>
          <CardHeader title="Setup guide videos" subtitle="Embedded in the reseller's Channel Setup wizards" />
          <div className="space-y-4">
            <Input label="WhatsApp setup video URL" value={s.wa_setup_video_url ?? ""} onChange={(e) => set("wa_setup_video_url", e.target.value || null)} placeholder="https://videos.arabia-ai.com/wa-meta-setup.mp4" />
            <Input label="Shopify setup video URL" value={s.shopify_setup_video_url ?? ""} onChange={(e) => set("shopify_setup_video_url", e.target.value || null)} placeholder="https://videos.arabia-ai.com/shopify-webhook.mp4" />
            <Input label="AI training video URL" value={s.ai_training_video_url ?? ""} onChange={(e) => set("ai_training_video_url", e.target.value || null)} placeholder="https://videos.arabia-ai.com/training.mp4" />
          </div>
        </Card>

        <Card>
          <CardHeader title="Limits & thresholds" subtitle="Plan caps + global behavior" />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Starter — monthly chats"
              type="number" value={s.starter_chats_cap}
              onChange={(e) => set("starter_chats_cap", parseInt(e.target.value) || 0)}
            />
            <Input
              label="Growth — monthly chats"
              type="number" value={s.growth_chats_cap}
              onChange={(e) => set("growth_chats_cap", parseInt(e.target.value) || 0)}
            />
            <Input
              label="Scale — monthly chats (blank = unlimited)"
              type="number" value={s.scale_chats_cap ?? ""}
              onChange={(e) => set("scale_chats_cap", e.target.value === "" ? null : parseInt(e.target.value))}
            />
            <Input
              label="Pool capacity per number"
              type="number" value={s.pool_capacity_per_number}
              onChange={(e) => set("pool_capacity_per_number", parseInt(e.target.value) || 50)}
            />
            <Input
              label="Auto-escalate after (msgs)"
              type="number" value={s.auto_escalate_after_msgs}
              onChange={(e) => set("auto_escalate_after_msgs", parseInt(e.target.value) || 3)}
            />
            <Input
              label="AI typing delay (ms)"
              type="number" value={s.ai_typing_delay_ms}
              onChange={(e) => set("ai_typing_delay_ms", parseInt(e.target.value) || 900)}
            />
          </div>
        </Card>
      </div>

      {err && <div className="mt-5 text-sm text-[var(--danger)] bg-[var(--danger-soft)] border border-red-200 rounded-lg px-3 py-2">{err}</div>}
      {ok && <div className="mt-5 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">{ok}</div>}

      <div className="mt-6 flex justify-end gap-2">
        <Button variant="outline" onClick={reset} disabled={busy}>Reset</Button>
        <Button onClick={save} disabled={busy}>{busy ? "Saving…" : "Save platform settings"}</Button>
      </div>
    </Shell>
  );
}
