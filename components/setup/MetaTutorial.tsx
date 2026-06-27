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
    title: "Open Events Manager",
    body: (
      <>
        Go to <em>business.facebook.com/events_manager</em>. Pick (or create) the dataset
        for the brand you're running ads under. The 15-digit number at the top of the
        dataset page is your <strong>Pixel ID</strong>.
      </>
    ),
    link: { label: "Open Events Manager", href: "https://business.facebook.com/events_manager" },
  },
  {
    num: 2,
    title: "Copy the Pixel ID",
    body: (
      <>
        Paste it into the <strong>Meta Pixel ID</strong> field below. We'll embed this
        Pixel on the redirect page so the browser fires an InitiateCheckout when a
        customer clicks your product link.
      </>
    ),
  },
  {
    num: 3,
    title: "Generate a Conversions API access token",
    body: (
      <>
        Same dataset page → <strong>Settings</strong> tab → scroll to <strong>Conversions API</strong> →
        click <strong>Generate access token</strong>. The token starts with <code>EAAB…</code>
        and never expires unless you revoke it. Paste it into the
        <strong> Conversions API Access Token</strong> field below.
      </>
    ),
  },
  {
    num: 4,
    title: "(optional) Test Event Code",
    body: (
      <>
        Settings → <strong>Test events</strong> tab gives you a <code>TEST…</code> code. While
        connected, every event we send is tagged for test mode so you can watch them stream
        into the Test Events viewer in real time. Leave blank for production.
      </>
    ),
  },
  {
    num: 5,
    title: "Pick the right action_source",
    body: (
      <>
        <strong>website</strong> works for everyone. <strong>business_messaging</strong> gives
        better attribution if your Meta account is enrolled in <em>Click-to-WhatsApp Ads</em>
        (CTWA) — Meta will match events to the original ad click via the WhatsApp referral
        payload. If unsure, leave it on website.
      </>
    ),
  },
  {
    num: 6,
    title: "Hit Verify connection",
    body: (
      <>
        After saving, click <strong>Verify connection</strong>. We send a real test
        InitiateCheckout to Meta's CAPI using your token. Meta replies in under a
        second — green badge means done. From now on:
        <ul className="list-disc pl-5 mt-1.5 text-xs">
          <li><strong>AddToCart / InitiateCheckout</strong> fires on every product-link click</li>
          <li><strong>Purchase</strong> fires server-side when the AI confirms an order in WhatsApp</li>
          <li>Both carry <code>fbp</code> + <code>fbc</code> so Meta attributes back to the ad</li>
        </ul>
      </>
    ),
  },
];

export function MetaTutorial() {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50/40 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-blue-50 text-left"
      >
        <span className="flex items-center gap-2.5">
          <BookOpen size={16} className="text-blue-700" />
          <span className="text-sm font-semibold text-blue-900">
            How to find your Pixel ID + Conversions API token
          </span>
        </span>
        <ChevronDown size={18} className={cn("text-blue-700 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <ol className="px-5 pb-5 pt-1 space-y-3">
          {STEPS.map((s) => (
            <li key={s.num} className="flex gap-3">
              <div className="shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">
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
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 hover:text-blue-900"
                  >
                    <ExternalLink size={12} /> {s.link.label}
                  </a>
                )}
              </div>
            </li>
          ))}
          <li className="flex gap-3 pt-2 border-t border-blue-200">
            <div className="shrink-0 w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mt-0.5">
              <CheckCircle2 size={14} />
            </div>
            <div className="flex-1 text-sm text-slate-700">
              <div className="font-medium text-slate-900">All set.</div>
              Click a product link from your phone with the Pixel installed. You'll see
              the event appear instantly in Events Manager → Overview.
            </div>
          </li>
        </ol>
      )}
    </div>
  );
}
