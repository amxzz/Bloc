export interface SystemSettings {
  // Operational Parameters
  taxPercentage: number; // e.g. 10 for 10%
  defaultScoopWeightGrams: number; // e.g. 70
  maxShelfLifeDays: number; // e.g. 8 days
  poOwnerApprovalThreshold: number; // e.g. 10000000 (10 Million IDR)
  
  // Loyalty Point Rules & Member Tiers
  loyaltyPointEarnRate: number; // Spend amount per 1 point, e.g. 10000 = 1 pt per 10k IDR
  loyaltyPointRedeemValue: number; // Discount value per 1 point, e.g. 500 IDR per point
  pointExpiryDays: number; // 365 days
  memberRegistrationFee: number; // 0 for free
  silverBirthdayScoops: number; // 1 scoop
  goldBirthdayScoops: number; // 2 scoops
  silverDiscountPercent: number; // 5%
  goldDiscountPercent: number; // 10%

  // Showcase Configuration
  freezerCount: number; // 3 (A, B, C)
  slotsPerFreezer: number; // 18 slots (3x6 grid)
  totalSlots: number; // 54 slots total
}

export type StoreSettings = SystemSettings;

export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  taxPercentage: 10,
  defaultScoopWeightGrams: 70,
  maxShelfLifeDays: 8,
  poOwnerApprovalThreshold: 10000000,
  loyaltyPointEarnRate: 10000,
  loyaltyPointRedeemValue: 500,
  pointExpiryDays: 365,
  memberRegistrationFee: 0,
  silverBirthdayScoops: 1,
  goldBirthdayScoops: 2,
  silverDiscountPercent: 5,
  goldDiscountPercent: 10,
  freezerCount: 3,
  slotsPerFreezer: 18,
  totalSlots: 54,
};
