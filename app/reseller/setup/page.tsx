"use client";

import { useState } from "react";
import {
  MessageCircle,
  ShoppingBag,
  Play,
  Phone,
  Globe,
  CheckCircle2,
  Plus,
  Store,
  Info,
  HelpCircle,
} from "lucide-react";
import { Shell } from "@/components/layout/Shell";
import { Card, CardHeader } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { Input } from "@/components/ui/Input";
import { CopyField } from "@/components/ui/CopyField";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/cn";

type NumberType = "own" | "universal" | null;

interface ShopifyStore {
  id: string;
  name: string;
  domain: string;
  status: "connected" | "syncing";
  products: number;
  orders: number;
}

export default function SetupPage() {
  const [tab, setTab] = useState("whatsapp");
  return (
    <Shell
      portal="reseller"
      title="Channel Setup"
      subtitle="Connect WhatsApp, Shopify, or both. You can run them at the same time."
    >
      <Card padded={false}>
        <div className="p-5 border-b border-[var(--border)]">
          <Tabs
            value={tab}
            onChange={setTab}
            variant="underline"
            tabs={[
              { id: "whatsapp", label: "WhatsApp" },
              { id: "shopify", label: "Shopify" },
            ]}
          />
        </div>
        <div className="p-5 md:p-7">
          {tab === "whatsapp" ? <WhatsAppWizard /> : <ShopifyWizard />}
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
          Connect your WhatsApp Business number via Meta. Best for established brands with
          their own customer history.
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
          No setup. We route customers to a country-specific number from our pool. Each
          product just needs a target country.
        </p>
      </button>
    </div>
  );
}

