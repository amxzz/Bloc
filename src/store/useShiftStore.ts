import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CashierShift, ShiftNumber } from "@/types/cashier";
import { useAuditStore } from "./useAuditStore";

interface ShiftState {
  activeShift: CashierShift | null;
  shiftHistory: CashierShift[];

  openShift: (shiftNumber: ShiftNumber, cashierUsername: string, cashierName: string, initialCashFloat: number) => CashierShift;
  recordSale: (amount: number, isCash: boolean) => void;
  closeShift: (actualCashCount: number, notes?: string) => { shift: CashierShift; discrepancy: number };
}

export const useShiftStore = create<ShiftState>()(
  persist(
    (set, get) => ({
      activeShift: null,
      shiftHistory: [],

      openShift: (shiftNumber, cashierUsername, cashierName, initialCashFloat) => {
        const newShift: CashierShift = {
          id: `shift-${Date.now()}`,
          shiftNumber,
          shiftName: shiftNumber === 1 ? "Shift 1 (Morning)" : "Shift 2 (Evening)",
          shiftDate: new Date().toISOString().split("T")[0],
          cashierUsername,
          cashierName,
          startTime: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
          initialCashFloat,
          totalSalesCash: 0,
          totalSalesDigital: 0,
          totalTransactions: 0,
          status: "open",
        };

        set({ activeShift: newShift });

        useAuditStore.getState().logAction(
          "SHIFT_OPENED",
          cashierUsername,
          "cashier",
          newShift.shiftName || `Shift #${shiftNumber}`,
          `Opened shift #${shiftNumber} with opening cash float IDR ${initialCashFloat.toLocaleString()}.`
        );

        return newShift;
      },

      recordSale: (amount, isCash) => {
        const current = get().activeShift;
        if (!current || current.status !== "open") return;

        set({
          activeShift: {
            ...current,
            totalSalesCash: isCash ? current.totalSalesCash + amount : current.totalSalesCash,
            totalSalesDigital: !isCash ? current.totalSalesDigital + amount : current.totalSalesDigital,
            totalTransactions: (current.totalTransactions || 0) + 1,
          },
        });
      },

      closeShift: (actualCashCount, notes) => {
        const current = get().activeShift;
        if (!current) {
          throw new Error("No active shift found to close.");
        }

        const expectedCash = current.initialCashFloat + current.totalSalesCash;
        const discrepancy = actualCashCount - expectedCash;

        const closedShift: CashierShift = {
          ...current,
          endTime: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
          expectedClosingCash: expectedCash,
          actualClosingCash: actualCashCount,
          discrepancyAmount: discrepancy,
          status: "closed",
          notes: notes || (discrepancy !== 0 ? `Variance of IDR ${discrepancy}` : "Shift closed balanced."),
        };

        set((state) => ({
          activeShift: null,
          shiftHistory: [closedShift, ...state.shiftHistory],
        }));

        useAuditStore.getState().logAction(
          "SHIFT_CLOSED",
          current.cashierUsername,
          "cashier",
          current.shiftName || `Shift #${current.shiftNumber}`,
          `Closed shift. Expected: IDR ${expectedCash.toLocaleString()}, Actual: IDR ${actualCashCount.toLocaleString()}, Discrepancy: IDR ${discrepancy.toLocaleString()}.`
        );

        return { shift: closedShift, discrepancy };
      },
    }),
    {
      name: "bloc-gelato-shift",
    }
  )
);
