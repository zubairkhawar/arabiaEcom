"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";

export function CopyField({
  value,
  label,
  monospace = true,
  className,
}: {
  value: string;
  label?: string;
  monospace?: boolean;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };
  return (
    <div className={cn("block", className)}>
      {label && (
        <span className="block mb-1.5 text-xs font-medium text-[var(--text-secondary)]">
          {label}
        </span>
      )}
      <div className="flex items-center rounded-lg border border-[var(--border)] bg-slate-50 overflow-hidden">
        <input
          readOnly
          value={value}
          className={cn(
            "flex-1 bg-transparent px-3 py-2 text-sm text-slate-800 focus:outline-none truncate",
            monospace && "font-mono text-[12px]"
          )}
        />
        <button
          onClick={copy}
          type="button"
          className="px-3 py-2 text-[var(--accent)] hover:bg-emerald-50 border-l border-[var(--border)] flex items-center gap-1.5 text-xs font-medium"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}
