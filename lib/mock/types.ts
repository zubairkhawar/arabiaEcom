export type Channel = "whatsapp" | "shopify";
export type OrderStatus = "confirmed" | "hold" | "cancelled" | "processing";
export type ChatMode = "ai" | "human";

export interface Product {
  id: string;
  name: string;
  image: string;
  description: string;
  price: number;
  currency: string;
  country: string;
  channels: Channel[];
  generatedUrl: string;
  source: string;
  stock?: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  location: string;
  customerSince: string;
  totalOrders: number;
  totalSpent: number;
  avatar?: string;
}

export interface OrderItem {
  productId: string;
  qty: number;
}

export interface Order {
  id: string;
  customerId: string;
  resellerId: string;
  items: OrderItem[];
  amount: number;
  currency: string;
  channel: Channel;
  status: OrderStatus;
  source: string;
  createdAt: string;
}

export interface Message {
  id: string;
  from: "customer" | "ai" | "human";
  text: string;
  at: string;
}

export interface Chat {
  id: string;
  customerId: string;
  resellerId: string;
  channel: Channel;
  mode: ChatMode;
  unread: number;
  messages: Message[];
  draftItems?: { productId: string; qty: number }[];
}

export interface Reseller {
  id: string;
  name: string;
  email: string;
  plan: "Starter" | "Growth" | "Scale";
  channels: Channel[];
  productsCount: number;
  ordersCount: number;
  revenue: number;
  status: "active" | "trial" | "suspended";
  lastActive: string;
}

export interface PoolNumber {
  id: string;
  number: string;
  country: string;
  countryCode: string;
  flag: string;
  assigned: number;
  capacity: number;
  status: "active" | "full" | "disabled";
}

export interface PoolAssignment {
  resellerId: string;
  resellerName: string;
  numberId: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  level: "Owner" | "Admin" | "Support";
  enabled: boolean;
  addedAt: string;
}

export interface AISettings {
  aiName: string;
  role: string;
  tone: "Friendly" | "Professional" | "Playful" | "Direct";
  creativity: number;
  responseLength: "Short" | "Medium" | "Long";
  primaryLanguage: string;
  supportedLanguages: string[];
  alwaysSoundHuman: boolean;
  upsellAggressiveness: number;
  convinceHesitant: boolean;
  fallbackToHuman: boolean;
  businessHours: { day: string; open: string; close: string; enabled: boolean }[];
}
