import type { Reseller } from "./types";

export const resellers: Reseller[] = [
  { id: "r1", name: "Aurora Store", email: "layla@aurorastore.ae", plan: "Scale", channels: ["whatsapp", "shopify"], productsCount: 38, ordersCount: 1240, revenue: 184500, status: "active", lastActive: "2026-06-05T09:12:00Z" },
  { id: "r2", name: "Karachi Tech", email: "hassan@karachitech.pk", plan: "Growth", channels: ["whatsapp"], productsCount: 21, ordersCount: 612, revenue: 78400, status: "active", lastActive: "2026-06-05T08:51:00Z" },
  { id: "r3", name: "Boutique Layla", email: "owner@boutiquelayla.com", plan: "Growth", channels: ["shopify"], productsCount: 54, ordersCount: 845, revenue: 121300, status: "active", lastActive: "2026-06-05T07:40:00Z" },
  { id: "r4", name: "Gadget Souq", email: "info@gadgetsouq.ae", plan: "Starter", channels: ["whatsapp"], productsCount: 12, ordersCount: 188, revenue: 32100, status: "trial", lastActive: "2026-06-04T22:14:00Z" },
  { id: "r5", name: "Riyadh Fitness Co.", email: "ops@riyadhfit.sa", plan: "Growth", channels: ["whatsapp", "shopify"], productsCount: 27, ordersCount: 410, revenue: 59700, status: "active", lastActive: "2026-06-04T19:30:00Z" },
  { id: "r6", name: "Home Essentials Dubai", email: "support@homeess.ae", plan: "Scale", channels: ["whatsapp", "shopify"], productsCount: 92, ordersCount: 1880, revenue: 263000, status: "active", lastActive: "2026-06-05T06:05:00Z" },
  { id: "r7", name: "Lahore Style", email: "team@lahorestyle.pk", plan: "Starter", channels: ["whatsapp"], productsCount: 8, ordersCount: 71, revenue: 11200, status: "trial", lastActive: "2026-06-03T18:22:00Z" },
  { id: "r8", name: "Jeddah Beauty", email: "shop@jeddahbeauty.sa", plan: "Growth", channels: ["whatsapp", "shopify"], productsCount: 41, ordersCount: 730, revenue: 98400, status: "active", lastActive: "2026-06-05T05:14:00Z" },
  { id: "r9", name: "Tech Pakistan", email: "ali@techpk.pk", plan: "Growth", channels: ["whatsapp"], productsCount: 18, ordersCount: 502, revenue: 67300, status: "active", lastActive: "2026-06-04T23:50:00Z" },
  { id: "r10", name: "Sharjah Mart", email: "hi@sharjahmart.ae", plan: "Starter", channels: ["shopify"], productsCount: 14, ordersCount: 144, revenue: 21800, status: "suspended", lastActive: "2026-05-29T11:42:00Z" },
  { id: "r11", name: "Khaleej Gifts", email: "sales@khaleejgifts.ae", plan: "Growth", channels: ["whatsapp", "shopify"], productsCount: 33, ordersCount: 690, revenue: 95300, status: "active", lastActive: "2026-06-05T04:18:00Z" },
  { id: "r12", name: "Mecca Modest Wear", email: "contact@meccamw.sa", plan: "Growth", channels: ["whatsapp"], productsCount: 22, ordersCount: 380, revenue: 51200, status: "active", lastActive: "2026-06-04T15:00:00Z" },
  { id: "r13", name: "Islamabad Smart Home", email: "team@isbhome.pk", plan: "Starter", channels: ["whatsapp"], productsCount: 9, ordersCount: 88, revenue: 13700, status: "trial", lastActive: "2026-06-02T20:11:00Z" },
  { id: "r14", name: "Dubai Pet Co.", email: "love@dubaipet.ae", plan: "Scale", channels: ["whatsapp", "shopify"], productsCount: 67, ordersCount: 1520, revenue: 214500, status: "active", lastActive: "2026-06-05T08:00:00Z" },
  { id: "r15", name: "Abu Dhabi Decor", email: "hello@addecor.ae", plan: "Growth", channels: ["shopify"], productsCount: 29, ordersCount: 422, revenue: 71900, status: "active", lastActive: "2026-06-04T17:45:00Z" },
];

export function resellerById(id: string) {
  return resellers.find((r) => r.id === id);
}
