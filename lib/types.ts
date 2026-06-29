// Shared TypeScript shapes mirroring backend Pydantic models.

export interface StatDelta {
  value: number;
  delta: number;
  direction: "up" | "down" | "flat";
  currency?: string;
}

export interface SeriesPoint {
  day: string;
  conversations: number;
  orders: number;
}

export interface StatusSlice {
  name: string;
  value: number;
  color: string;
}

export interface TopProduct {
  product_id: string;
  name: string;
  image: string | null;
  orders: number;
  trend: number;
}

export interface RecentChat {
  chat_id: string;
  customer_id: string;
  customer_name: string | null;
  customer_phone: string;
  last_message: string | null;
  last_message_at: string | null;
  unread: number;
  mode: "ai" | "human";
}

export interface AIPerformance {
  success_rate: number;
  handled_by_ai: StatDelta;
  human_takeover: StatDelta;
}

export interface OnboardingStep {
  label: string;
  done: boolean;
}

export interface DashboardOut {
  stats: {
    totalConversations: StatDelta;
    ordersCreated: StatDelta;
    confirmedOrders: StatDelta;
    conversionRate: StatDelta;
    revenue: StatDelta;
  };
  series: SeriesPoint[];
  order_status: StatusSlice[];
  top_products: TopProduct[];
  recent_chats: RecentChat[];
  ai_performance: AIPerformance;
  onboarding: OnboardingStep[];
  currency: string;
}

export interface AdminStatsOut {
  total_resellers: StatDelta;
  active_whatsapp: StatDelta;
  active_shopify: StatDelta;
  total_conversations: StatDelta;
  total_orders: StatDelta;
  platform_revenue: StatDelta;
  ai_success_rate: StatDelta;
  pool_utilization: { country_code: string; used: number; capacity: number }[];
  top_resellers: {
    id: string;
    name: string;
    email: string;
    plan: string;
    status: string;
    revenue: number;
    orders: number;
  }[];
}

export type OrderStatus = "processing" | "confirmed" | "hold" | "cancelled";
export type DeliveryStatus =
  | "pending"
  | "dispatched"
  | "in_transit"
  | "delivered"
  | "returned"
  | "failed";

export interface OrderItemOut {
  id: string;
  product_id: string;
  product_name?: string | null;
  variant_id: string | null;
  variant_label?: string | null;
  qty: number;
  unit_price: number;
  line_total: number;
}

export interface OrderOut {
  id: string;
  code: string;
  reseller_id: string;
  customer_id: string;
  customer_name?: string | null;
  customer_phone?: string | null;
  chat_id: string | null;
  click_session_id: string | null;
  amount: number;
  currency: string;
  channel: string;
  status: OrderStatus;
  delivery_status: DeliveryStatus;
  tracking_number: string | null;
  source: string | null;
  source_platform: string | null;
  follow_up_template_id: string | null;
  follow_up_sent_at: string | null;
  purchase_event_sent: boolean;
  items: OrderItemOut[];
  customer_address: Record<string, unknown> | null;
  created_at: string;
  confirmed_at: string | null;
}

export interface AISettingsOut {
  ai_name: string;
  opening_message: string | null;
  response_length: "Short" | "Medium" | "Long";
  business_hours?: Array<{
    day: string;
    open: string;
    close: string;
    enabled: boolean;
  }>;
}

export interface ResellerSummary {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: string;
  country: string;
  currency: string;
  created_at: string;
}

export interface AdminUserOut {
  id: string;
  name: string;
  email: string;
  level: "Owner" | "Admin" | "Support";
  enabled: boolean;
  created_at: string;
}

export interface PoolNumberOut {
  id: string;
  number: string;
  country: string;
  country_code: string;
  flag: string;
  capacity: number;
  assigned: number;
  status: "active" | "full" | "disabled";
  has_token: boolean;
}

export interface PoolAssignmentOut {
  reseller_id: string;
  reseller_name: string;
  pool_number_id: string;
  number: string;
  country_code: string;
}

export interface AdminOrderRow {
  id: string;
  code: string;
  reseller_id: string;
  reseller_name: string;
  customer_id: string;
  customer_name: string | null;
  customer_phone: string | null;
  amount: number;
  currency: string;
  status: OrderStatus;
  delivery_status: DeliveryStatus;
  channel: string;
  source_platform: string | null;
  tracking_number: string | null;
  source: string | null;
  created_at: string;
}

export interface AdminChatRow {
  id: string;
  reseller_id: string;
  reseller_name: string;
  customer_id: string;
  customer_name: string | null;
  customer_phone: string;
  channel: string;
  mode: "ai" | "human";
  unread: number;
  last_message: string | null;
  last_message_at: string | null;
}

export interface TrackingOverview {
  total_clicks: number;
  total_orders: number;
  delivered: number;
  returned: number;
  overall_conversion: number;
  overall_return_rate: number;
  by_platform: Array<{
    platform: string;
    clicks: number;
    orders: number;
    delivered: number;
    returned: number;
    conversion_rate: number;
    return_rate: number;
  }>;
  by_product_platform: Array<{
    product_id: string;
    product_name: string;
    platform: string;
    clicks: number;
    orders: number;
    delivered: number;
    returned: number;
  }>;
}
