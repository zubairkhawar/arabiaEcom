"use client";

import { cn } from "@/lib/cn";

export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
  description?: string;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors",
          checked ? "bg-[var(--accent)]" : "bg-slate-300"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
            checked && "translate-x-5"
          )}
        />
      </button>
      {(label || description) && (
        <span className="flex-1">
          {label && (
            <span className="block text-sm font-medium text-[var(--text-primary)]">
              {label}
            </span>
          )}
          {description && (
            <span className="block text-xs text-[var(--text-secondary)] mt-0.5">
              {description}
            </span>
          )}
        </span>
      )}
    </label>
  );
}
