"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useRole } from "@/lib/role";

export default function LoginPage() {
  const router = useRouter();
  const { setRole } = useRole();
  const [email, setEmail] = useState("layla@aurorastore.ae");
  const [role, setLocalRole] = useState<"reseller" | "admin">("reseller");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setRole(role);
    router.push(role === "admin" ? "/admin" : "/reseller");
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-1 bg-[var(--bg-sidebar)] text-white p-12 flex-col justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
            <Sparkles size={20} />
          </div>
          <div className="font-display font-bold text-xl">Arabia AI</div>
        </div>
        <div className="max-w-md">
          <h2 className="font-display text-3xl font-bold leading-tight">
            One inbox. Two channels. Zero missed orders.
          </h2>
          <p className="text-slate-400 mt-3 leading-relaxed">
            WhatsApp + Shopify order automation, powered by your own AI agent. The customer
            never waits — and you only step in when it matters.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-slate-300">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" /> Run your own
              WhatsApp number or use our universal pool
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" /> Multi-store
              Shopify webhook routing
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" /> Take over any
              chat with one click
            </li>
          </ul>
        </div>
        <div className="text-xs text-slate-500">© 2026 Arabia AI · demo build</div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <form
          onSubmit={submit}
          className="w-full max-w-sm bg-white border border-[var(--border)] rounded-2xl p-7 card-shadow"
        >
          <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]">
            Welcome back
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Sign in to your Arabia AI dashboard.
          </p>

          <div className="mt-6 space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@brand.com"
            />
            <Input label="Password" type="password" defaultValue="demo-password" />

            <div>
              <span className="block mb-1.5 text-xs font-medium text-[var(--text-secondary)]">
                Sign in as
              </span>
              <div className="grid grid-cols-2 gap-2">
                {(["reseller", "admin"] as const).map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setLocalRole(r)}
                    className={`h-10 rounded-lg border text-sm font-medium capitalize transition-colors ${
                      role === r
                        ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                        : "border-[var(--border)] bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full mt-6" rightIcon={<ArrowRight size={16} />}>
            Continue
          </Button>

          <p className="text-xs text-[var(--text-muted)] text-center mt-5">
            Demo — any email works. Use the switcher in the top bar to swap portals.
          </p>
        </form>
      </div>
    </div>
  );
}
