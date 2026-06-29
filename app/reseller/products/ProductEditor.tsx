"use client";

import { useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import { Tabs } from "@/components/ui/Tabs";
import { api, ApiError } from "@/lib/api";
import type {
  ProductOut,
  ProductIn,
  ProductUpdate,
  OptionIn,
  VariantIn,
  BundleIn,
  DiscountIn,
} from "@/lib/types";
import { OptionsEditor } from "./editor/OptionsEditor";
import { VariantMatrix } from "./editor/VariantMatrix";
import { BundleBuilder } from "./editor/BundleBuilder";
import { DiscountEditor } from "./editor/DiscountEditor";

type TabId = "basics" | "options" | "bundles" | "discount";

interface EditorState {
  name: string;
  image_url: string;
  description: string;
  main_description: string;
  price: string;
  currency: string;
  country: string;
  channels: string[];
  active: boolean;
  options: OptionIn[];
  variants: VariantIn[];
  bundles: BundleIn[];
  discount: DiscountIn | null;
}

function emptyState(): EditorState {
  return {
    name: "",
    image_url: "",
    description: "",
    main_description: "",
    price: "199",
    currency: "AED",
    country: "UAE",
    channels: ["whatsapp"],
    active: true,
    options: [],
    variants: [],
    bundles: [],
    discount: null,
  };
}

function fromProduct(p: ProductOut): EditorState {
  return {
    name: p.name,
    image_url: p.image_url ?? "",
    description: p.description ?? "",
    main_description: p.main_description ?? "",
    price: String(p.price),
    currency: p.currency,
    country: p.country,
    channels: p.channels,
    active: p.active,
    options: p.options.map((o) => ({ name: o.name, values: o.values })),
    variants: p.variants.map((v) => ({
      label: v.label,
      combo: v.combo,
      price: v.price,
      stock: v.stock,
      sku: v.sku,
    })),
    bundles: p.bundles.map((b) => ({ qty: b.qty, price: b.price })),
    discount:
      p.discount_type && p.discount_value !== null
        ? { type: p.discount_type, value: p.discount_value }
        : null,
  };
}

function cartesian(options: OptionIn[]): Record<string, string>[] {
  const valid = options.filter((o) => o.name.trim() && o.values.length > 0);
  if (valid.length === 0) return [];
  return valid.reduce<Record<string, string>[]>((acc, opt) => {
    if (acc.length === 0) return opt.values.map((v) => ({ [opt.name]: v }));
    return acc.flatMap((combo) => opt.values.map((v) => ({ ...combo, [opt.name]: v })));
  }, []);
}

function comboKey(combo: Record<string, string>): string {
  return Object.keys(combo)
    .sort()
    .map((k) => `${k}=${combo[k]}`)
    .join("|");
}

function comboLabel(combo: Record<string, string>): string {
  return Object.values(combo).join(" / ");
}

function mergeVariants(combos: Record<string, string>[], existing: VariantIn[]): VariantIn[] {
  const byKey = new Map(existing.map((v) => [comboKey(v.combo), v]));
  return combos.map((combo) => {
    const prior = byKey.get(comboKey(combo));
    if (prior) return { ...prior, combo, label: comboLabel(combo) };
    return { label: comboLabel(combo), combo, price: null, stock: null, sku: null };
  });
}

export function ProductEditor({
  open,
  onClose,
  onSaved,
  product,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  product?: ProductOut | null;
}) {
  const initial = useMemo(() => (product ? fromProduct(product) : emptyState()), [product]);
  const [state, setState] = useState<EditorState>(initial);
  const [tab, setTab] = useState<TabId>("basics");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const isEdit = !!product;

  const setOptions = (nextOptions: OptionIn[]) => {
    const combos = cartesian(nextOptions);
    const nextVariants = combos.length === 0 ? [] : mergeVariants(combos, state.variants);
    setState({ ...state, options: nextOptions, variants: nextVariants });
  };

  const basePrice = Number(state.price) || 0;

  const variantCount = state.variants.length;
  const bundleCount = state.bundles.length;
  const discountBadge = state.discount ? "on" : undefined;

  const submit = async () => {
    setBusy(true);
    setErr(null);
    try {
      const baseFields = {
        name: state.name,
        image_url: state.image_url || null,
        description: state.description || null,
        main_description: state.main_description || null,
        price: Number(state.price) || 0,
        currency: state.currency,
        country: state.country,
        channels: state.channels,
        options: state.options.filter((o) => o.name.trim() && o.values.length > 0),
        variants: state.variants,
        bundles: state.bundles,
        discount: state.discount,
      };

      if (isEdit && product) {
        const payload: ProductUpdate = { ...baseFields, active: state.active };
        await api(`/products/${product.id}`, { method: "PATCH", body: payload });
      } else {
        const payload: ProductIn = baseFields;
        await api("/products", { method: "POST", body: payload });
      }
      onSaved();
      onClose();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : e instanceof Error ? e.message : "Save failed";
      setErr(msg);
    } finally {
      setBusy(false);
    }
  };

  const canSave =
    !!state.name.trim() &&
    !!state.price &&
    !state.bundles.some((b) => b.qty < 2 || b.price <= 0) &&
    !(state.discount && (state.discount.value <= 0 || (state.discount.type === "percent" && state.discount.value > 100)));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? `Edit ${product?.name ?? "product"}` : "Add product"}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={busy || !canSave}>
            {busy ? "Saving…" : isEdit ? "Save changes" : "Save & generate link"}
          </Button>
        </>
      }
    >
      <div className="mb-5">
        <Tabs
          variant="underline"
          value={tab}
          onChange={(id) => setTab(id as TabId)}
          tabs={[
            { id: "basics", label: "Basics" },
            { id: "options", label: "Options & Variants", badge: variantCount || undefined },
            { id: "bundles", label: "Bundles", badge: bundleCount || undefined },
            { id: "discount", label: "Discount", badge: discountBadge },
          ]}
        />
      </div>

      {tab === "basics" && (
        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-4">
            <Input
              label="Product name"
              value={state.name}
              onChange={(e) => setState({ ...state, name: e.target.value })}
              placeholder="Wireless Earbuds Pro"
            />
            <Input
              label="Image URL (optional)"
              value={state.image_url}
              onChange={(e) => setState({ ...state, image_url: e.target.value })}
              placeholder="https://…/photo.jpg"
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Price"
                value={state.price}
                onChange={(e) => setState({ ...state, price: e.target.value })}
                placeholder="199"
              />
              <Select
                label="Currency"
                value={state.currency}
                onChange={(e) => setState({ ...state, currency: e.target.value })}
                options={[
                  { value: "AED", label: "AED" },
                  { value: "SAR", label: "SAR" },
                  { value: "PKR", label: "PKR" },
                  { value: "USD", label: "USD" },
                ]}
              />
            </div>
            <Select
              label="Target country"
              value={state.country}
              onChange={(e) => setState({ ...state, country: e.target.value })}
              options={[
                { value: "UAE", label: "UAE" },
                { value: "PAK", label: "Pakistan" },
                { value: "KSA", label: "Saudi Arabia" },
              ]}
            />
            {isEdit && (
              <Toggle
                checked={state.active}
                onChange={(active) => setState({ ...state, active })}
                label="Active"
                description="Inactive products are hidden from the public link page."
              />
            )}
          </div>
          <div className="space-y-4">
            <Input
              label="Short tagline"
              value={state.description}
              onChange={(e) => setState({ ...state, description: e.target.value })}
              placeholder="ANC + 24h battery"
            />
            <Textarea
              label="Full description"
              value={state.main_description}
              onChange={(e) => setState({ ...state, main_description: e.target.value })}
              placeholder="What makes this product special?"
            />
          </div>
        </div>
      )}

      {tab === "options" && (
        <div className="space-y-5">
          <OptionsEditor options={state.options} onChange={setOptions} />
          <div className="pt-5 border-t border-[var(--border)]">
            <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Variants</h4>
            <VariantMatrix
              options={state.options}
              variants={state.variants}
              onChange={(variants) => setState({ ...state, variants })}
              basePrice={basePrice}
              currency={state.currency}
            />
          </div>
        </div>
      )}

      {tab === "bundles" && (
        <BundleBuilder
          bundles={state.bundles}
          onChange={(bundles) => setState({ ...state, bundles })}
          basePrice={basePrice}
          currency={state.currency}
        />
      )}

      {tab === "discount" && (
        <DiscountEditor
          discount={state.discount}
          onChange={(discount) => setState({ ...state, discount })}
          currency={state.currency}
        />
      )}

      {err && (
        <div className="mt-4 text-sm text-[var(--danger)] bg-[var(--danger-soft)] border border-red-200 rounded-lg px-3 py-2">
          {err}
        </div>
      )}
    </Modal>
  );
}
