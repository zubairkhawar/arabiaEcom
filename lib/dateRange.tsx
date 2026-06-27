"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

export const RANGE_OPTIONS = [
  { value: 7, label: "Last 7 days" },
  { value: 30, label: "Last 30 days" },
  { value: 90, label: "Last 90 days" },
  { value: 365, label: "Last 12 months" },
] as const;

export type RangeValue = (typeof RANGE_OPTIONS)[number]["value"];

interface Ctx {
  range: RangeValue;
  setRange: (r: RangeValue) => void;
  label: string;
}

const C = createContext<Ctx | null>(null);

export function DateRangeProvider({ children }: { children: ReactNode }) {
  const [range, setRangeState] = useState<RangeValue>(7);
  const setRange = useCallback((r: RangeValue) => setRangeState(r), []);
  const label = RANGE_OPTIONS.find((o) => o.value === range)?.label ?? "Last 7 days";
  return <C.Provider value={{ range, setRange, label }}>{children}</C.Provider>;
}

export function useDateRange(): Ctx {
  const v = useContext(C);
  if (!v) throw new Error("useDateRange must be used inside DateRangeProvider");
  return v;
}
