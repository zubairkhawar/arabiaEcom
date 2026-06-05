import { TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "./Card";
import { cn } from "@/lib/cn";

interface Props {
  label: string;
  value: string;
  delta?: number;
  caption?: string;
  icon?: React.ReactNode;
}

export function StatCard({ label, value, delta, caption = "vs last 7 days", icon }: Props) {
  const up = (delta ?? 0) >= 0;
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-[var(--text-secondary)]">{label}</span>
        {icon && (
          <span className="w-9 h-9 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center">
            {icon}
          </span>
        )}
      </div>
      <div className="text-[28px] leading-none font-bold text-[var(--text-primary)] font-display">
        {value}
      </div>
      <div className="flex items-center gap-2">
        {delta !== undefined && (
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold",
              up ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "bg-[var(--danger-soft)] text-[var(--danger)]"
            )}
          >
            {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {up ? "+" : ""}
            {delta.toFixed(1)}%
          </span>
        )}
        <span className="text-xs text-[var(--text-muted)]">{caption}</span>
      </div>
    </Card>
  );
}
