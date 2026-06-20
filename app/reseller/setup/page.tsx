"use client";

import { useEffect, useState } from "react";
import {
  MessageCircle,
  ShoppingBag,
  Play,
  Phone,
  Globe,
  CheckCircle2,
  Info,
  HelpCircle,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { Shell } from "@/components/layout/Shell";
import { Card } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { Input, Select } from "@/components/ui/Input";
import { CopyField } from "@/components/ui/CopyField";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { api, ApiError, API_BASE } from "@/lib/api";
import { useRole } from "@/lib/role";
import { cn } from "@/lib/cn";

type NumberType = "own" | "universal";

interface MetaConfigOut {
  pixel_id: string | null;
  has_token: boolean;
  test_event_code: string | null;
  default_event: string;
  action_source: string;
  is_pixel_verified: boolean;
  is_capi_verified: boolean;
  verified: boolean;
}

interface WhatsAppConfigOut {
  number_type: NumberType;
  waba_id: string | null;
  phone_number_id: string | null;
  display_phone_number: string | null;
  has_token: boolean;
  verified: boolean;
}

export default function SetupPage() {
  const [tab, setTab] = useState("whatsapp");
  return (
    <Shell
      portal="reseller"
      title="Channel Setup"
      subtitle="Connect WhatsApp + your Meta Pixel so AI-confirmed orders attribute back to your ads."
    >
      <Card padded={false}>
        <div className="p-5 border-b border-[var(--border)]">
          <Tabs
            value={tab}
            onChange={setTab}
            variant="underline"
            tabs={[
              { id: "whatsapp", label: "WhatsApp" },
              { id: "meta", label: "Meta Pixel + CAPI" },
              { id: "shopify", label: "Shopify" },
            ]}
          />
        </div>
        <div className="p-5 md:p-7">
          {tab === "whatsapp" && <WhatsAppWizard />}
          {tab === "meta" && <MetaPixelPanel />}
          {tab === "shopify" && <ShopifyPanel />}
        </div>
      </Card>
    </Shell>
  );
}

function NumberTypeChoice({
  value,
  onChange,
}: {
  value: NumberType;
  onChange: (v: NumberType) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <button
        onClick={() => onChange("own")}
        className={cn(
          "text-left p-5 rounded-2xl border-2 transition-all",
          value === "own"
            ? "border-[var(--accent)] bg-[var(--accent-soft)]"
            : "border-[var(--border)] hover:border-slate-300"
        )}
      >
        <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
          <Phone size={18} />
        </div>
        <div className="font-semibold text-[var(--text-primary)]">Use my own number</div>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Connect your WhatsApp Business number via Meta Cloud API.
        </p>
      </button>
      <button
        onClick={() => onChange("universal")}
        className={cn(
          "text-left p-5 rounded-2xl border-2 transition-all",
          value === "universal"
            ? "border-[var(--accent)] bg-[var(--accent-soft)]"
            : "border-[var(--border)] hover:border-slate-300"
        )}
      >
        <div className="w-10 h-10 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center mb-3">
          <Globe size={18} />
        </div>
        <div className="font-semibold text-[var(--text-primary)]">Use our universal number</div>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          No setup. We auto-assign you a slot on a country-specific pool number.
        </p>
      </button>
    </div>
  );
}

function WhatsAppWizard() {
  const { profile } = useRole();
  const [cfg, setCfg] = useState<WhatsAppConfigOut | null>(null);
  const [type, setType] = useState<NumberType>("own");
  const [waba, setWaba] = useState("");
  const [pn, setPn] = useState("");
  const [display, setDisplay] = useState("");
  const [token, setToken] = useState("");
  const [verifyTok, setVerifyTok] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  useEffect(() => {
    api<WhatsAppConfigOut>("/me/wa-config")
      .then((c) => {
        setCfg(c);
        setType(c.number_type);
        setWaba(c.waba_id ?? "");
        setPn(c.phone_number_id ?? "");
        setDisplay(c.display_phone_number ?? "");
      })
      .catch((e) => setErr(e instanceof Error ? e.message : "Failed to load"));
  }, []);

  const save = async () => {
    setBusy(true);
    setErr(null);
    setOk(null);
    try {
      const next = await api<WhatsAppConfigOut>("/me/wa-config", {
        method: "PUT",
        body: {
          number_type: type,
          waba_id: type === "own" ? waba : null,
          phone_number_id: type === "own" ? pn : null,
          display_phone_number: type === "own" ? display : null,
          access_token: type === "own" && token ? token : null,
          webhook_verify_token: type === "own" && verifyTok ? verifyTok : null,
        },
      });
      setCfg(next);
      setOk(
        type === "universal"
          ? "Universal pool active — you'll be auto-assigned on first link click."
          : "WhatsApp configuration saved."
      );
      setToken("");
      setVerifyTok("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  const webhookUrl = profile
    ? `${API_BASE}/webhooks/wa/${profile.id}`
    : `${API_BASE}/webhooks/wa/{your_reseller_id}`;

  return (
    <div className="space-y-7">
      <header className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
          <MessageCircle size={20} />
        </div>
        <div>
          <h2 className="font-display font-semibold text-lg text-[var(--text-primary)]">
            Connect WhatsApp
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Step 1 — choose your number type, then we'll guide you through the rest.
          </p>
        </div>
      </header>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Step 1 · Choose number type</h3>
          {cfg?.verified && (
            <Badge tone="success" dot>
              {cfg.number_type === "own" ? "Own number connected" : "Universal pool active"}
            </Badge>
          )}
        </div>
        <NumberTypeChoice value={type} onChange={setType} />
      </div>

      {type === "own" ? (
        <div className="space-y-5">
          <div className="rounded-xl bg-slate-50 border border-[var(--border)] p-4 flex gap-3">
            <HelpCircle size={16} className="text-[var(--accent)] mt-0.5 shrink-0" />
            <div className="text-sm text-slate-700">
              Grab these from Meta Business Suite → WhatsApp Manager → API setup. After
              saving, point Meta's webhook to the URL below.
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Input label="WhatsApp Business Account ID" value={waba} onChange={(e) => setWaba(e.target.value)} placeholder="1234567890123456" />
            <Input label="Phone Number ID" value={pn} onChange={(e) => setPn(e.target.value)} placeholder="9876543210123456" />
            <Input label="Display phone (E.164)" value={display} onChange={(e) => setDisplay(e.target.value)} placeholder="+971 50 123 0001" />
            <Input
              label={cfg?.has_token ? "Permanent Access Token (leave blank to keep existing)" : "Permanent Access Token"}
              type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="EAAQ…"
            />
            <Input label="Webhook Verify Token (any secret string)" value={verifyTok} onChange={(e) => setVerifyTok(e.target.value)} placeholder="my-secret-token" />
          </div>

          <CopyField label="Set this as your Meta webhook URL" value={webhookUrl} />
        </div>
      ) : (
        <div className="rounded-xl bg-[var(--accent-soft)] border border-emerald-200 p-5 flex gap-3">
          <Info size={18} className="text-[var(--accent)] mt-0.5 shrink-0" />
          <div>
            <div className="font-semibold text-[var(--text-primary)]">No setup required</div>
            <p className="text-sm text-slate-700 mt-1">
              Customers will message a country-specific number from our pool. You'll be
              auto-assigned a slot the first time a product link is clicked.
            </p>
          </div>
        </div>
      )}

      {err && <div className="text-sm text-[var(--danger)] bg-[var(--danger-soft)] border border-red-200 rounded-lg px-3 py-2">{err}</div>}
      {ok && <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">{ok}</div>}

      <div className="flex justify-end">
        <Button onClick={save} disabled={busy}>{busy ? "Saving…" : "Save WhatsApp config"}</Button>
      </div>
    </div>
  );
}

function MetaPixelPanel() {
  const [cfg, setCfg] = useState<MetaConfigOut | null>(null);
  const [pixelId, setPixelId] = useState("");
  const [token, setToken] = useState("");
  const [testCode, setTestCode] = useState("");
  const [defaultEvent, setDefaultEvent] = useState("InitiateCheckout");
  const [actionSource, setActionSource] = useState("website");
  const [busy, setBusy] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [verifyResult, setVerifyResult] = useState<{ ok: boolean; status: number; response: string } | null>(null);

  const load = async () => {
    const c = await api<MetaConfigOut>("/me/meta-config");
    setCfg(c);
    setPixelId(c.pixel_id ?? "");
    setTestCode(c.test_event_code ?? "");
    setDefaultEvent(c.default_event);
    setActionSource(c.action_source);
  };

  useEffect(() => {
    load().catch((e) => setErr(e instanceof Error ? e.message : "Failed to load"));
  }, []);

  const save = async () => {
    setBusy(true);
    setErr(null);
    setOk(null);
    setVerifyResult(null);
    try {
      const body: Record<string, unknown> = { pixel_id: pixelId, default_event: defaultEvent, action_source: actionSource, test_event_code: testCode };
      if (token) body.capi_access_token = token;
      const next = await api<MetaConfigOut>("/me/meta-config", { method: "PUT", body });
      setCfg(next);
      setOk("Saved.");
      setToken("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    setVerifying(true);
    setErr(null);
    setOk(null);
    setVerifyResult(null);
    try {
      const r = await api<{ ok: boolean; capi_status: number; capi_response: string; verified: boolean }>(
        "/me/meta-config/verify", { method: "POST" }
      );
      setVerifyResult({ ok: r.ok, status: r.capi_status, response: r.capi_response });
      if (r.ok) {
        setOk("Verified! Meta accepted the test event.");
        await load();
      }
    } catch (e) {
      if (e instanceof ApiError && e.status === 400) {
        setErr("Save your Pixel ID and CAPI token first.");
      } else {
        setErr(e instanceof Error ? e.message : "Verify failed");
      }
    } finally {
      setVerifying(false);
    }
  };

  const disconnect = async () => {
    if (!confirm("Disconnect Meta Pixel & CAPI? Click attribution will stop.")) return;
    setBusy(true);
    try {
      await api("/me/meta-config", { method: "DELETE" });
      setCfg(null);
      setPixelId("");
      setToken("");
      setTestCode("");
      setOk("Disconnected.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Disconnect failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
          <ShieldCheck size={20} />
        </div>
        <div>
          <h2 className="font-display font-semibold text-lg">Meta Pixel + Conversions API</h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Required to attribute WhatsApp purchases back to your Meta ads.
          </p>
        </div>
      </header>

      <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900 flex gap-3">
        <AlertCircle size={16} className="mt-0.5 shrink-0" />
        <div>
          <strong>Why both:</strong> Your Pixel ID tracks ad clicks in the browser. The
          Conversions API token reports confirmed orders <em>server-side</em> — required
          because the purchase happens inside WhatsApp, not on a web page. Without the CAPI
          token, Meta sees clicks but never the conversion, breaking ad optimization.
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Input
          label="Meta Pixel ID"
          value={pixelId}
          onChange={(e) => setPixelId(e.target.value)}
          placeholder="123456789012345"
          hint="Events Manager → your dataset → Settings"
        />
        <Input
          label={cfg?.has_token ? "Conversions API Access Token (leave blank to keep existing)" : "Conversions API Access Token"}
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="EAAJ…"
          hint="Events Manager → Settings → Conversions API → Generate access token"
        />
        <Input
          label="Test Event Code (optional)"
          value={testCode}
          onChange={(e) => setTestCode(e.target.value)}
          placeholder="TEST12345"
        />
        <Select
          label="Top-of-funnel event (fired on link click)"
          value={defaultEvent}
          onChange={(e) => setDefaultEvent(e.target.value)}
          options={[
            { value: "InitiateCheckout", label: "InitiateCheckout (recommended)" },
            { value: "AddToCart", label: "AddToCart" },
            { value: "ViewContent", label: "ViewContent" },
            { value: "Lead", label: "Lead" },
          ]}
        />
        <Select
          label="CAPI action_source"
          value={actionSource}
          onChange={(e) => setActionSource(e.target.value)}
          options={[
            { value: "website", label: "website (standard)" },
            { value: "business_messaging", label: "business_messaging (CTWA accounts)" },
          ]}
        />
      </div>

      {cfg && (
        <div className="flex items-center gap-3 text-sm">
          <Badge tone={cfg.is_capi_verified ? "success" : "neutral"} dot>
            CAPI {cfg.is_capi_verified ? "verified" : cfg.has_token ? "not verified" : "no token"}
          </Badge>
          {cfg.pixel_id && <Badge tone="info">Pixel: {cfg.pixel_id}</Badge>}
        </div>
      )}

      {verifyResult && (
        <div
          className={cn(
            "text-xs rounded-lg px-3 py-2 border",
            verifyResult.ok
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          )}
        >
          Meta CAPI · HTTP {verifyResult.status} ·{" "}
          <code className="text-[11px]">{verifyResult.response.slice(0, 250)}</code>
        </div>
      )}

      {err && <div className="text-sm text-[var(--danger)] bg-[var(--danger-soft)] border border-red-200 rounded-lg px-3 py-2">{err}</div>}
      {ok && !verifyResult && <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">{ok}</div>}

      <div className="flex gap-2 justify-end pt-2">
        {cfg?.pixel_id && (
          <Button variant="outline" onClick={disconnect} disabled={busy}>
            Disconnect
          </Button>
        )}
        <Button variant="outline" onClick={verify} disabled={verifying || !cfg?.pixel_id || !cfg?.has_token}>
          {verifying ? "Verifying…" : "Verify connection"}
        </Button>
        <Button onClick={save} disabled={busy}>
          {busy ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}

function ShopifyPanel() {
  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center">
          <ShoppingBag size={20} />
        </div>
        <div>
          <h2 className="font-display font-semibold text-lg">Connect Shopify</h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Sync product catalog + order confirmation messages. (Coming next phase.)
          </p>
        </div>
      </header>
      <div className="rounded-xl bg-slate-50 border border-[var(--border)] p-5 text-sm text-slate-600">
        <div className="aspect-video rounded-xl bg-slate-900 text-white flex items-center justify-center mb-4">
          <Play size={20} className="ml-0.5 fill-current" />
        </div>
        Shopify webhook integration ships in the next backend phase. For now, products
        added manually here power the AI's answers and ad-link flow.
        <div className="mt-3">
          <Badge tone="warning">Coming soon</Badge>
        </div>
      </div>
    </div>
  );
}
