"use client";

import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { BundleIn } from "@/lib/types";

export function BundleBuilder({
  bundles,
  onChange,
  basePrice,
  currency,
}: {
  bundles: BundleIn[];
  onChange: (next: BundleIn[]) => void;
  basePrice: number;
  currency: string;
}) {
  const setBundle = (idx: number, patch: Partial<BundleIn>) => {
    onChange(bundles.map((b, i) => (i === idx ? { ...b, ...patch } : b)));
  };

  const removeBundle = (idx: number) => {
    onChange(bundles.filter((_, i) => i !== idx));
  };

  const addBundle = () => {
    const nextQty = (bundles.reduce((max, b) => Math.max(max, b.qty), 1) || 1) + 1;
    const suggested = Number((basePrice * nextQty * 0.9).toFixed(2));
    onChange([...bundles, { qty: nextQty, price: suggested || 0 }]);
  };

  const counts = bundles.reduce<Record<number, number>>((acc, b) => {
    acc[b.qty] = (acc[b.qty] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <p className="text-xs text-[var(--text-secondary)]">
        Bundles apply only to the base product, not to variants. Buyers ordering N units get the
        largest bundle where bundle qty ≤ N; remaining units are charged at the base price.
      </p>

      {bundles.length === 0 ? (
        <div className="text-sm text-[var(--text-secondary)] bg-slate-50 border border-[var(--border)] rounded-lg p-4">
          No bundles yet. Add a bundle to offer multi-pack pricing (e.g. 3 for the price of 2.5).
        </div>
      ) : (
        <div className="space-y-2">
          {bundles.map((b, idx) => {
            const dupe = counts[b.qty] > 1;
            const qtyInvalid = b.qty < 2;
            const priceInvalid = b.price <= 0;
            const each = b.qty > 0 ? (b.price / b.qty).toFixed(2) : "—";
            return (
              <div
                key={idx}
                className="border border-[var(--border)] rounded-lg p-3 bg-slate-50/50"
              >
                <div className="flex gap-3 items-end">
                  <div className="w-24">
                    <Input
                      label="Quantity"
                      type="number"
                      inputMode="numeric"
                      min={2}
                      value={b.qty}
                      onChange={(e) => setBundle(idx, { qty: Number(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="w-32">
                    <Input
                      label={`Total (${currency})`}
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min={0}
                      value={b.price}
                      onChange={(e) => setBundle(idx, { price: Number(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="flex-1 text-xs text-[var(--text-secondary)] pb-2.5">
                    {b.qty > 0 && b.price > 0 ? (
                      <>
                        {b.qty} for {currency} {b.price.toFixed(2)} ·{" "}
                        <span className="text-[var(--text-muted)]">{currency} {each} each</span>
                      </>
                    ) : (
                      <span className="text-[var(--text-muted)]">Enter quantity and price.</span>
                    )}
                  </div>
                  <button
                    onClick={() => removeBundle(idx)}
                    className="text-slate-400 hover:text-red-600 p-2 hover:bg-red-50 rounded mb-0.5"
                    aria-label="Remove bundle"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                {(dupe || qtyInvalid || priceInvalid) && (
                  <div className="mt-2 text-xs text-[var(--danger)]">
                    {qtyInvalid && <div>Quantity must be 2 or more.</div>}
                    {priceInvalid && <div>Price must be greater than 0.</div>}
                    {dupe && <div>Another bundle already uses this quantity.</div>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Button leftIcon={<Plus size={16} />} variant="outline" onClick={addBundle}>
        Add bundle
      </Button>
    </div>
  );
}
