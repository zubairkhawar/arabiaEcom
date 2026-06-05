import type { PoolNumber, PoolAssignment } from "./types";

export const poolNumbers: PoolNumber[] = [
  { id: "n-uae-1", number: "+971 4 555 0101", country: "United Arab Emirates", countryCode: "UAE", flag: "🇦🇪", assigned: 50, capacity: 50, status: "full" },
  { id: "n-uae-2", number: "+971 4 555 0102", country: "United Arab Emirates", countryCode: "UAE", flag: "🇦🇪", assigned: 50, capacity: 50, status: "full" },
  { id: "n-uae-3", number: "+971 4 555 0103", country: "United Arab Emirates", countryCode: "UAE", flag: "🇦🇪", assigned: 23, capacity: 50, status: "active" },
  { id: "n-uae-4", number: "+971 4 555 0104", country: "United Arab Emirates", countryCode: "UAE", flag: "🇦🇪", assigned: 0, capacity: 50, status: "active" },
  { id: "n-pak-1", number: "+92 21 555 0201", country: "Pakistan", countryCode: "PAK", flag: "🇵🇰", assigned: 50, capacity: 50, status: "full" },
  { id: "n-pak-2", number: "+92 21 555 0202", country: "Pakistan", countryCode: "PAK", flag: "🇵🇰", assigned: 31, capacity: 50, status: "active" },
  { id: "n-pak-3", number: "+92 21 555 0203", country: "Pakistan", countryCode: "PAK", flag: "🇵🇰", assigned: 0, capacity: 50, status: "disabled" },
  { id: "n-ksa-1", number: "+966 11 555 0301", country: "Saudi Arabia", countryCode: "KSA", flag: "🇸🇦", assigned: 50, capacity: 50, status: "full" },
  { id: "n-ksa-2", number: "+966 11 555 0302", country: "Saudi Arabia", countryCode: "KSA", flag: "🇸🇦", assigned: 18, capacity: 50, status: "active" },
];

export const poolAssignments: PoolAssignment[] = [
  { resellerId: "r1", resellerName: "Aurora Store", numberId: "n-uae-1" },
  { resellerId: "r4", resellerName: "Gadget Souq", numberId: "n-uae-3" },
  { resellerId: "r6", resellerName: "Home Essentials Dubai", numberId: "n-uae-2" },
  { resellerId: "r11", resellerName: "Khaleej Gifts", numberId: "n-uae-1" },
  { resellerId: "r14", resellerName: "Dubai Pet Co.", numberId: "n-uae-2" },
  { resellerId: "r15", resellerName: "Abu Dhabi Decor", numberId: "n-uae-3" },
  { resellerId: "r2", resellerName: "Karachi Tech", numberId: "n-pak-1" },
  { resellerId: "r7", resellerName: "Lahore Style", numberId: "n-pak-2" },
  { resellerId: "r9", resellerName: "Tech Pakistan", numberId: "n-pak-1" },
  { resellerId: "r13", resellerName: "Islamabad Smart Home", numberId: "n-pak-2" },
  { resellerId: "r5", resellerName: "Riyadh Fitness Co.", numberId: "n-ksa-1" },
  { resellerId: "r8", resellerName: "Jeddah Beauty", numberId: "n-ksa-1" },
  { resellerId: "r12", resellerName: "Mecca Modest Wear", numberId: "n-ksa-2" },
];
