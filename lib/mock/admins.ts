import type { AdminUser } from "./types";

export const admins: AdminUser[] = [
  { id: "a1", name: "Safdar Khan", email: "safdar@arabia-ai.com", level: "Owner", enabled: true, addedAt: "2024-03-12" },
  { id: "a2", name: "Zubair Khawar", email: "zubair@arabia-ai.com", level: "Admin", enabled: true, addedAt: "2024-05-01" },
  { id: "a3", name: "Imran Tahir", email: "imran@arabia-ai.com", level: "Admin", enabled: true, addedAt: "2024-09-22" },
  { id: "a4", name: "Sana Ali", email: "sana@arabia-ai.com", level: "Support", enabled: true, addedAt: "2025-02-18" },
  { id: "a5", name: "Yousef Hamdan", email: "yousef@arabia-ai.com", level: "Support", enabled: false, addedAt: "2025-06-30" },
  { id: "a6", name: "Rania Najjar", email: "rania@arabia-ai.com", level: "Admin", enabled: true, addedAt: "2025-11-11" },
];
