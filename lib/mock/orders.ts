import type { Order } from "./types";

export const orders: Order[] = [
  { id: "ORD-2041", customerId: "c1", resellerId: "r1", items: [{ productId: "p1", qty: 1 }], amount: 199, currency: "AED", channel: "whatsapp", status: "confirmed", source: "WA Link · earbuds-pro", createdAt: "2026-06-05T09:12:00Z" },
  { id: "ORD-2040", customerId: "c2", resellerId: "r1", items: [{ productId: "p2", qty: 1 }, { productId: "p8", qty: 2 }], amount: 539, currency: "AED", channel: "whatsapp", status: "hold", source: "WA Link · fit-watch", createdAt: "2026-06-05T08:45:00Z" },
  { id: "ORD-2039", customerId: "c3", resellerId: "r2", items: [{ productId: "p4", qty: 3 }], amount: 360, currency: "AED", channel: "shopify", status: "confirmed", source: "Aurora Store", createdAt: "2026-06-05T07:20:00Z" },
  { id: "ORD-2038", customerId: "c4", resellerId: "r1", items: [{ productId: "p5", qty: 1 }], amount: 145, currency: "AED", channel: "whatsapp", status: "processing", source: "WA Universal · KSA", createdAt: "2026-06-05T06:55:00Z" },
  { id: "ORD-2037", customerId: "c5", resellerId: "r3", items: [{ productId: "p3", qty: 1 }], amount: 175, currency: "AED", channel: "shopify", status: "cancelled", source: "Aurora Store", createdAt: "2026-06-05T05:40:00Z" },
  { id: "ORD-2036", customerId: "c6", resellerId: "r1", items: [{ productId: "p8", qty: 1 }, { productId: "p1", qty: 1 }], amount: 294, currency: "AED", channel: "whatsapp", status: "confirmed", source: "WA Link · diffuser", createdAt: "2026-06-04T22:18:00Z" },
  { id: "ORD-2035", customerId: "c7", resellerId: "r2", items: [{ productId: "p9", qty: 2 }], amount: 260, currency: "AED", channel: "whatsapp", status: "confirmed", source: "WA Universal · PAK", createdAt: "2026-06-04T20:02:00Z" },
  { id: "ORD-2034", customerId: "c8", resellerId: "r1", items: [{ productId: "p10", qty: 1 }], amount: 165, currency: "AED", channel: "shopify", status: "confirmed", source: "Aurora Store", createdAt: "2026-06-04T18:31:00Z" },
  { id: "ORD-2033", customerId: "c9", resellerId: "r4", items: [{ productId: "p6", qty: 1 }], amount: 599, currency: "AED", channel: "whatsapp", status: "hold", source: "WA Link · mini-projector", createdAt: "2026-06-04T16:14:00Z" },
  { id: "ORD-2032", customerId: "c10", resellerId: "r2", items: [{ productId: "p9", qty: 1 }, { productId: "p4", qty: 2 }], amount: 370, currency: "AED", channel: "whatsapp", status: "confirmed", source: "WA Universal · PAK", createdAt: "2026-06-04T13:08:00Z" },
  { id: "ORD-2031", customerId: "c11", resellerId: "r1", items: [{ productId: "p1", qty: 1 }, { productId: "p9", qty: 1 }], amount: 329, currency: "AED", channel: "whatsapp", status: "processing", source: "WA Link · earbuds-pro", createdAt: "2026-06-04T11:47:00Z" },
  { id: "ORD-2030", customerId: "c12", resellerId: "r3", items: [{ productId: "p5", qty: 2 }], amount: 290, currency: "AED", channel: "shopify", status: "confirmed", source: "Boutique Layla", createdAt: "2026-06-04T09:22:00Z" },
  { id: "ORD-2029", customerId: "c1", resellerId: "r1", items: [{ productId: "p2", qty: 1 }], amount: 349, currency: "AED", channel: "whatsapp", status: "confirmed", source: "WA Link · fit-watch", createdAt: "2026-06-03T19:11:00Z" },
  { id: "ORD-2028", customerId: "c3", resellerId: "r2", items: [{ productId: "p7", qty: 1 }], amount: 289, currency: "AED", channel: "shopify", status: "confirmed", source: "Boutique Layla", createdAt: "2026-06-03T17:00:00Z" },
  { id: "ORD-2027", customerId: "c5", resellerId: "r1", items: [{ productId: "p1", qty: 2 }], amount: 398, currency: "AED", channel: "whatsapp", status: "cancelled", source: "WA Link · earbuds-pro", createdAt: "2026-06-03T15:34:00Z" },
  { id: "ORD-2026", customerId: "c6", resellerId: "r4", items: [{ productId: "p6", qty: 1 }], amount: 599, currency: "AED", channel: "whatsapp", status: "confirmed", source: "WA Link · mini-projector", createdAt: "2026-06-03T14:20:00Z" },
  { id: "ORD-2025", customerId: "c8", resellerId: "r3", items: [{ productId: "p10", qty: 2 }], amount: 330, currency: "AED", channel: "shopify", status: "hold", source: "Aurora Store", createdAt: "2026-06-03T12:05:00Z" },
  { id: "ORD-2024", customerId: "c10", resellerId: "r2", items: [{ productId: "p4", qty: 5 }], amount: 600, currency: "AED", channel: "whatsapp", status: "confirmed", source: "WA Universal · PAK", createdAt: "2026-06-03T10:51:00Z" },
  { id: "ORD-2023", customerId: "c2", resellerId: "r1", items: [{ productId: "p8", qty: 1 }], amount: 95, currency: "AED", channel: "whatsapp", status: "confirmed", source: "WA Link · diffuser", createdAt: "2026-06-02T22:43:00Z" },
  { id: "ORD-2022", customerId: "c12", resellerId: "r3", items: [{ productId: "p3", qty: 1 }], amount: 175, currency: "AED", channel: "shopify", status: "processing", source: "Aurora Store", createdAt: "2026-06-02T20:00:00Z" },
  { id: "ORD-2021", customerId: "c4", resellerId: "r1", items: [{ productId: "p2", qty: 1 }, { productId: "p8", qty: 1 }], amount: 444, currency: "AED", channel: "whatsapp", status: "confirmed", source: "WA Universal · KSA", createdAt: "2026-06-02T17:35:00Z" },
  { id: "ORD-2020", customerId: "c7", resellerId: "r2", items: [{ productId: "p9", qty: 1 }], amount: 130, currency: "AED", channel: "whatsapp", status: "hold", source: "WA Universal · PAK", createdAt: "2026-06-02T15:18:00Z" },
  { id: "ORD-2019", customerId: "c9", resellerId: "r4", items: [{ productId: "p1", qty: 1 }], amount: 199, currency: "AED", channel: "whatsapp", status: "confirmed", source: "WA Link · earbuds-pro", createdAt: "2026-06-02T13:00:00Z" },
  { id: "ORD-2018", customerId: "c11", resellerId: "r1", items: [{ productId: "p4", qty: 1 }], amount: 120, currency: "AED", channel: "shopify", status: "confirmed", source: "Aurora Store", createdAt: "2026-06-02T11:22:00Z" },
  { id: "ORD-2017", customerId: "c3", resellerId: "r2", items: [{ productId: "p10", qty: 1 }], amount: 165, currency: "AED", channel: "shopify", status: "cancelled", source: "Aurora Store", createdAt: "2026-06-01T20:09:00Z" },
  { id: "ORD-2016", customerId: "c1", resellerId: "r1", items: [{ productId: "p1", qty: 3 }], amount: 597, currency: "AED", channel: "whatsapp", status: "confirmed", source: "WA Link · earbuds-pro", createdAt: "2026-06-01T18:14:00Z" },
  { id: "ORD-2015", customerId: "c6", resellerId: "r3", items: [{ productId: "p7", qty: 1 }], amount: 289, currency: "AED", channel: "shopify", status: "confirmed", source: "Boutique Layla", createdAt: "2026-06-01T16:01:00Z" },
  { id: "ORD-2014", customerId: "c5", resellerId: "r1", items: [{ productId: "p8", qty: 2 }], amount: 190, currency: "AED", channel: "whatsapp", status: "processing", source: "WA Link · diffuser", createdAt: "2026-06-01T13:55:00Z" },
  { id: "ORD-2013", customerId: "c10", resellerId: "r2", items: [{ productId: "p9", qty: 1 }], amount: 130, currency: "AED", channel: "whatsapp", status: "confirmed", source: "WA Universal · PAK", createdAt: "2026-06-01T11:30:00Z" },
  { id: "ORD-2012", customerId: "c8", resellerId: "r1", items: [{ productId: "p2", qty: 1 }], amount: 349, currency: "AED", channel: "whatsapp", status: "confirmed", source: "WA Universal · KSA", createdAt: "2026-05-31T22:47:00Z" },
];

export function orderById(id: string) {
  return orders.find((o) => o.id === id);
}
