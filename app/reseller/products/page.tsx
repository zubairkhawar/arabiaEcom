"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, ExternalLink, Search, ImageIcon, Trash2, Pencil } from "lucide-react";
import { Shell } from "@/components/layout/Shell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CopyField } from "@/components/ui/CopyField";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { api } from "@/lib/api";
import { money } from "@/lib/format";
import type { ProductOut } from "@/lib/types";
import { ProductEditor } from "./ProductEditor";

const countryFlag: Record<string, string> = { UAE: "🇦🇪", PAK: "🇵🇰", KSA: "🇸🇦" };

export default function ProductsPage() {
  const [items, setItems] = useState<ProductOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<ProductOut | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [source, setSource] = useState<string>("all");

  const load = async () => {
    setLoading(true);
    try {
      const rows = await api<ProductOut[]>("/products");
      setItems(rows);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Build the source filter list dynamically from what's been synced
  // — "all" + "manual" + one chip per connected Shopify store name.
  const sources = ["all", "manual", ...Array.from(new Set(
    items.filter((p) => p.source.startsWith("shopify:")).map((p) => p.source)
  )).sort()];

  const filtered = items.filter((p) => {
    if (source !== "all" && p.source !== source) return false;
    if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const onDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await api(`/products/${id}`, { method: "DELETE" });
    setItems((arr) => arr.filter((x) => x.id !== id));
  };

  return (
    <Shell
      portal="reseller"
      title="Products"
      subtitle="Each product gets a unique WhatsApp tracking link for ads."
    >
      <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between mb-4">
        <div className="w-full md:w-80">
          <Input
            placeholder="Search products"
            leftIcon={<Search size={15} />}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={() => setAddOpen(true)}>
          Add Product
        </Button>
      </div>

      {/* Source filter chips: "all", "manual", + one chip per connected
          Shopify store. Each store's products stay distinct (not merged). */}
      {sources.length > 2 && (
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <span className="text-xs text-[var(--text-secondary)] mr-1">Source:</span>
          {sources.map((s) => {
            const label = s === "all" ? "All"
              : s === "manual" ? "Manual"
              : s.replace("shopify:", "Shopify · ");
            const count = s === "all"
              ? items.length
              : items.filter((p) => p.source === s).length;
            const active = s === source;
            return (
              <button
                key={s}
                onClick={() => setSource(s)}
                className={`inline-flex items-center gap-1.5 px-3 h-8 rounded-full border text-xs font-medium ${
                  active
                    ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "border-[var(--border)] bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {label}
                <span className={`text-[10px] ${active ? "opacity-80" : "text-[var(--text-muted)]"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {err && (
        <div className="mb-5 text-sm text-[var(--danger)] bg-[var(--danger-soft)] border border-red-200 rounded-lg px-3 py-2">
          {err}
        </div>
      )}

      {loading ? (
        <Card>Loading products…</Card>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Plus />}
            title={q ? "No products match your search" : "No products yet"}
            description={q ? "Try a different name." : "Add your first product to generate a tracking link."}
            action={!q && <Button onClick={() => setAddOpen(true)}>Add Product</Button>}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
          {filtered.map((p) => (
            <Card key={p.id} padded={false} className="overflow-hidden flex flex-col">
              <div className="relative aspect-[4/3] bg-slate-100">
                {p.image_url ? (
                  <Image src={p.image_url} alt={p.name} fill sizes="(min-width:1280px) 25vw, 50vw" className="object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                    <ImageIcon size={32} />
                  </div>
                )}
                <div className="absolute top-3 left-3 flex gap-1.5">
                  {p.channels.includes("whatsapp") && <Badge tone="success" dot>WhatsApp</Badge>}
                  {p.channels.includes("shopify") && <Badge tone="violet" dot>Shopify</Badge>}
                </div>
                <div className="absolute top-3 right-3">
                  <Badge tone="neutral">{countryFlag[p.country] ?? "🌍"} {p.country}</Badge>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-[var(--text-primary)] leading-tight">{p.name}</h3>
                  <div className="text-right text-base font-bold font-display whitespace-nowrap">{money(p.price, p.currency)}</div>
                </div>
                {p.description && (
                  <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">{p.description}</p>
                )}
                {(p.variants.length > 0 || p.bundles.length > 0 || p.discount_type) && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {p.variants.length > 0 && <Badge tone="info">{p.variants.length} variants</Badge>}
                    {p.bundles.length > 0 && <Badge tone="violet">{p.bundles.length} bundles</Badge>}
                    {p.discount_type && (
                      <Badge tone="success">
                        {p.discount_value}{p.discount_type === "percent" ? "%" : ""} off
                      </Badge>
                    )}
                  </div>
                )}
                <div className="mt-3">
                  <CopyField value={p.generated_url} />
                </div>
                <p className="text-[11px] text-[var(--text-muted)] mt-1.5">
                  Use this link on your "Shop Now" ad button.
                </p>
                <div className="flex gap-2 mt-3 pt-3 border-t border-[var(--border)]">
                  <a
                    href={p.generated_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 h-8 rounded-lg border border-[var(--border)] text-xs text-slate-700 hover:bg-slate-50"
                  >
                    <ExternalLink size={13} /> Open
                  </a>
                  <button
                    onClick={() => setEditing(p)}
                    className="ml-auto text-slate-400 hover:text-[var(--accent)] p-1.5 hover:bg-emerald-50 rounded"
                    aria-label="Edit product"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => onDelete(p.id)}
                    className="text-slate-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded"
                    aria-label="Delete product"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {addOpen && (
        <ProductEditor
          open={addOpen}
          onClose={() => setAddOpen(false)}
          onSaved={load}
        />
      )}

      {editing && (
        <ProductEditor
          open={!!editing}
          onClose={() => setEditing(null)}
          onSaved={load}
          product={editing}
        />
      )}
    </Shell>
  );
}
