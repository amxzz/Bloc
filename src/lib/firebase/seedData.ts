import { Member } from "@/types/cashier";

export const SEED_MEMBERS: Member[] = [
  {
    id: "mem-01",
    memberCode: "MBR-8821",
    fullName: "Amanda Putri",
    phoneNumber: "081298765432",
    tier: "Gold",
    totalSpent: 1250000,
    loyaltyPoints: 250,
    registeredAt: "2026-01-10",
  },
  {
    id: "mem-02",
    memberCode: "MBR-8822",
    fullName: "Bambang Wijaya",
    phoneNumber: "081311223344",
    tier: "Silver",
    totalSpent: 450000,
    loyaltyPoints: 90,
    registeredAt: "2026-02-14",
  },
  {
    id: "mem-03",
    memberCode: "MBR-8823",
    fullName: "Clara Sinta",
    phoneNumber: "081555667788",
    tier: "Gold",
    totalSpent: 3500000,
    loyaltyPoints: 700,
    registeredAt: "2025-11-05",
  },
];

export const GELATO_SERIES_META: Record<string, { badgeBg: string; badgeText: string; borderColor: string }> = {
  All: { badgeBg: "bg-slate-100", badgeText: "text-slate-700", borderColor: "border-slate-200" },
  Milk: { badgeBg: "bg-blue-50", badgeText: "text-blue-700", borderColor: "border-blue-200" },
  Chocolate: { badgeBg: "bg-amber-50", badgeText: "text-amber-900", borderColor: "border-amber-200" },
  "Peanut & Nuts": { badgeBg: "bg-orange-50", badgeText: "text-orange-800", borderColor: "border-orange-200" },
  Fruit: { badgeBg: "bg-rose-50", badgeText: "text-rose-700", borderColor: "border-rose-200" },
  "Dairy-Free": { badgeBg: "bg-emerald-50", badgeText: "text-emerald-700", borderColor: "border-emerald-200" },
  Dessert: { badgeBg: "bg-purple-50", badgeText: "text-purple-700", borderColor: "border-purple-200" },
  Tea: { badgeBg: "bg-teal-50", badgeText: "text-teal-700", borderColor: "border-teal-200" },
  Coffee: { badgeBg: "bg-stone-100", badgeText: "text-stone-800", borderColor: "border-stone-300" },
  Seasonal: { badgeBg: "bg-yellow-50", badgeText: "text-yellow-800", borderColor: "border-yellow-300" },
};
