"use client";

import { useState } from "react";
import { ChevronDown, ExternalLink, BookOpen, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/cn";

interface Step {
  num: number;
  title: string;
  body: React.ReactNode;
  link?: { label: string; href: string };
}

const STEPS: Step[] = [
  {
    num: 1,
    title: "Open your Shopify admin",
    body: (
      <>
        Sign into <em>admin.shopify.com</em> as a store owner (or staff with app dev permissions).
        You can connect one or more stores here — each gets its own product sync.
      </>
    ),
    link: { label: "Open Shopify Admin", href: "https://admin.shopify.com/" },
  },
  {
    num: 2,
    title: "Allow custom app development",
    body: (
      <>
        Shopify admin → <strong>Settings</strong> → <strong>Apps and sales channels</strong> →
        <strong> Develop apps</strong> → click <strong>Allow custom app development</strong>.
        You only need to do this once per store.
      </>
    ),
  },
  {
    num: 3,
    title: "Create a custom app",
    body: (
      <>
        Same page → <strong>Create an app</strong>. Name it <em>Arabia AI</em> (or anything
        memorable), pick yourself as the developer.
      </>
    ),
  },
  {
    num: 4,
    title: "Configure Admin API scopes",
    body: (
      <>
        New app → <strong>Configuration</strong> tab → <strong>Admin API integration</strong> →
        click <strong>Configure</strong>. Tick at minimum:
        <ul className="list-disc pl-5 mt-1.5 text-xs">
          <li><code>read_products</code> — pull your catalogue</li>
          <li><code>read_orders</code> — see incoming orders</li>
          <li><code>write_orders</code> — (optional) so AI-confirmed orders can be created in Shopify</li>
        </ul>
        Save.
      </>
    ),
  },
  {
    num: 5,
    title: "Install the app + copy the token",
    body: (
      <>
        Back on the app page → <strong>Install app</strong>. Once installed → <strong>API credentials</strong> tab
        shows your <strong>Admin API access token</strong> (starts with <code>shpat_…</code>).
        <strong> You only see it once</strong> — copy it now. Paste it into the form below.
      </>
    ),
  },
  {
    num: 6,
    title: "Paste shop domain + token below",
    body: (
      <>
        Shop domain looks like <code>your-store-name.myshopify.com</code> (or just
        <code> your-store-name</code> — we'll fill the rest in). Click <strong>Connect store</strong>.
        We'll call Shopify with the token to confirm it's valid before saving.
      </>
    ),
  },
  {
    num: 7,
    title: "Sync products",
    body: (
      <>
        Once connected, hit <strong>Sync products</strong>. We pull your full catalogue (up to 250 at a time, paginated) and add each as a product here, tagged
        with the store name. The AI can then answer questions about every Shopify product
        when customers chat via WhatsApp.
      </>
    ),
  },
];

export function ShopifyTutorial() {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-emerald-50 text-left"
      >
        <span className="flex items-center gap-2.5">
          <BookOpen size={16} className="text-emerald-700" />
          <span className="text-sm font-semibold text-emerald-900">
            How to connect your Shopify store
          </span>
        </span>
        <ChevronDown size={18} className={cn("text-emerald-700 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <ol className="px-5 pb-5 pt-1 space-y-3">
          {STEPS.map((s) => (
            <li key={s.num} className="flex gap-3">
              <div className="shrink-0 w-7 h-7 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                {s.num}
              </div>
              <div className="flex-1 text-sm">
                <div className="font-medium text-slate-900">{s.title}</div>
                <div className="text-slate-700 leading-relaxed mt-0.5">{s.body}</div>
                {s.link && (
                  <a
                    href={s.link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:text-emerald-900"
                  >
                    <ExternalLink size={12} /> {s.link.label}
                  </a>
                )}
              </div>
            </li>
          ))}
          <li className="flex gap-3 pt-2 border-t border-emerald-200">
            <div className="shrink-0 w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mt-0.5">
              <CheckCircle2 size={14} />
            </div>
            <div className="flex-1 text-sm text-slate-700">
              <div className="font-medium text-slate-900">Synced.</div>
              Your Shopify products now live in the Products page. Each gets its own
              tracking link to drop into ads.
            </div>
          </li>
        </ol>
      )}
    </div>
  );
}