function WhatsAppWizard() {
  const [type, setType] = useState<NumberType>("own");
  const [verified, setVerified] = useState(false);

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
          {type && (
            <Badge tone="success" dot>
              {type === "own" ? "Own number" : "Universal pool"}
            </Badge>
          )}
        </div>
        <NumberTypeChoice value={type} onChange={setType} />
      </div>

      {type === "own" && (
        <div className="space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            <div className="aspect-video rounded-xl bg-slate-900 text-white flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-transparent" />
              <button className="relative w-14 h-14 rounded-full bg-white text-emerald-600 flex items-center justify-center shadow-lg">
                <Play size={20} className="ml-0.5 fill-current" />
              </button>
              <div className="absolute bottom-3 left-4 text-xs text-white/80">
                Video guide · How to connect WhatsApp to Meta
              </div>
            </div>
            <div className="rounded-xl bg-slate-50 border border-[var(--border)] p-5">
              <div className="flex items-center gap-2 mb-2">
                <HelpCircle size={16} className="text-[var(--accent)]" />
                <span className="text-sm font-semibold">Need help getting tokens?</span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Our team can connect your Meta WhatsApp Business account for you in under
                10 minutes — no setup required from your side.
              </p>
              <div className="mt-3 text-sm">
                <div className="font-medium">support@arabia-ai.com</div>
                <div className="text-[var(--text-secondary)]">+971 4 555 0100</div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Input label="WhatsApp Business Account ID" placeholder="1234567890123456" />
            <Input label="Phone Number ID" placeholder="9876543210123456" />
            <Input label="Permanent Access Token" type="password" placeholder="EAAQ..." />
            <Input label="Webhook Verify Token" placeholder="my-secret-token" />
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={() => setVerified(true)}>Verify connection</Button>
            {verified && (
              <Badge tone="success" dot>
                Connected · +971 50 123 0001
              </Badge>
            )}
          </div>
        </div>
      )}

      {type === "universal" && (
        <div className="rounded-xl bg-[var(--accent-soft)] border border-emerald-200 p-5 flex gap-3">
          <Info size={18} className="text-[var(--accent)] mt-0.5 shrink-0" />
          <div>
            <div className="font-semibold text-[var(--text-primary)]">No setup required</div>
            <p className="text-sm text-slate-700 mt-1">
              Your customers will message a country-specific number from our pool. Each
              product must specify a target country — we route inbound chats to the right
              pool number automatically.
            </p>
            <div className="mt-3">
              <Button>Continue to Products</Button>
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-[var(--border)] pt-5">
        <h3 className="text-sm font-semibold mb-3">Step 2 · Status</h3>
        <div className="flex items-center gap-3 rounded-xl bg-white border border-[var(--border)] p-4">
          <CheckCircle2
            size={20}
            className={verified || type === "universal" ? "text-[var(--accent)]" : "text-slate-300"}
          />
          <div className="flex-1">
            <div className="text-sm font-medium">
              {verified
                ? "Connected · own number +971 50 123 0001"
                : type === "universal"
                ? "Universal pool active"
                : "Not connected yet"}
            </div>
            <div className="text-xs text-[var(--text-secondary)]">
              {verified || type === "universal"
                ? "AI is now answering incoming WhatsApp messages."
                : "Choose a number type above to continue."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShopifyWizard() {
  const [type, setType] = useState<NumberType>("own");
  const [stores, setStores] = useState<ShopifyStore[]>([
    {
      id: "s1",
      name: "Aurora Store",
      domain: "aurora-store.myshopify.com",
      status: "connected",
      products: 38,
      orders: 142,
    },
  ]);
  const [open, setOpen] = useState(false);
  const [newStore, setNewStore] = useState({ name: "", domain: "" });

  const addStore = () => {
    if (!newStore.name || !newStore.domain) return;
    const id = "s" + (stores.length + 1);
    setStores((s) => [
      ...s,
      { id, name: newStore.name, domain: newStore.domain, status: "syncing", products: 0, orders: 0 },
    ]);
    setNewStore({ name: "", domain: "" });
    setOpen(false);
    setTimeout(() => {
      setStores((s) =>
        s.map((st) =>
          st.id === id
            ? { ...st, status: "connected", products: 24, orders: 87 }
            : st
        )
      );
    }, 1800);
  };

  return (
    <div className="space-y-7">
      <header className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center">
          <ShoppingBag size={20} />
        </div>
        <div>
          <h2 className="font-display font-semibold text-lg text-[var(--text-primary)]">
            Connect Shopify
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Pulled products power AI answers; pulled orders trigger confirmation messages.
          </p>
        </div>
      </header>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Step 1 · Choose number type</h3>
          {type && (
            <Badge tone="success" dot>
              {type === "own" ? "Own number" : "Universal pool"}
            </Badge>
          )}
        </div>
        <NumberTypeChoice value={type} onChange={setType} />
        <p className="text-xs text-[var(--text-muted)] mt-3 leading-relaxed">
          Note: Shopify confirmation messages still need a webhook regardless of which
          number type you choose.
        </p>
      </div>

      <div className="border-t border-[var(--border)] pt-5">
        <h3 className="text-sm font-semibold mb-3">Step 2 · Connect store(s)</h3>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-3">
            <CopyField
              label="Webhook URL"
              value="https://api.arabia-ai.com/shopify/wh/aurora/abf7-2k38l"
            />
            <div className="rounded-lg bg-slate-50 p-3 text-xs text-[var(--text-secondary)]">
              Add this webhook in your Shopify admin under{" "}
              <span className="text-slate-700 font-medium">
                Settings → Notifications → Webhooks
              </span>{" "}
              for events: <em>Order creation, Order updated, Product update.</em>
            </div>
          </div>
          <div className="aspect-video rounded-xl bg-slate-900 text-white flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-transparent" />
            <button className="relative w-14 h-14 rounded-full bg-white text-violet-600 flex items-center justify-center shadow-lg">
              <Play size={20} className="ml-0.5 fill-current" />
            </button>
            <div className="absolute bottom-3 left-4 text-xs text-white/80">
              Video guide · Add webhook to Shopify
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Connected stores</div>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Plus size={14} />}
              onClick={() => setOpen(true)}
            >
              Add another store
            </Button>
          </div>
          {stores.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-4 p-3 rounded-xl border border-[var(--border)] bg-white"
            >
              <div className="w-9 h-9 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center">
                <Store size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{s.name}</div>
                <div className="text-xs text-[var(--text-secondary)] truncate">
                  {s.domain}
                </div>
              </div>
              {s.status === "connected" ? (
                <div className="text-xs text-[var(--text-secondary)] text-right">
                  <Badge tone="success" dot>
                    Connected
                  </Badge>
                  <div className="mt-1">
                    Pulled {s.orders} orders · {s.products} products
                  </div>
                </div>
              ) : (
                <Badge tone="info">Syncing…</Badge>
              )}
              <button className="text-xs text-slate-500 hover:text-red-600 ml-2">
                Disconnect
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-[var(--border)] pt-5">
        <h3 className="text-sm font-semibold mb-2">Step 3 · How it works</h3>
        <ul className="text-sm text-[var(--text-secondary)] space-y-1.5">
          <li>• Pulled <strong className="text-[var(--text-primary)]">products</strong> become part of the AI's knowledge base.</li>
          <li>• Pulled <strong className="text-[var(--text-primary)]">orders</strong> trigger automated WhatsApp confirmation messages.</li>
          <li>• Multi-store routing is automatic — we tag each order with its source store.</li>
        </ul>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add Shopify store"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addStore}>Connect store</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Store name"
            placeholder="My Boutique"
            value={newStore.name}
            onChange={(e) => setNewStore((s) => ({ ...s, name: e.target.value }))}
          />
          <Input
            label="Store domain"
            placeholder="my-boutique.myshopify.com"
            value={newStore.domain}
            onChange={(e) => setNewStore((s) => ({ ...s, domain: e.target.value }))}
          />
          <CopyField
            label="Use this webhook URL in Shopify"
            value="https://api.arabia-ai.com/shopify/wh/aurora/new-store"
          />
        </div>
      </Modal>
    </div>
  );
}
