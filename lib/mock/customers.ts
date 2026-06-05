import type { Customer } from "./types";

export const customers: Customer[] = [
  { id: "c1", name: "Ahmed Mansour", phone: "+971 50 123 4567", location: "Dubai, UAE", customerSince: "2024-08-12", totalOrders: 7, totalSpent: 1840 },
  { id: "c2", name: "Fatima Al-Zahra", phone: "+971 55 987 6543", location: "Abu Dhabi, UAE", customerSince: "2025-01-03", totalOrders: 3, totalSpent: 620 },
  { id: "c3", name: "Hassan Iqbal", phone: "+92 300 5551122", location: "Karachi, PAK", customerSince: "2025-04-22", totalOrders: 12, totalSpent: 3140 },
  { id: "c4", name: "Layla Mahmoud", phone: "+966 50 778 9900", location: "Riyadh, KSA", customerSince: "2024-11-30", totalOrders: 5, totalSpent: 1290 },
  { id: "c5", name: "Omar Khalifa", phone: "+971 52 444 5566", location: "Sharjah, UAE", customerSince: "2026-02-14", totalOrders: 1, totalSpent: 175 },
  { id: "c6", name: "Sara Yousef", phone: "+971 50 222 8899", location: "Dubai, UAE", customerSince: "2025-06-08", totalOrders: 4, totalSpent: 980 },
  { id: "c7", name: "Bilal Hussain", phone: "+92 333 6677889", location: "Lahore, PAK", customerSince: "2025-09-19", totalOrders: 2, totalSpent: 410 },
  { id: "c8", name: "Mariam Saleh", phone: "+966 55 332 1100", location: "Jeddah, KSA", customerSince: "2025-12-01", totalOrders: 6, totalSpent: 1670 },
  { id: "c9", name: "Khalid Rashid", phone: "+971 56 991 2233", location: "Dubai, UAE", customerSince: "2026-03-15", totalOrders: 1, totalSpent: 240 },
  { id: "c10", name: "Nadia Farooq", phone: "+92 321 4455667", location: "Islamabad, PAK", customerSince: "2025-07-11", totalOrders: 8, totalSpent: 2105 },
  { id: "c11", name: "Yusuf Ahmadi", phone: "+971 50 667 8800", location: "Ajman, UAE", customerSince: "2026-01-20", totalOrders: 2, totalSpent: 360 },
  { id: "c12", name: "Aisha Karim", phone: "+966 53 110 2244", location: "Dammam, KSA", customerSince: "2025-10-04", totalOrders: 4, totalSpent: 890 },
];

export function customerById(id: string) {
  return customers.find((c) => c.id === id);
}
