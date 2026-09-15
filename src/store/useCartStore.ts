import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, PaymentMethod, Transaction, Member } from "@/types/cashier";
import { useFreezerStore } from "./useFreezerStore";
import { useSettingsStore } from "./useSettingsStore";
import { useAuditStore } from "./useAuditStore";
import { useShiftStore } from "./useShiftStore";
import { PricingEngine } from "@/lib/business-rules/pricingEngine";
import { InventoryRules } from "@/lib/business-rules/inventoryRules";
import { TransactionSnapshotBuilder } from "@/lib/business-rules/transactionSnapshot";
import { generateStandardId } from "@/lib/utils/formatters";
import { SEED_MEMBERS } from "@/lib/constants/membersData";

interface CartState {
  items: CartItem[];
  paymentMethod: PaymentMethod;
  cashTendered: number;
  selectedMember: Member | null;
  pointsToRedeem: number;
  transactions: Transaction[];
  members: Member[];

  addItem: (item: Omit<CartItem, "id" | "totalPrice">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setCashTendered: (amount: number) => void;
  setSelectedMember: (member: Member | null) => void;
  setPointsToRedeem: (points: number) => void;
  registerMember: (fullName: string, phoneNumber: string) => Member;

  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getTaxableBase: () => number;
  getTax: () => number;
  getTotal: () => number;
  getChange: () => number;

  processCheckout: (cashierUsername: string, shiftId: string) => { success: boolean; transaction?: Transaction; error?: string };
  voidRefundTransaction: (transactionId: string, reason: string, approvedBy: string, type: "void" | "refunded") => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      paymentMethod: "qris",
      cashTendered: 0,
      selectedMember: null,
      pointsToRedeem: 0,
      transactions: [],
      members: SEED_MEMBERS,

      addItem: (itemData) => {
        const itemPrice = itemData.unitPrice;
        const total = itemPrice * itemData.quantity;
        const newItem: CartItem = {
          ...itemData,
          id: `cart-item-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          totalPrice: total,
        };

        set((state) => ({ items: [...state.items, newItem] }));
      },

      removeItem: (id) => {
        set((state) => ({ items: state.items.filter((item) => item.id !== id) }));
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, quantity, totalPrice: item.unitPrice * quantity }
              : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [], cashTendered: 0, selectedMember: null, pointsToRedeem: 0 });
      },

      setPaymentMethod: (method) => {
        set({ paymentMethod: method });
      },

      setCashTendered: (amount) => {
        set({ cashTendered: amount });
      },

      setSelectedMember: (member) => {
        set({ selectedMember: member, pointsToRedeem: 0 });
      },

      setPointsToRedeem: (points) => {
        const member = get().selectedMember;
        const maxPoints = member ? member.loyaltyPoints : 0;
        const validPoints = Math.max(0, Math.min(points, maxPoints));
        set({ pointsToRedeem: validPoints });
      },

      registerMember: (fullName, phoneNumber) => {
        const oneYearExpiry = new Date();
        oneYearExpiry.setFullYear(oneYearExpiry.getFullYear() + 1);

        const currentMembers = get().members;
        const existingNumbers = currentMembers.map((m) => {
          const match = m.memberCode.match(/\d+/g);
          return match ? parseInt(match[match.length - 1], 10) : 0;
        });
        const nextSeq = (existingNumbers.length > 0 ? Math.max(0, ...existingNumbers) : currentMembers.length) + 1;
        const formattedCode = `MBR-${String(nextSeq).padStart(4, "0")}`;

        const newMember: Member = {
          id: `mbr-${String(nextSeq).padStart(2, "0")}`,
          memberCode: formattedCode,
          fullName,
          phoneNumber,
          tier: "Silver", // Starts at Silver (5% discount)
          loyaltyPoints: 10, // Initial welcome bonus
          totalSpent: 0,
          pointsExpiryDate: oneYearExpiry.toISOString().split("T")[0],
          birthdayMonth: new Date().getMonth() + 1,
          registeredAt: new Date().toISOString().split("T")[0],
        };

        set((state) => ({
          members: [newMember, ...state.members],
          selectedMember: newMember,
        }));

        useAuditStore.getState().logAction(
          "TRANSACTION_CREATED",
          "Cashier",
          "cashier",
          `Member ${newMember.memberCode}`,
          `Registered new member: ${fullName} (${phoneNumber}) with sequential code ${newMember.memberCode} as Silver Tier.`
        );

        return newMember;
      },

      getSubtotal: () => {
        return PricingEngine.calculateSubtotal(get().items);
      },

      getDiscountAmount: () => {
        const subtotal = get().getSubtotal();
        const member = get().selectedMember;
        const { discountAmount } = PricingEngine.calculateMemberDiscount(subtotal, member?.tier);
        return discountAmount;
      },

      getTaxableBase: () => {
        const subtotal = get().getSubtotal();
        const discount = get().getDiscountAmount();
        return Math.max(0, subtotal - discount);
      },

      getTax: () => {
        const { taxPercentage } = useSettingsStore.getState().settings;
        const taxableBase = get().getTaxableBase();
        return Math.round(taxableBase * ((taxPercentage || 10) / 100));
      },

      getTotal: () => {
        const taxableBase = get().getTaxableBase();
        const tax = get().getTax();
        return taxableBase + tax;
      },

      getChange: () => {
        const total = get().getTotal();
        const tendered = get().cashTendered;
        return PricingEngine.calculateChange(tendered, total).changeDue;
      },

      processCheckout: (cashierUsername, shiftId) => {
        const items = get().items;
        if (items.length === 0) {
          return { success: false, error: "Keranjang belanja masih kosong." };
        }

        // 0. Strict Shift Open Enforcement
        const activeShift = useShiftStore.getState().activeShift;
        if (!activeShift || activeShift.status !== "open") {
          return {
            success: false,
            error: "Shift kasir belum dibuka. Silakan buka shift terlebih dahulu untuk mulai melayani transaksi.",
          };
        }

        const effectiveShiftId = activeShift.id || shiftId || "shift-01";
        const effectiveCashier = cashierUsername || activeShift.cashierUsername || "csh_sarah";

        const freezerStore = useFreezerStore.getState();
        const { defaultScoopWeightGrams, taxPercentage, loyaltyPointEarnRate } = useSettingsStore.getState().settings;
        const scoopWeight = defaultScoopWeightGrams || 70;

        // 1. Centralized Inventory Availability Validation (Prevents Stale Order / Depleted Tubs)
        const deductionCheck = InventoryRules.calculateMultiFlavorDeductions(
          items,
          freezerStore.slots,
          scoopWeight
        );

        if (!deductionCheck.isValid) {
          return {
            success: false,
            error: deductionCheck.errorMessage || "Validasi stok gagal untuk varian rasa yang dipilih.",
          };
        }

        // 2. Centralized Pricing & Tax Math
        const member = get().selectedMember;
        const pricing = PricingEngine.calculateOrderPricing(
          items,
          member?.tier,
          (taxPercentage || 10) / 100,
          loyaltyPointEarnRate || 10000
        );

        const method = get().paymentMethod;
        const tendered = get().cashTendered;

        if (method === "cash" && tendered < pricing.total) {
          return { success: false, error: "Uang tunai yang diterima kurang dari total tagihan." };
        }

        // 3. Atomically Deduct Grams Independently Per Flavor Tub
        deductionCheck.deductions.forEach((entry) => {
          freezerStore.decrementGramsBySlot(entry.slotId, entry.deductedGrams);
        });

        // 4. Update Member Total Spent, Points, and Tier Promotion (Silver -> Gold at >= 1M spend)
        if (member) {
          const newTotalSpent = member.totalSpent + pricing.total;
          const isPromotedToGold = member.tier === "Silver" && newTotalSpent >= 1000000;
          const nextTier = isPromotedToGold ? "Gold" : member.tier;

          set((state) => ({
            members: state.members.map((m) =>
              m.id === member.id
                ? {
                    ...m,
                    tier: nextTier,
                    loyaltyPoints: m.loyaltyPoints + pricing.pointsEarned,
                    totalSpent: newTotalSpent,
                  }
                : m
            ),
          }));

          if (isPromotedToGold) {
            useAuditStore.getState().logAction(
              "TRANSACTION_CREATED",
              effectiveCashier,
              "cashier",
              member.memberCode,
              `Member ${member.fullName} reached IDR ${newTotalSpent.toLocaleString()} lifetime spend and was PROMOTED to Gold Tier (10% Off)!`
            );
          }
        }

        // 5. Build Immutable Transaction Snapshot
        const receiptNumber = generateStandardId("RCP", get().transactions.length + 1);
        const newTrx = TransactionSnapshotBuilder.createSnapshot({
          receiptNumber,
          cashierUsername: effectiveCashier,
          shiftId: effectiveShiftId,
          items,
          pricing,
          paymentMethod: method,
          cashTendered: method === "cash" ? tendered : pricing.total,
          changeDue: method === "cash" ? (tendered >= pricing.total ? tendered - pricing.total : 0) : 0,
          member,
        });

        // 6. Commit Transaction to Store and Reset Cart
        set((state) => ({
          transactions: [newTrx, ...state.transactions],
          items: [],
          cashTendered: 0,
          selectedMember: null,
          pointsToRedeem: 0,
        }));

        // 7. Update Real-time Cashier Shift Balance
        useShiftStore.getState().recordSale(pricing.total, method === "cash");

        useAuditStore.getState().logAction(
          "TRANSACTION_CREATED",
          cashierUsername || "csh_sarah",
          "cashier",
          newTrx.receiptNumber,
          `Completed transaction ${newTrx.receiptNumber} (${method.toUpperCase()} - IDR ${pricing.total.toLocaleString()}). Multi-flavor stock deducted atomically.`
        );

        return { success: true, transaction: newTrx };
      },

      voidRefundTransaction: (transactionId, reason, approvedBy, type) => {
        const trx = get().transactions.find((t) => t.id === transactionId);
        if (!trx) return;

        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === transactionId
              ? {
                  ...t,
                  paymentStatus: type,
                  voidRefundReason: reason,
                  approvedBy: approvedBy,
                }
              : t
          ),
        }));

        useAuditStore.getState().logAction(
          type === "void" ? "TRANSACTION_VOIDED" : "TRANSACTION_REFUNDED",
          approvedBy,
          "manager",
          trx.receiptNumber,
          `${type.toUpperCase()} transaction ${trx.receiptNumber} (IDR ${trx.totalAmount.toLocaleString()}). Reason: ${reason}. Authorized by @${approvedBy}.`
        );
      },
    }),
    {
      name: "bloc-gelato-cart",
    }
  )
);
