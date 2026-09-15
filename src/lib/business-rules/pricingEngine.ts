import { CartItem, MemberTier } from "@/types/cashier";

export interface PricingCalculationResult {
  subtotal: number;
  memberDiscount: number;
  discountPercentage: number;
  taxableBase: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  pointsEarned: number;
}

/**
 * Centralized calculation engine for Bloc. Gelato retail pricing,
 * standard Indonesian retail tax (PPN 10%), and member tier perks.
 */
export class PricingEngine {
  public static readonly DEFAULT_TAX_RATE = 0.10; // 10% PPN
  public static readonly DEFAULT_POINT_EARN_RATE = 10000; // 1 pt per IDR 10,000

  /**
   * Calculates the raw subtotal of items in the cart.
   */
  public static calculateSubtotal(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + item.totalPrice, 0);
  }

  /**
   * Calculates member discount based on tier:
   * Silver: 5% flat discount
   * Gold: 10% flat discount
   */
  public static calculateMemberDiscount(
    subtotal: number,
    tier?: MemberTier | null
  ): { discountAmount: number; discountPercentage: number } {
    if (!tier) {
      return { discountAmount: 0, discountPercentage: 0 };
    }

    if (tier === "Gold") {
      const discountAmount = Math.round(subtotal * 0.10);
      return { discountAmount, discountPercentage: 10 };
    }

    if (tier === "Silver") {
      const discountAmount = Math.round(subtotal * 0.05);
      return { discountAmount, discountPercentage: 5 };
    }

    return { discountAmount: 0, discountPercentage: 0 };
  }

  /**
   * Centralized calculation of Taxable Base, PPN 10%, Grand Total, and Points.
   * Standard Retail Rule:
   * 1. Taxable Base = Subtotal - Member Discount
   * 2. PPN 10% = Taxable Base * 10%
   * 3. Grand Total = Taxable Base + PPN 10%
   */
  public static calculateOrderPricing(
    items: CartItem[],
    memberTier?: MemberTier | null,
    customTaxRate: number = PricingEngine.DEFAULT_TAX_RATE,
    pointEarnRate: number = PricingEngine.DEFAULT_POINT_EARN_RATE
  ): PricingCalculationResult {
    const subtotal = this.calculateSubtotal(items);
    const { discountAmount: memberDiscount, discountPercentage } = this.calculateMemberDiscount(subtotal, memberTier);
    
    const taxableBase = Math.max(0, subtotal - memberDiscount);
    const taxAmount = Math.round(taxableBase * customTaxRate);
    const total = taxableBase + taxAmount;

    // Loyalty Points: 1 pt per IDR 10,000 for Silver, 2 pts per IDR 10,000 for Gold (2x multiplier)
    const basePoints = Math.floor(taxableBase / pointEarnRate);
    const pointsMultiplier = memberTier === "Gold" ? 2 : 1;
    const pointsEarned = memberTier ? basePoints * pointsMultiplier : 0;

    return {
      subtotal,
      memberDiscount,
      discountPercentage,
      taxableBase,
      taxRate: customTaxRate,
      taxAmount,
      total,
      pointsEarned,
    };
  }

  /**
   * Calculates change due on cash payments.
   */
  public static calculateChange(cashTendered: number, total: number): { changeDue: number; isValid: boolean } {
    const changeDue = cashTendered - total;
    return {
      changeDue: Math.max(0, changeDue),
      isValid: cashTendered >= total,
    };
  }
}
