"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useRole } from "@/lib/role";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signUp } = useRole();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("demo@arabia-ai.com");
  const [password, setPassword] = useState("demo123!");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const user =
        mode === "login"
          ? await signIn(email, password)
          : await signUp({ name, email, password });
      router.push(user.role === "admin" ? "/admin" : "/reseller");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setBusy(false);
    }
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
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" /> Connect your
              own WhatsApp number or use our universal pool
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" /> Meta Pixel +
              Conversions API attribution for WhatsApp purchases
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" /> Take over any
              chat with one click
            </li>
          </ul>
        </div>
        <div className="text-xs text-slate-500">© 2026 Arabia AI</div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <form
          onSubmit={submit}
          className="w-full max-w-sm bg-white border border-[var(--border)] rounded-2xl p-7 card-shadow"
        >
          <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {mode === "login"
              ? "Sign in to your Arabia AI dashboard."
              : "Start running WhatsApp + Meta-attributed orders in minutes."}
          </p>

          <div className="mt-6 space-y-4">
            {mode === "signup" && (
              <Input
                label="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Layla Hassan"
                required
              />
            )}
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@brand.com"
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="mt-4 text-xs text-[var(--danger)] bg-[var(--danger-soft)] border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full mt-6"
            rightIcon={<ArrowRight size={16} />}
            disabled={busy}
          >
            {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </Button>

          <p className="text-xs text-[var(--text-muted)] text-center mt-5">
            {mode === "login" ? (
              <>
                New to Arabia AI?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="text-[var(--accent)] hover:underline font-medium"
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-[var(--accent)] hover:underline font-medium"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
          {mode === "login" && (
            <p className="text-[11px] text-[var(--text-muted)] text-center mt-3">
              Demo: <code className="text-[var(--text-secondary)]">demo@arabia-ai.com</code> /{" "}
              <code className="text-[var(--text-secondary)]">demo123!</code>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
