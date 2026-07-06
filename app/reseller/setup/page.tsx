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
import { WhatsAppTutorial } from "@/components/setup/WhatsAppTutorial";
import { MetaTutorial } from "@/components/setup/MetaTutorial";
import { ShopifyTutorial } from "@/components/setup/ShopifyTutorial";
import { WhatsAppLogo, MetaLogo, ShopifyLogo } from "@/components/brand/BrandLogos";

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
  assigned_pool_number: string | null;
  assigned_pool_country: string | null;
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
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const c = await api<WhatsAppConfigOut>("/me/wa-config");
      setCfg(c);
      setType(c.number_type);
      setWaba(c.waba_id ?? "");
      setPn(c.phone_number_id ?? "");
      setDisplay(c.display_phone_number ?? "");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
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
          ? "Connected to the universal pool — your number is shown above."
          : "WhatsApp configuration saved and verified with Meta."
      );
      setToken("");
      setVerifyTok("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  const disconnect = async () => {
    if (!confirm(
      cfg?.number_type === "universal"
        ? "Disconnect from the universal pool? Your pool slot will be released."
        : "Disconnect WhatsApp? Customers won't be able to message you until you reconnect."
    )) return;
    setBusy(true);
    setErr(null);
    setOk(null);
    try {
      await api("/me/wa-config", { method: "DELETE" });
      setCfg(null);
      setType("own");
      setWaba(""); setPn(""); setDisplay(""); setToken(""); setVerifyTok("");
      setOk("Disconnected. Choose a number type to reconnect.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Disconnect failed");
    } finally {
      setBusy(false);
    }
  };

  const webhookUrl = profile
    ? `${API_BASE}/webhooks/wa/${profile.id}`
    : `${API_BASE}/webhooks/wa/{your_reseller_id}`;

  // ---- CONNECTED STATE ----
  // If reseller already has a WA config, show a summary card with disconnect.
  if (!loading && cfg?.verified) {
    const isUniversal = cfg.number_type === "universal";
    return (
      <div className="space-y-7">
        <header className="flex items-center gap-3">
          <WhatsAppLogo size={40} />
          <div>
            <h2 className="font-display font-semibold text-lg text-[var(--text-primary)]">
              WhatsApp Connected
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              {isUniversal
                ? "You're on the universal pool. To switch to your own number, disconnect first."
                : "Your own Meta WhatsApp number is connected. To switch to the universal pool, disconnect first."}
            </p>
          </div>
        </header>

        <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50/30 p-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isUniversal ? "bg-violet-100 text-violet-700" : "bg-emerald-100 text-emerald-700"
              }`}>
                {isUniversal ? <Globe size={18} /> : <Phone size={18} />}
              </div>
              <div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">
                  {isUniversal ? "Universal pool number" : "Your own WhatsApp number"}
                </div>
                <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Active · receiving customer messages
                </div>
              </div>
            </div>
            <Badge tone="success" dot>Verified</Badge>
          </div>

          <div className="space-y-3 pt-3 border-t border-emerald-200">
            {isUniversal ? (
              <>
                <Row label="Your WhatsApp number">
                  {cfg.assigned_pool_number
                    ? <span className="font-mono text-base">{cfg.assigned_pool_number}</span>
                    : <span className="text-[var(--text-secondary)] text-xs italic">Assigning…</span>}
                </Row>
                {cfg.assigned_pool_country && (
                  <Row label="Country">{cfg.assigned_pool_country}</Row>
                )}
                {cfg.assigned_pool_number && (
                  <div className="pt-2 mt-2 border-t border-emerald-200 text-xs text-[var(--text-secondary)]">
                    Test it: message <span className="font-mono text-[var(--text-primary)]">{cfg.assigned_pool_number}</span> from your phone — your AI should reply within a few seconds.
                  </div>
                )}
              </>
            ) : (
              <>
                <Row label="Display number">
                  <span className="font-mono">{cfg.display_phone_number ?? "—"}</span>
                </Row>
                <Row label="WABA ID">
                  <span className="font-mono text-xs">{cfg.waba_id ?? "—"}</span>
                </Row>
                <Row label="Phone Number ID">
                  <span className="font-mono text-xs">{cfg.phone_number_id ?? "—"}</span>
                </Row>
                <Row label="Access token">
                  {cfg.has_token ? <Badge tone="success">Stored (encrypted)</Badge> : "—"}
                </Row>
                <div>
                  <span className="block mb-1.5 text-xs font-medium text-[var(--text-secondary)]">Meta webhook URL</span>
                  <CopyField value={webhookUrl} />
                </div>
              </>
            )}
          </div>
        </div>

        {err && <div className="text-sm text-[var(--danger)] bg-[var(--danger-soft)] border border-red-200 rounded-lg px-3 py-2">{err}</div>}
        {ok && <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">{ok}</div>}

        <div className="flex justify-end">
          <Button variant="outline" onClick={disconnect} disabled={busy}>
            {busy ? "Disconnecting…" : "Disconnect"}
          </Button>
        </div>
      </div>
    );
  }

  // ---- DISCONNECTED STATE — choose-type wizard ----
  return (
    <div className="space-y-7">
      <header className="flex items-center gap-3">
        <WhatsAppLogo size={40} />
        <div>
          <h2 className="font-display font-semibold text-lg text-[var(--text-primary)]">
            Connect WhatsApp
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Step 1 — pick your number type. Only one (own or universal) can be active at a time.
          </p>
        </div>
      </header>

      <div>
        <h3 className="text-sm font-semibold mb-3">Step 1 · Choose number type</h3>
        <NumberTypeChoice value={type} onChange={setType} />
      </div>

      {type === "own" ? (
        <div className="space-y-5">
          <WhatsAppTutorial />
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="WhatsApp Business Account ID" value={waba} onChange={(e) => setWaba(e.target.value)} placeholder="1234567890123456" />
            <Input label="Phone Number ID" value={pn} onChange={(e) => setPn(e.target.value)} placeholder="9876543210123456" />
            <Input label="Display phone (E.164)" value={display} onChange={(e) => setDisplay(e.target.value)} placeholder="+971 50 123 0001" />
            <Input label="Permanent Access Token" type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="EAAQ…" />
            <Input label="Webhook Verify Token (any secret string)" value={verifyTok} onChange={(e) => setVerifyTok(e.target.value)} placeholder="my-secret-token" />
          </div>
          <CopyField label="Set this as your Meta webhook URL (after Save)" value={webhookUrl} />
        </div>
      ) : (
        <div className="rounded-xl bg-[var(--accent-soft)] border border-emerald-200 p-5 flex gap-3">
          <Info size={18} className="text-[var(--accent)] mt-0.5 shrink-0" />
          <div>
            <div className="font-semibold text-[var(--text-primary)]">No setup required</div>
            <p className="text-sm text-slate-700 mt-1">
              We'll assign you a country-specific WhatsApp number from our pool. Click
              <strong> Save</strong> and your number appears here right away.
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

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-xs text-[var(--text-secondary)] uppercase tracking-wide pt-0.5">{label}</span>
      <span className="text-sm text-[var(--text-primary)] text-right">{children}</span>
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
        <MetaLogo size={40} />
        <div>
          <h2 className="font-display font-semibold text-lg">Meta Pixel + Conversions API</h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Required to attribute WhatsApp purchases back to your Meta ads.
          </p>
        </div>
      </header>

      <MetaTutorial />

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

interface ShopifyStoreOut {
  id: string;
  name: string;
  shop_domain: string;
  api_version: string;
  verified: boolean;
  status: string;
  last_error: string | null;
  last_error_at: string | null;
  last_sync_at: string | null;
  last_orders_sync_at: string | null;
  products_synced: number;
  orders_synced: number;
}

function ShopifyStoreCard({
  s,
  onSync,
  onReconnect,
  onDisconnect,
  syncing,
}: {
  s: ShopifyStoreOut;
  onSync: (id: string) => void;
  onReconnect: (id: string, token: string) => Promise<void>;
  onDisconnect: (id: string) => void;
  syncing: string | null;
}) {
  const revoked = s.status === "revoked" || s.status === "error";
  const [showReconnect, setShowReconnect] = useState(false);
  const [newToken, setNewToken] = useState("");
  const [reconnecting, setReconnecting] = useState(false);
  const [reconnectErr, setReconnectErr] = useState<string | null>(null);

  const doReconnect = async () => {
    setReconnecting(true);
    setReconnectErr(null);
    try {
      await onReconnect(s.id, newToken);
      setShowReconnect(false);
      setNewToken("");
    } catch (e) {
      setReconnectErr(e instanceof Error ? e.message : "Reconnect failed");
    } finally {
      setReconnecting(false);
    }
  };

  return (
    <div className={cn(
      "rounded-xl border bg-white p-4 space-y-3",
      revoked ? "border-red-300" : "border-[var(--border)]"
    )}>
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <ShopifyLogo size={32} />
          <div className="min-w-0">
            <div className="font-semibold text-sm truncate">{s.name}</div>
            <div className="text-xs text-[var(--text-secondary)] truncate">
              {s.shop_domain} · API {s.api_version}
            </div>
            <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
              {s.products_synced > 0 ? `${s.products_synced} products synced` : "Not synced yet"}
              {s.last_sync_at && ` · last ${new Date(s.last_sync_at).toLocaleString()}`}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {revoked ? (
            <Badge tone="danger" dot>Token revoked</Badge>
          ) : (
            <Badge tone="success" dot>Connected</Badge>
          )}
          {!revoked && (
            <Button variant="outline" size="sm" onClick={() => onSync(s.id)} disabled={syncing === s.id}>
              {syncing === s.id ? "Syncing…" : "Sync products"}
            </Button>
          )}
          {revoked && (
            <Button size="sm" onClick={() => setShowReconnect((v) => !v)}>
              Reconnect
            </Button>
          )}
          <button onClick={() => onDisconnect(s.id)} className="text-xs text-slate-500 hover:text-red-600 px-2">
            Disconnect
          </button>
        </div>
      </div>

      {revoked && s.last_error && (
        <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {s.last_error}
          {s.last_error_at && (
            <span className="text-red-400 ml-2">· {new Date(s.last_error_at).toLocaleString()}</span>
          )}
        </div>
      )}

      {showReconnect && (
        <div className="border-t border-[var(--border)] pt-3 space-y-3">
          <p className="text-xs text-[var(--text-secondary)]">
            Generate a new Admin API access token in Shopify → Apps → Develop apps → your app → API credentials, then paste it below.
          </p>
          <Input
            label="New Admin API access token"
            type="password"
            value={newToken}
            onChange={(e) => setNewToken(e.target.value)}
            placeholder="shpat_…"
          />
          {reconnectErr && (
            <div className="text-xs text-[var(--danger)] bg-[var(--danger-soft)] border border-red-200 rounded-lg px-3 py-2">{reconnectErr}</div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => { setShowReconnect(false); setNewToken(""); setReconnectErr(null); }}>Cancel</Button>
            <Button size="sm" onClick={doReconnect} disabled={reconnecting || !newToken}>
              {reconnecting ? "Verifying…" : "Save new token"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function ShopifyPanel() {
  const [stores, setStores] = useState<ShopifyStoreOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const rows = await api<ShopifyStoreOut[]>("/me/shopify/stores");
      setStores(rows);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const connect = async () => {
    setBusy(true); setErr(null); setOk(null);
    try {
      await api("/me/shopify/stores", {
        method: "POST",
        body: { name, shop_domain: domain, access_token: token },
      });
      setName(""); setDomain(""); setToken("");
      setShowAdd(false);
      setOk("Store connected. Click 'Sync products' to pull your catalogue.");
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Connect failed");
    } finally {
      setBusy(false);
    }
  };

  const disconnect = async (id: string) => {
    if (!confirm("Disconnect this store? Product sync will stop. Existing synced products stay.")) return;
    await api(`/me/shopify/stores/${id}`, { method: "DELETE" });
    await load();
  };

  const sync = async (id: string) => {
    setSyncing(id); setErr(null); setOk(null);
    try {
      const r = await api<{ fetched: number; created: number; updated: number; skipped: number }>(
        `/me/shopify/stores/${id}/sync`, { method: "POST" }
      );
      setOk(`Synced — fetched ${r.fetched}, created ${r.created}, updated ${r.updated}${r.skipped ? `, skipped ${r.skipped}` : ""}.`);
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Sync failed");
    } finally {
      setSyncing(null);
    }
  };

  const reconnect = async (id: string, newToken: string) => {
    await api(`/me/shopify/stores/${id}/reconnect`, {
      method: "POST",
      body: { access_token: newToken },
    });
    setOk("Store reconnected. Token verified with Shopify.");
    await load();
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <ShopifyLogo size={40} />
        <div>
          <h2 className="font-display font-semibold text-lg">Connect Shopify</h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Sync your product catalogue so the AI can answer customer questions about every
            item. Connect one or many stores — each gets its own sync.
          </p>
        </div>
      </header>

      <ShopifyTutorial />

      {loading ? (
        <div className="text-sm text-[var(--text-secondary)]">Loading stores…</div>
      ) : stores.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] bg-slate-50 p-5 text-center text-sm text-[var(--text-secondary)]">
          No Shopify store connected yet. Follow the steps above, then click
          <strong> Connect a store</strong> below.
        </div>
      ) : (
        <div className="space-y-3">
          {stores.map((s) => (
            <ShopifyStoreCard
              key={s.id}
              s={s}
              onSync={sync}
              onReconnect={reconnect}
              onDisconnect={disconnect}
              syncing={syncing}
            />
          ))}
        </div>
      )}

      {!showAdd ? (
        <Button variant="outline" onClick={() => setShowAdd(true)}>
          + Connect a store
        </Button>
      ) : (
        <div className="rounded-xl border border-[var(--border)] bg-white p-5 space-y-4">
          <div className="text-sm font-semibold">Connect a new Shopify store</div>
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Store name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Aurora Store"
            />
            <Input
              label="Shop domain"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="aurora-store or aurora-store.myshopify.com"
            />
            <div className="md:col-span-2">
              <Input
                label="Admin API access token"
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="shpat_…"
                hint="Generated in Shopify admin → Apps → Develop apps → your app → API credentials."
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => { setShowAdd(false); setName(""); setDomain(""); setToken(""); }}>Cancel</Button>
            <Button onClick={connect} disabled={busy || !domain || !token || !name}>
              {busy ? "Validating with Shopify…" : "Connect store"}
            </Button>
          </div>
        </div>
      )}

      {err && <div className="text-sm text-[var(--danger)] bg-[var(--danger-soft)] border border-red-200 rounded-lg px-3 py-2">{err}</div>}
      {ok && <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">{ok}</div>}
    </div>
  );
}
