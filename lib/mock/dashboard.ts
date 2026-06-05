export const resellerStats = {
  totalConversations: { value: 1248, delta: 18.6, direction: "up" as const },
  ordersCreated: { value: 236, delta: 12.4, direction: "up" as const },
  confirmedOrders: { value: 184, delta: 9.1, direction: "up" as const },
  conversionRate: { value: 14.7, delta: -1.2, direction: "down" as const },
  revenue: { value: 38420, currency: "AED", delta: 22.3, direction: "up" as const },
};

export const conversationsSeries = [
  { day: "Mon", conversations: 142, orders: 28 },
  { day: "Tue", conversations: 168, orders: 34 },
  { day: "Wed", conversations: 195, orders: 41 },
  { day: "Thu", conversations: 178, orders: 38 },
  { day: "Fri", conversations: 224, orders: 48 },
  { day: "Sat", conversations: 198, orders: 32 },
  { day: "Sun", conversations: 143, orders: 15 },
];

export const orderStatusBreakdown = [
  { name: "Confirmed", value: 184, color: "var(--accent)" },
  { name: "Hold", value: 28, color: "var(--warning)" },
  { name: "Processing", value: 16, color: "var(--info)" },
  { name: "Cancelled", value: 8, color: "var(--danger)" },
];

export const topProducts = [
  { productId: "p1", name: "Wireless Earbuds Pro", image: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=120&q=70", orders: 64, trend: 22 },
  { productId: "p6", name: "Mini Projector HD", image: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&w=120&q=70", orders: 48, trend: 14 },
  { productId: "p2", name: "Smart Fitness Watch", image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=120&q=70", orders: 39, trend: 9 },
  { productId: "p8", name: "Aromatherapy Diffuser", image: "https://images.unsplash.com/photo-1602928298849-325cec8771c0?auto=format&fit=crop&w=120&q=70", orders: 33, trend: -4 },
  { productId: "p4", name: "LED Desk Lamp", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=120&q=70", orders: 28, trend: 6 },
];

export const aiPerformance = {
  successRate: 92,
  handledByAI: { value: 1148, delta: 11.2 },
  humanTakeover: { value: 100, delta: -3.4 },
};

export const adminStats = {
  totalResellers: { value: 142, delta: 8.4, direction: "up" as const },
  activeWhatsApp: { value: 118, delta: 6.2, direction: "up" as const },
  activeShopify: { value: 71, delta: 14.8, direction: "up" as const },
  totalConversations: { value: 32480, delta: 19.4, direction: "up" as const },
  totalOrders: { value: 5612, delta: 11.7, direction: "up" as const },
  platformRevenue: { value: 1284300, currency: "AED", delta: 24.1, direction: "up" as const },
  aiSuccessRate: { value: 90.4, delta: 1.8, direction: "up" as const },
};

export const onboardingSteps = [
  { label: "Account Created", done: true },
  { label: "Business Information", done: true },
  { label: "WhatsApp Number Connected", done: true },
  { label: "Product Added", done: true },
  { label: "AI Training", done: true },
  { label: "CRM Connected", done: false },
  { label: "Ad Link Generated", done: false },
];
