"use client";

import { Input, Select } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import type { DiscountIn } from "@/lib/types";

export function DiscountEditor({
  discount,
  onChange,
  currency,
}: {
  discount: DiscountIn | null;
  onChange: (next: DiscountIn | null) => void;
  currency: string;
}) {
  const enabled = discount !== null;

  const toggle = (next: boolean) => {
    onChange(next ? { type: "percent", value: 10 } : null);
  };

  const setType = (type: "percent" | "flat") => {
    if (!discount) return;
    onChange({ ...discount, type });
  };

  const setValue = (value: number) => {
    if (!discount) return;
    onChange({ ...discount, value });
  };

  const invalid =
    discount !== null &&
    (discount.value <= 0 || (discount.type === "percent" && discount.value > 100));

  return (
    <div className="space-y-4">
      <Toggle
        checked={enabled}
        onChange={toggle}
        label="Apply a discount"
        description="Applied last — after any variant price override and bundle tier."
      />

      {enabled && discount && (
        <div className="border border-[var(--border)] rounded-lg p-4 bg-slate-50/50 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Type"
              value={discount.type}
              onChange={(e) => setType(e.target.value as "percent" | "flat")}
              options={[
                { value: "percent", label: "Percent (%)" },
                { value: "flat", label: `Flat (${currency})` },
              ]}
            />
            <Input
              label="Value"
              type="number"
              inputMode="decimal"
              step="0.01"
              min={0}
              max={discount.type === "percent" ? 100 : undefined}
              value={discount.value}
              onChange={(e) => setValue(Number(e.target.value) || 0)}
            />
          </div>
          {invalid && (
            <div className="text-xs text-[var(--danger)]">
              {discount.value <= 0
                ? "Value must be greater than 0."
                : "Percent discount cannot exceed 100."}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
