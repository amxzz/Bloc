import { create } from "zustand";
import { persist } from "zustand/middleware";
import { HoldOrder, CartItem, Member } from "@/types/cashier";
import { useAuditStore } from "./useAuditStore";

interface HoldState {
  holdOrders: HoldOrder[];
  maxHoldLimit: number; // strictly 3
  addHoldOrder: (items: CartItem[], customerName?: string, cashierUsername?: string, member?: Member | null) => { success: boolean; message: string; order?: HoldOrder };
  removeHoldOrder: (id: string, cashierUsername?: string) => void;
  clearAllHolds: () => void;
}

export const useHoldStore = create<HoldState>()(
  persist(
    (set, get) => ({
      holdOrders: [],
      maxHoldLimit: 3,

      addHoldOrder: (items: CartItem[], customerName = "Pelanggan", cashierUsername = "csh_sarah", member: Member | null = null) => {
        const currentHolds = get().holdOrders;
        if (currentHolds.length >= get().maxHoldLimit) {
          return {
            success: false,
            message: "Batas antrean pesanan tertahan (Hold Order) maksimal 3 pesanan telah tercapai. Selesaikan atau batalkan pesanan lama terlebih dahulu.",
          };
        }

        if (items.length === 0) {
          return {
            success: false,
            message: "Keranjang belanja masih kosong. Tambahkan item sebelum menahan pesanan.",
          };
        }

        const total = items.reduce((sum, item) => sum + item.totalPrice, 0);
        const newHold: HoldOrder = {
          id: `hold-${Date.now()}`,
          orderNumber: `HOLD-#${(currentHolds.length + 1).toString().padStart(2, "0")}`,
          customerName: customerName || `Order #${currentHolds.length + 1}`,
          items: [...items],
          totalAmount: total,
          member: member || null,
          createdAt: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        };

        set({ holdOrders: [newHold, ...currentHolds] });

        useAuditStore.getState().logAction(
          "HOLD_ORDER_CREATED",
          cashierUsername,
          "cashier",
          newHold.orderNumber,
          `Held order for "${newHold.customerName}" with ${items.length} items (Total: IDR ${total.toLocaleString()}).`
        );

        return {
          success: true,
          message: `Pesanan ${newHold.customerName} berhasil disimpan ke antrean Hold Order (${get().holdOrders.length}/3).`,
          order: newHold,
        };
      },

      removeHoldOrder: (id: string, cashierUsername = "csh_sarah") => {
        const target = get().holdOrders.find((o) => o.id === id);
        if (target) {
          useAuditStore.getState().logAction(
            "HOLD_ORDER_RESUMED",
            cashierUsername,
            "cashier",
            target.orderNumber,
            `Resumed/removed hold order "${target.customerName}".`
          );
        }

        set((state) => ({
          holdOrders: state.holdOrders.filter((order) => order.id !== id),
        }));
      },

      clearAllHolds: () => {
        set({ holdOrders: [] });
      },
    }),
    {
      name: "bloc-gelato-hold-orders",
    }
  )
);
