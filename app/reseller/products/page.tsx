"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, ExternalLink, QrCode, Search, ImageIcon } from "lucide-react";
import { Shell } from "@/components/layout/Shell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { CopyField } from "@/components/ui/CopyField";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { products } from "@/lib/mock/products";
import { money } from "@/lib/format";

const countryFlag: Record<string, string> = {
  UAE: "🇦🇪",
  PAK: "🇵🇰",
  KSA: "🇸🇦",
};

export default function ProductsPage() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(q.toLowerCase())
  );

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

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
        {filtered.map((p) => (
          <Card key={p.id} padded={false} className="overflow-hidden flex flex-col">
            <div className="relative aspect-[4/3] bg-slate-100">
              <Image
                src={p.image}
                alt={p.name}
                fill
                sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
              <div className="absolute top-3 left-3 flex gap-1.5">
                {p.channels.includes("whatsapp") && (
                  <Badge tone="success" dot>
                    WhatsApp
                  </Badge>
                )}
                {p.channels.includes("shopify") && (
                  <Badge tone="violet" dot>
                    Shopify
                  </Badge>
                )}
              </div>
              <div className="absolute top-3 right-3">
                <Badge tone="neutral">
                  {countryFlag[p.country] ?? "🌍"} {p.country}
                </Badge>
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-[var(--text-primary)] leading-tight">
                  {p.name}
                </h3>
                <div className="text-right text-base font-bold font-display whitespace-nowrap">
                  {money(p.price, p.currency)}
                </div>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">
                {p.description}
              </p>
              {p.source !== "manual" && (
                <div className="mt-2">
                  <Badge tone="violet">
                    From {p.source.replace("shopify:", "Shopify · ")}
                  </Badge>
                </div>
              )}
              <div className="mt-3">
                <CopyField value={p.generatedUrl} />
              </div>
              <p className="text-[11px] text-[var(--text-muted)] mt-1.5">
                Use this link on your "Shop Now" ad button.
              </p>
              <div className="flex gap-2 mt-3 pt-3 border-t border-[var(--border)]">
                <Button variant="outline" size="sm" leftIcon={<ExternalLink size={13} />}>
                  Open
                </Button>
                <Button variant="outline" size="sm" leftIcon={<QrCode size={13} />}>
                  QR
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add product"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>Save & generate link</Button>
          </>
        }
      >
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <div className="aspect-[4/3] rounded-xl border-2 border-dashed border-[var(--border)] flex flex-col items-center justify-center text-[var(--text-secondary)] bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
              <ImageIcon size={28} />
              <div className="text-sm font-medium mt-2">Drop product image</div>
              <div className="text-xs text-[var(--text-muted)] mt-0.5">
                or click to upload · PNG, JPG up to 5MB
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Input label="Selling price" placeholder="199" />
              <Select
                label="Currency"
                options={[
                  { value: "AED", label: "AED" },
                  { value: "USD", label: "USD" },
                  { value: "SAR", label: "SAR" },
                  { value: "PKR", label: "PKR" },
                ]}
              />
            </div>
          </div>
          <div className="space-y-4">
            <Input label="Product name" placeholder="Wireless Earbuds Pro" />
            <Textarea
              label="Description"
              placeholder="What makes this product special?"
            />
            <Select
              label="Target country (required for universal number)"
              options={[
                { value: "UAE", label: "🇦🇪 UAE" },
                { value: "PAK", label: "🇵🇰 Pakistan" },
                { value: "KSA", label: "🇸🇦 Saudi Arabia" },
              ]}
              hint="Customers from this country will be routed to the matching pool number."
            />
            <div>
              <span className="block mb-1.5 text-xs font-medium text-[var(--text-secondary)]">
                Channels
              </span>
              <div className="flex gap-3 text-sm">
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="accent-emerald-500" />
                  WhatsApp
                </label>
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" className="accent-emerald-500" />
                  Shopify
                </label>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </Shell>
  );
}
