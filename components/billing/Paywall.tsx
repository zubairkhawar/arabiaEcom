"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Zap, ArrowRight } from "lucide-react";
import type { SubscriptionOut } from "@/lib/types";

export function Paywall({
  sub,
  onClose,
}: {
  sub: SubscriptionOut;
  onClose?: () => void;
}) {
  const router = useRouter();
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl border border-[var(--border)] w-full max-w-md p-6 card-shadow relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-slate-400 hover:text-slate-700 p-1.5"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        )}
        <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
          <Zap size={22} />
        </div>
        <h2 className="font-display font-bold text-xl text-[var(--text-primary)]">
          You're out of credits
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1.5 leading-relaxed">
          {sub.is_trial
            ? "Your 7-day free trial used up its 50 credits. Pick a plan to keep your AI live and your customers replied to."
            : "Your current period's credits are spent. Upgrade your plan or buy a one-off top-up to keep replies flowing."}
        </p>
        <div className="mt-5 space-y-2">
          <button
            onClick={() => router.push("/reseller/billing")}
            className="w-full h-11 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors"
          >
            See plans <ArrowRight size={14} />
          </button>
          <button
            onClick={() => router.push("/reseller/billing?topup=1")}
            className="w-full h-11 rounded-xl border border-[var(--border)] text-sm font-medium text-[var(--text-primary)] hover:bg-slate-50 transition-colors"
          >
            Buy top-up credits
          </button>
        </div>
        <p className="text-[11px] text-[var(--text-muted)] text-center mt-4">
          In-progress conversations are unaffected — only brand-new chats are paused.
        </p>
      </div>
    </div>
  );
}
