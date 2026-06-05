import type { AISettings } from "./types";

export const defaultAISettings: AISettings = {
  aiName: "Max",
  role: "Friendly sales assistant who guides customers from ad-click to confirmed order, answers product questions, and converts hesitant buyers.",
  tone: "Friendly",
  creativity: 65,
  responseLength: "Medium",
  primaryLanguage: "English",
  supportedLanguages: ["English", "Arabic", "Urdu"],
  alwaysSoundHuman: true,
  upsellAggressiveness: 40,
  convinceHesitant: true,
  fallbackToHuman: true,
  businessHours: [
    { day: "Mon", open: "09:00", close: "21:00", enabled: true },
    { day: "Tue", open: "09:00", close: "21:00", enabled: true },
    { day: "Wed", open: "09:00", close: "21:00", enabled: true },
    { day: "Thu", open: "09:00", close: "21:00", enabled: true },
    { day: "Fri", open: "14:00", close: "21:00", enabled: true },
    { day: "Sat", open: "10:00", close: "20:00", enabled: true },
    { day: "Sun", open: "10:00", close: "18:00", enabled: false },
  ],
};
