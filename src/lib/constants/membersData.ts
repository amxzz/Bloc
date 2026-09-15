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
