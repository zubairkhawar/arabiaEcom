import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

type Tone = "success" | "warning" | "danger" | "info" | "neutral" | "violet";

const map: Record<Tone, string> = {
  success: "bg-[var(--accent-soft)] text-[var(--accent)]",
  warning: "bg-[var(--warning-soft)] text-[#B45309]",
  danger: "bg-[var(--danger-soft)] text-[var(--danger)]",
  info: "bg-[var(--info-soft)] text-[var(--info)]",
  neutral: "bg-slate-100 text-slate-700",
  violet: "bg-violet-100 text-violet-700",
};

export function Badge({
  children,
  tone = "neutral",
  className,
  dot,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium",
        map[tone],
        className
      )}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export function statusTone(status: string): Tone {
  switch (status) {
    case "confirmed":
    case "active":
    case "ai":
      return "success";
    case "hold":
    case "trial":
    case "human":
      return "warning";
    case "cancelled":
    case "suspended":
    case "disabled":
      return "danger";
    case "processing":
    case "new":
      return "info";
    case "full":
      return "violet";
    default:
      return "neutral";
  }
}
