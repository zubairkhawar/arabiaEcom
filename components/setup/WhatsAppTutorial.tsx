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
    title: "Create a Meta Business Account",
    body: (
      <>
        If you don't already have one, open <em>business.facebook.com</em> and create a
        Meta Business Account for your brand. This is the umbrella account that owns
        your WhatsApp Business number.
      </>
    ),
    link: { label: "Open Meta Business Suite", href: "https://business.facebook.com/" },
  },
  {
    num: 2,
    title: "Add a WhatsApp Business Account (WABA)",
    body: (
      <>
        Inside Meta Business → <strong>Business Settings</strong> → <strong>WhatsApp Accounts</strong> → <strong>Add</strong>.
        Create a WABA, then add your phone number to it. Meta will send a verification code
        to that number; enter it to confirm. Pick a display name (this is what customers
        see in WhatsApp).
      </>
    ),
    link: { label: "Open WhatsApp Manager", href: "https://business.facebook.com/wa/manage/" },
  },
  {
    num: 3,
    title: "Get WABA ID + Phone Number ID",
    body: (
      <>
        WhatsApp Manager → click your phone number → <strong>API setup</strong> tab. You'll see
        a <strong>WhatsApp Business Account ID</strong> and a <strong>Phone Number ID</strong>
        (both are long numeric strings). Copy each one and paste into the form below.
      </>
    ),
  },
  {
    num: 4,
    title: "Generate a permanent access token",
    body: (
      <>
        Business Settings → <strong>Users → System Users</strong> → <strong>Add</strong> → give it
        a name like "Arabia API" and role "Admin". Then click <strong>Generate New Token</strong> on
        that system user. Pick your app, set "Never expires", and tick these two scopes:
        <ul className="list-disc pl-5 mt-1.5 text-xs">
          <li><code>whatsapp_business_messaging</code> — lets us send messages on your behalf</li>
          <li><code>whatsapp_business_management</code> — lets us read webhook events</li>
        </ul>
        Copy the token (you only see it once). Paste it into the form below.
      </>
    ),
    link: { label: "Open System Users", href: "https://business.facebook.com/settings/system-users/" },
  },
  {
    num: 5,
    title: "Set a Webhook Verify Token",
    body: (
      <>
        Make up any random string (e.g. <code>mybiz-2026-abc123</code>) and paste it into the
        "Webhook Verify Token" field below. You'll use the SAME string in step 6 — Meta uses
        it to confirm it's really you when our backend gets called.
      </>
    ),
  },
  {
    num: 6,
    title: "Register the webhook with Meta",
    body: (
      <>
        After you click <strong>Save WhatsApp config</strong>, you'll see a Webhook URL appear
        below the form. Copy it. Then in WhatsApp Manager → click your number → <strong>Configuration</strong> → <strong>Webhook</strong> → <strong>Edit</strong>:
        <ul className="list-disc pl-5 mt-1.5 text-xs">
          <li><strong>Callback URL</strong> → paste the URL we showed you</li>
          <li><strong>Verify token</strong> → paste the same secret from step 5</li>
          <li>Subscribe to the <code>messages</code> field</li>
        </ul>
        Meta will call our URL once to verify the token. When it turns green on their side,
        you're live — every customer message will now flow into the Live Chats page.
      </>
    ),
  },
];

export function WhatsAppTutorial() {
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
            New to Meta WhatsApp? Step-by-step guide
          </span>
        </span>
        <ChevronDown
          size={18}
          className={cn("text-emerald-700 transition-transform", open && "rotate-180")}
        />
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
              <div className="font-medium text-slate-900">You're done.</div>
              Send yourself a test message from another phone. It should appear in
              <strong> Live Chats</strong> within seconds and the AI will reply.
            </div>
          </li>
        </ol>
      )}
    </div>
  );
}
