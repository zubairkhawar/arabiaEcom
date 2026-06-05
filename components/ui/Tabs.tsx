"use client";

import { cn } from "@/lib/cn";

interface Tab {
  id: string;
  label: string;
  badge?: string | number;
}

export function Tabs({
  tabs,
  value,
  onChange,
  variant = "pill",
}: {
  tabs: Tab[];
  value: string;
  onChange: (id: string) => void;
  variant?: "pill" | "underline";
}) {
  if (variant === "underline") {
    return (
      <div className="flex border-b border-[var(--border)] gap-1">
        {tabs.map((t) => {
          const active = t.id === value;
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              className={cn(
                "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px",
                active
                  ? "border-[var(--accent)] text-[var(--text-primary)]"
                  : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              {t.label}
              {t.badge !== undefined && (
                <span className="ml-2 px-1.5 py-0.5 rounded-full bg-slate-100 text-xs">
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }
  return (
    <div className="inline-flex rounded-lg bg-slate-100 p-1 gap-1">
      {tabs.map((t) => {
        const active = t.id === value;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
              active
                ? "bg-white text-[var(--text-primary)] shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
          >
            {t.label}
            {t.badge !== undefined && (
              <span className="ml-1.5 text-xs text-[var(--text-muted)]">
                {t.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
