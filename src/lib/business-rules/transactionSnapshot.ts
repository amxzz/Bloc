import { Transaction, CartItem, PaymentMethod, Member } from "@/types/cashier";
import { PricingCalculationResult } from "./pricingEngine";

export interface CreateTransactionParams {
  receiptNumber: string;
  cashierUsername: string;
  shiftId: string;
  items: CartItem[];
  pricing: PricingCalculationResult;
  paymentMethod: PaymentMethod;
  cashTendered?: number;
  changeDue?: number;
  member?: Member | null;
  pointsRedeemed?: number;
}

/**
 * Builds an immutable, self-contained transaction snapshot
 * storing exact historical prices, tax breakdowns, member perks,
 * and cashier operational details.
 */
export class TransactionSnapshotBuilder {
  public static createSnapshot(params: CreateTransactionParams): Transaction {
    const {
      receiptNumber,
      cashierUsername,
      shiftId,
      items,
      pricing,
      paymentMethod,
      cashTendered,
      changeDue,
      member,
      pointsRedeemed,
    } = params;

    // Deep copy items to preserve frozen historical state
    const frozenItems: CartItem[] = items.map((item) => ({
      id: item.id,
      packaging: { ...item.packaging },
      selectedFlavors: item.selectedFlavors.map((f) => ({ ...f })),
      selectedToppings: item.selectedToppings.map((t) => ({ ...t })),
      selectedSauces: item.selectedSauces.map((s) => ({ ...s })),
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
    }));

    const transaction: Transaction = {
      id: `trx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      receiptNumber,
      cashierUsername,
      shiftId,
      items: frozenItems,
      subtotalAmount: pricing.subtotal,
      discountAmount: pricing.memberDiscount,
      taxableBase: pricing.taxableBase,
      taxAmount: pricing.taxAmount,
      totalAmount: pricing.total,
      paymentMethod,
      cashTendered,
      changeDue,
      paymentStatus: "paid",
      memberId: member ? member.id : undefined,
      pointsEarned: pricing.pointsEarned,
      pointsRedeemed: pointsRedeemed || 0,
      createdAt: new Date().toLocaleString("id-ID"),
    };

    return transaction;
  }
}
