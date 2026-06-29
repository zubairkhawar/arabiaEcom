"use client";

import { Input } from "@/components/ui/Input";
import type { OptionIn, VariantIn } from "@/lib/types";

export function VariantMatrix({
  options,
  variants,
  onChange,
  basePrice,
  currency,
}: {
  options: OptionIn[];
  variants: VariantIn[];
  onChange: (next: VariantIn[]) => void;
  basePrice: number;
  currency: string;
}) {
  const validOptions = options.filter((o) => o.name.trim() && o.values.length > 0);

  if (validOptions.length === 0) {
    return (
      <p className="text-sm text-[var(--text-secondary)] bg-slate-50 border border-[var(--border)] rounded-lg p-4">
        Add at least one option with values in the previous tab to generate variants.
      </p>
    );
  }

  if (variants.length === 0) {
    return (
      <p className="text-sm text-[var(--text-secondary)] bg-slate-50 border border-[var(--border)] rounded-lg p-4">
        No variant combinations yet. Variants are generated automatically when option values are added.
      </p>
    );
  }

  const setVariant = (idx: number, patch: Partial<VariantIn>) => {
    onChange(variants.map((v, i) => (i === idx ? { ...v, ...patch } : v)));
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--text-secondary)]">
        Leave price blank to use the base product price ({currency} {basePrice || 0}). Variants
        override bundle pricing — bundles only apply to the base product without a variant.
      </p>
      <div className="overflow-x-auto border border-[var(--border)] rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-[var(--text-secondary)]">
            <tr>
              {validOptions.map((o) => (
                <th key={o.name} className="text-left px-3 py-2 font-medium">
                  {o.name}
                </th>
              ))}
              <th className="text-left px-3 py-2 font-medium w-28">Price</th>
              <th className="text-left px-3 py-2 font-medium w-24">Stock</th>
              <th className="text-left px-3 py-2 font-medium w-32">SKU</th>
            </tr>
          </thead>
          <tbody>
            {variants.map((v, idx) => (
              <tr key={idx} className="border-t border-[var(--border)]">
                {validOptions.map((o) => (
                  <td key={o.name} className="px-3 py-2 text-[var(--text-primary)]">
                    {v.combo[o.name] ?? ""}
                  </td>
                ))}
                <td className="px-2 py-1.5">
                  <Input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    value={v.price ?? ""}
                    placeholder={String(basePrice || 0)}
                    onChange={(e) =>
                      setVariant(idx, {
                        price: e.target.value === "" ? null : Number(e.target.value),
                      })
                    }
                  />
                </td>
                <td className="px-2 py-1.5">
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={v.stock ?? ""}
                    placeholder="—"
                    onChange={(e) =>
                      setVariant(idx, {
                        stock: e.target.value === "" ? null : Number(e.target.value),
                      })
                    }
                  />
                </td>
                <td className="px-2 py-1.5">
                  <Input
                    value={v.sku ?? ""}
                    placeholder="—"
                    onChange={(e) =>
                      setVariant(idx, { sku: e.target.value === "" ? null : e.target.value })
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
