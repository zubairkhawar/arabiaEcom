"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, ExternalLink, Search, ImageIcon, Trash2 } from "lucide-react";
import { Shell } from "@/components/layout/Shell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { CopyField } from "@/components/ui/CopyField";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { api } from "@/lib/api";
import { money } from "@/lib/format";

const countryFlag: Record<string, string> = { UAE: "🇦🇪", PAK: "🇵🇰", KSA: "🇸🇦" };

interface ProductOut {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  description: string | null;
  main_description: string | null;
  key_points: string[];
  price: number;
  currency: string;
  country: string;
  channels: string[];
  discount_type: string | null;
  discount_value: number | null;
  active: boolean;
  source: string;
  options: { name: string; values: string[]; position: number }[];
  variants: { id: string; label: string; combo: Record<string, string>; price: number | null; stock: number | null; sku: string | null }[];
  bundles: { qty: number; price: number }[];
  generated_url: string;
  created_at: string;
}

export default function ProductsPage() {
  const [items, setItems] = useState<ProductOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState<string | null>(null);

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

  const filtered = items.filter((p) =>
    p.name.toLowerCase().includes(q.toLowerCase())
  );

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
      <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between mb-6">
        <div className="w-full md:w-80">
          <Input
            placeholder="Search products"
            leftIcon={<Search size={15} />}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={() => setOpen(true)}>
          Add Product
        </Button>
      </div>

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
            action={!q && <Button onClick={() => setOpen(true)}>Add Product</Button>}
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
                    onClick={() => onDelete(p.id)}
                    className="ml-auto text-slate-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {open && <AddProductModal onClose={() => setOpen(false)} onCreated={load} />}
    </Shell>
  );
}

function AddProductModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [description, setDescription] = useState("");
  const [mainDescription, setMainDescription] = useState("");
  const [price, setPrice] = useState("199");
  const [currency, setCurrency] = useState("AED");
  const [country, setCountry] = useState("UAE");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setErr(null);
    try {
      await api("/products", {
        method: "POST",
        body: {
          name, image_url: imgUrl || null,
          description: description || null,
          main_description: mainDescription || null,
          key_points: [],
          price: Number(price) || 0,
          currency,
          country,
          channels: ["whatsapp"],
        },
      });
      onCreated();
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={true}
      onClose={onClose}
      title="Add product"
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={busy || !name || !price}>
            {busy ? "Saving…" : "Save & generate link"}
          </Button>
        </>
      }
    >
      <div className="grid md:grid-cols-2 gap-5">
        <div className="space-y-4">
          <Input label="Product name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Wireless Earbuds Pro" />
          <Input label="Image URL (optional)" value={imgUrl} onChange={(e) => setImgUrl(e.target.value)} placeholder="https://…/photo.jpg" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Price" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="199" />
            <Select label="Currency" value={currency} onChange={(e) => setCurrency(e.target.value)}
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
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            options={[
              { value: "UAE", label: "🇦🇪 UAE" },
              { value: "PAK", label: "🇵🇰 Pakistan" },
              { value: "KSA", label: "🇸🇦 Saudi Arabia" },
            ]}
          />
        </div>
        <div className="space-y-4">
          <Input label="Short tagline" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="ANC + 24h battery" />
          <Textarea label="Full description" value={mainDescription} onChange={(e) => setMainDescription(e.target.value)} placeholder="What makes this product special?" />
          <div className="text-xs text-[var(--text-muted)] bg-slate-50 border border-[var(--border)] rounded-lg p-3">
            Variants, bundles and discounts can be added next via API (full editor coming).
          </div>
        </div>
      </div>
      {err && (
        <div className="mt-4 text-sm text-[var(--danger)] bg-[var(--danger-soft)] border border-red-200 rounded-lg px-3 py-2">
          {err}
        </div>
      )}
    </Modal>
  );
}
