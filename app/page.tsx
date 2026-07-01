"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  Bot,
  Globe,
  ShoppingBag,
  BarChart3,
  Users,
  ShieldCheck,
  Zap,
  CheckCircle2,
  MessageCircle,
  Phone,
  TrendingUp,
  Menu,
  X,
} from "lucide-react";
import { useRole } from "@/lib/role";
import { api } from "@/lib/api";
import type { PlanOut } from "@/lib/types";

export default function LandingPage() {
  const router = useRouter();
  const { profile, loading } = useRole();
  const [plans, setPlans] = useState<PlanOut[]>([]);
  const [cycle, setCycle] = useState<"monthly" | "annual">("monthly");
  const [navOpen, setNavOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    if (!loading && profile) {
      router.replace(profile.role === "admin" ? "/admin" : "/reseller");
    }
  }, [loading, profile, router]);

  useEffect(() => {
    api<PlanOut[]>("/billing/plans").then(setPlans).catch(() => {
      // Fallback to hardcoded so the landing renders even if API is cold-starting
      setPlans([
        { code: "starter", name: "Starter", price: 99, price_annual: 990, currency: "AED", monthly_credits: 200, features: ["200 AI conversations / month", "Universal pool number included", "Meta Pixel + CAPI attribution", "Single Shopify store", "Email support"], sort_order: 10, orders_cap: null, conversations_cap: null, stores_cap: null, universal_numbers_cap: null },
        { code: "growth", name: "Growth", price: 249, price_annual: 2490, currency: "AED", monthly_credits: 750, features: ["750 AI conversations / month", "Own WhatsApp number supported", "Up to 3 Shopify stores", "Trilingual AI (EN / AR / Roman Urdu)", "Priority email support"], sort_order: 20, orders_cap: null, conversations_cap: null, stores_cap: null, universal_numbers_cap: null },
        { code: "scale", name: "Scale", price: 599, price_annual: 5990, currency: "AED", monthly_credits: 2500, features: ["2,500 AI conversations / month", "Unlimited Shopify stores", "Advanced attribution dashboard", "Real-agent escalation", "WhatsApp + email support"], sort_order: 30, orders_cap: null, conversations_cap: null, stores_cap: null, universal_numbers_cap: null },
      ]);
    });
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Top nav */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/80 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white">
              <Sparkles size={18} />
            </div>
            <div className="font-display font-bold text-lg">Arabia AI</div>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm text-slate-600">
            <a href="#how" className="hover:text-slate-900 transition-colors">How it works</a>
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-slate-900 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-slate-900 transition-colors">FAQ</a>
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-slate-700 hover:text-slate-900">Sign in</Link>
            <Link
              href="/login?mode=signup"
              className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:bg-emerald-600 transition-colors"
            >
              Start free trial <ArrowRight size={14} />
            </Link>
          </div>
          <button
            onClick={() => setNavOpen((v) => !v)}
            className="md:hidden p-2 -mr-2 text-slate-700"
            aria-label="Menu"
          >
            {navOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {navOpen && (
          <div className="md:hidden border-t border-slate-100 px-5 py-4 space-y-3 bg-white">
            <a href="#how" onClick={() => setNavOpen(false)} className="block text-sm text-slate-700">How it works</a>
            <a href="#features" onClick={() => setNavOpen(false)} className="block text-sm text-slate-700">Features</a>
            <a href="#pricing" onClick={() => setNavOpen(false)} className="block text-sm text-slate-700">Pricing</a>
            <a href="#faq" onClick={() => setNavOpen(false)} className="block text-sm text-slate-700">FAQ</a>
            <div className="pt-3 flex gap-2 border-t border-slate-100">
              <Link href="/login" className="flex-1 h-10 inline-flex items-center justify-center rounded-xl border border-slate-200 text-sm font-medium">Sign in</Link>
              <Link href="/login?mode=signup" className="flex-1 h-10 inline-flex items-center justify-center rounded-xl bg-[var(--accent)] text-white text-sm font-semibold">Start free trial</Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-emerald-100/40 blur-3xl" />
          <div className="absolute top-40 right-0 w-[500px] h-[500px] rounded-full bg-amber-100/30 blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-16 sm:pt-24 pb-20 sm:pb-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-xs font-semibold text-emerald-700">
                <Sparkles size={12} /> Built for Gulf dropshippers
              </div>
              <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl leading-[1.1] tracking-tight mt-5">
                Turn WhatsApp clicks into <span className="text-[var(--accent)]">Shopify orders</span>, on autopilot.
              </h1>
              <p className="mt-5 text-lg text-slate-600 leading-relaxed">
                A trilingual AI agent (English · Arabic · Roman Urdu) replies to every customer who clicks your ad, confirms the order over WhatsApp, and fires the Purchase event back to your Meta Pixel — so attribution stays clean.
              </p>
              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/login?mode=signup"
                  className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-[var(--accent)] text-white font-semibold hover:bg-emerald-600 transition-colors"
                >
                  Start your 7-day free trial <ArrowRight size={16} />
                </Link>
                <a
                  href="#how"
                  className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl border border-slate-200 text-slate-800 font-medium hover:bg-slate-50 transition-colors"
                >
                  How it works
                </a>
              </div>
              <p className="text-sm text-slate-500 mt-4">
                50 free AI conversations. No card required. Cancel anytime.
              </p>
            </div>
            <div className="relative">
              <HeroChatPreview />
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-slate-100 bg-slate-50/60">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
          <p className="text-center text-xs uppercase tracking-wider text-slate-500 mb-5 font-semibold">
            Used by resellers across UAE · KSA · Pakistan
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-60">
            <div className="font-display font-bold text-slate-400 text-lg">Aurora Shop</div>
            <div className="font-display font-bold text-slate-400 text-lg">Najm Beauty</div>
            <div className="font-display font-bold text-slate-400 text-lg">Gulf Apparel Co.</div>
            <div className="font-display font-bold text-slate-400 text-lg">Sahara Threads</div>
            <div className="font-display font-bold text-slate-400 text-lg">Karachi Bazaar</div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-wider font-semibold text-emerald-700">How it works</div>
            <h2 className="font-display font-bold text-3xl sm:text-4xl mt-2">
              Three steps from ad click to confirmed order.
            </h2>
            <p className="mt-3 text-slate-600 leading-relaxed">
              No code. No webhooks to set up. Sign up, connect your WhatsApp + Pixel, run your ad.
            </p>
          </div>

          <div className="mt-12 grid md:grid-cols-3 gap-5">
            {[
              {
                n: 1, icon: MessageCircle,
                t: "Customer clicks your ad",
                d: "Your Facebook/TikTok/Google ad points at a tracked link. We fire the Pixel + CAPI events and redirect to WhatsApp with a hidden ref token.",
              },
              {
                n: 2, icon: Bot,
                t: "AI replies in their language",
                d: "Your trilingual agent answers questions, recommends bundles, handles objections — in English, Arabic, or Roman Urdu, whichever the customer used.",
              },
              {
                n: 3, icon: TrendingUp,
                t: "Order confirmed + attributed",
                d: "When the AI closes the order, we create it in your dashboard and fire a Purchase event to Meta — so your ad spend gets the credit it deserves.",
              },
            ].map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.n} className="relative p-7 rounded-2xl border border-slate-100 bg-white card-shadow">
                  <div className="absolute -top-4 -left-2 w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center font-display font-bold text-emerald-700 text-lg">
                    {step.n}
                  </div>
                  <Icon size={28} className="text-emerald-600 mb-4 mt-2" />
                  <h3 className="font-display font-semibold text-xl">{step.t}</h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">{step.d}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 sm:py-28 bg-slate-50/40">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-wider font-semibold text-emerald-700">Everything in one place</div>
            <h2 className="font-display font-bold text-3xl sm:text-4xl mt-2">
              Built for resellers, not for engineers.
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Globe, t: "Trilingual AI", d: "English, Modern Standard Arabic with Khaleeji touch, and Roman Urdu — auto-detected per message." },
              { icon: BarChart3, t: "Pixel + CAPI attribution", d: "Browser InitiateCheckout + server-side Purchase. Your Meta Ads Manager sees every conversion." },
              { icon: ShoppingBag, t: "Shopify sync", d: "Connect any number of stores. We pull products + variants and feed them to the AI as live catalogue." },
              { icon: Phone, t: "Universal pool numbers", d: "No own WhatsApp? Use our country-specific pool — auto-assigned at signup, no Meta setup needed." },
              { icon: Users, t: "Real-agent escalation", d: "When a customer asks for a human, the chat flips to pending_human and you get a notification." },
              { icon: ShieldCheck, t: "Encrypted secrets", d: "Every Meta token, every CAPI key, every WhatsApp credential — Fernet-encrypted at rest." },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.t} className="p-6 rounded-2xl bg-white border border-slate-100 hover:border-emerald-200 transition-colors">
                  <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                    <Icon size={20} />
                  </div>
                  <h3 className="font-semibold text-base">{f.t}</h3>
                  <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{f.d}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <div className="text-xs uppercase tracking-wider font-semibold text-emerald-700">Pricing in AED</div>
            <h2 className="font-display font-bold text-3xl sm:text-4xl mt-2">
              Plans that grow with your ad spend.
            </h2>
            <p className="mt-3 text-slate-600">
              One credit = one AI conversation (24h window). All plans start with a 7-day free trial.
            </p>
            <div className="mt-6 inline-flex bg-slate-100 rounded-full p-1 text-xs font-medium">
              <button
                onClick={() => setCycle("monthly")}
                className={`px-4 h-9 rounded-full transition-colors ${cycle === "monthly" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setCycle("annual")}
                className={`px-4 h-9 rounded-full transition-colors ${cycle === "annual" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"}`}
              >
                Annual <span className="text-emerald-600 font-semibold ml-1">−17%</span>
              </button>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {plans.sort((a, b) => a.sort_order - b.sort_order).map((p) => {
              const monthly = cycle === "annual" ? p.price_annual / 12 : p.price;
              const total = cycle === "annual" ? p.price_annual : p.price;
              const recommended = p.code === "growth";
              return (
                <div
                  key={p.code}
                  className={`relative p-7 rounded-2xl border-2 ${recommended ? "border-emerald-300 bg-emerald-50/30 lg:scale-105" : "border-slate-100 bg-white"}`}
                >
                  {recommended && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white bg-emerald-600 px-3 py-1 rounded-full uppercase tracking-wider">
                      Most popular
                    </div>
                  )}
                  <div className="font-display text-xl font-bold">{p.name}</div>
                  <div className="mt-3 flex items-baseline gap-1">
                    <div className="font-display text-4xl font-bold">{monthly.toFixed(0)}</div>
                    <div className="text-sm text-slate-500">{p.currency}/mo</div>
                  </div>
                  {cycle === "annual" && (
                    <div className="text-xs text-slate-500 mt-0.5">
                      {total.toFixed(0)} {p.currency} billed annually
                    </div>
                  )}
                  <div className="text-sm font-semibold text-emerald-700 mt-2">
                    {p.monthly_credits.toLocaleString()} AI conversations / month
                  </div>
                  <ul className="mt-5 space-y-2 text-sm">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-slate-700">
                        <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/login?mode=signup"
                    className={`mt-6 w-full h-11 inline-flex items-center justify-center gap-1.5 rounded-xl font-semibold text-sm transition-colors ${
                      recommended
                        ? "bg-[var(--accent)] text-white hover:bg-emerald-600"
                        : "border border-slate-200 text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    Start free trial <ArrowRight size={14} />
                  </Link>
                </div>
              );
            })}
          </div>

          <p className="text-center text-xs text-slate-500 mt-8">
            Prices exclude 5% VAT. Need more credits? Top-ups start at 79 AED for 100 credits.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 sm:py-28 bg-slate-50/40">
        <div className="max-w-3xl mx-auto px-5 sm:px-8">
          <div className="text-center">
            <div className="text-xs uppercase tracking-wider font-semibold text-emerald-700">FAQ</div>
            <h2 className="font-display font-bold text-3xl sm:text-4xl mt-2">Got questions?</h2>
          </div>
          <div className="mt-10 space-y-2">
            {FAQS.map((f, i) => (
              <button
                key={i}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full text-left p-5 rounded-2xl bg-white border border-slate-100 hover:border-emerald-200 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-semibold text-base">{f.q}</h3>
                  <span className="text-slate-400 mt-1 shrink-0">{openFaq === i ? "−" : "+"}</span>
                </div>
                {openFaq === i && (
                  <p className="mt-3 text-sm text-slate-600 leading-relaxed">{f.a}</p>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center">
          <h2 className="font-display font-bold text-3xl sm:text-5xl leading-tight">
            Start replying to every customer<br className="hidden sm:block" /> in under 5 minutes.
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            7 days. 50 credits. Zero risk.
          </p>
          <Link
            href="/login?mode=signup"
            className="mt-8 inline-flex items-center gap-2 h-13 px-7 py-4 rounded-xl bg-[var(--accent)] text-white font-semibold hover:bg-emerald-600 transition-colors"
          >
            Start free trial <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-slate-50/60">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 text-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white">
              <Sparkles size={14} />
            </div>
            <div className="font-display font-bold">Arabia AI</div>
            <span className="text-slate-400 ml-3">© 2026 — Built for the Gulf.</span>
          </div>
          <div className="flex items-center gap-6 text-slate-500">
            <a href="#pricing" className="hover:text-slate-900">Pricing</a>
            <Link href="/login" className="hover:text-slate-900">Sign in</Link>
            <a href="mailto:support@arabia-ai.com" className="hover:text-slate-900">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

const FAQS = [
  {
    q: "How does the AI handle Arabic and Roman Urdu?",
    a: "We auto-detect the customer's language per message. Arabic gets fluent Modern Standard Arabic with a Khaleeji touch. Roman Urdu (Urdu in Latin script — 'kya hai', 'shukria') gets the same treatment. The AI never mixes languages within a reply — it always matches what the customer just used.",
  },
  {
    q: "What happens if I run out of credits mid-conversation?",
    a: "In-progress conversations finish on us. Only brand-new conversations (after 24h of silence with that customer) are paused until you top up or upgrade. We'll send you a notification when you hit 20% remaining and again at zero, so you're never caught off guard.",
  },
  {
    q: "Can I use my own WhatsApp number?",
    a: "Yes — connect your Meta WhatsApp Business number via our Channel Setup wizard. Or skip the Meta setup entirely and use our universal pool number, which is auto-assigned the moment you sign up. Both work the same way for the AI and for ad attribution.",
  },
  {
    q: "Is there a setup fee or contract?",
    a: "No setup fees. Monthly plans cancel anytime — when you cancel, you keep your current period until renewal. Annual plans give you 2 months free vs paying monthly.",
  },
  {
    q: "Which countries do you serve?",
    a: "Currently UAE, Saudi Arabia, and Pakistan. The AI is tuned for Gulf shoppers (currency, conventions, common phrases). We accept AED payments via Tap with full Mada + Apple Pay support.",
  },
  {
    q: "Do you integrate with platforms other than Meta?",
    a: "Pixel + CAPI for Meta is fully wired. TikTok, Snap, and Google CAPI dispatchers are on the roadmap for Phase 1.5. The tracking dashboard already shows clicks/orders/revenue by source platform across all five.",
  },
];

function HeroChatPreview() {
  return (
    <div className="relative max-w-md mx-auto">
      <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-100 to-amber-100 rounded-[2rem] blur-2xl opacity-60 -z-10" />
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden">
        <div className="bg-[#075E54] px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold">A</div>
          <div className="flex-1 min-w-0">
            <div className="text-white font-semibold text-sm truncate">Aurora Shop</div>
            <div className="text-emerald-100 text-[11px]">online · typing…</div>
          </div>
          <Phone size={16} className="text-white/70" />
        </div>
        <div className="p-4 space-y-3 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22 viewBox=%220 0 40 40%22><circle cx=%222%22 cy=%222%22 r=%221%22 fill=%22%23e5e7eb%22 opacity=%220.4%22/></svg>')] bg-repeat min-h-[420px]">
          <ChatBubble side="me">Hi! Saw the white earbuds ad. How much?</ChatBubble>
          <ChatBubble side="them">
            Welcome! 🎧 The Pulse buds are <strong>199 AED</strong> with 10% off today. White is in stock — want me to set one aside for you?
          </ChatBubble>
          <ChatBubble side="me">Yes please. Delivery to JLT, Dubai.</ChatBubble>
          <ChatBubble side="them">
            Done ✅ Order confirmed. You'll get it tomorrow before 6pm. Cash on delivery — your total is 199 AED.
          </ChatBubble>
          <div className="flex items-center gap-2 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1.5 w-fit ml-auto">
            <Zap size={12} /> Purchase fired to Meta Pixel
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatBubble({ side, children }: { side: "me" | "them"; children: React.ReactNode }) {
  const isMe = side === "me";
  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-snug shadow-sm ${
        isMe ? "bg-[#DCF8C6] text-slate-900 rounded-br-sm" : "bg-white text-slate-900 rounded-bl-sm"
      }`}>
        {children}
      </div>
    </div>
  );
}
