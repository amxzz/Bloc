import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuditLogEntry, AuditActionType } from "@/types/audit";
import { UserRole } from "@/types/auth";

interface AuditState {
  logs: AuditLogEntry[];
  logAction: (
    actionType: AuditActionType,
    performedBy: string,
    role: UserRole,
    targetEntity: string,
    details: string,
    metadata?: Record<string, unknown>
  ) => void;
  clearLogs: () => void;
}

export const useAuditStore = create<AuditState>()(
  persist(
    (set) => ({
      logs: [
        {
          id: "log-init-01",
          actionType: "SHIFT_OPENED",
          performedBy: "csh_sarah",
          role: "cashier",
          targetEntity: "Shift #1 (Morning)",
          details: "Cashier Sarah opened shift with initial cash float IDR 500,000.",
          timestamp: "2026-09-07 08:00",
        },
        {
          id: "log-init-02",
          actionType: "SHOWCASE_REFILL",
          performedBy: "ktc_budi",
          role: "kitchen",
          targetEntity: "Slot A01 (Cookies & Cream)",
          details: "Refilled tub slot A01 with 1,200 grams from fresh batch.",
          timestamp: "2026-09-07 09:30",
        },
        {
          id: "log-init-03",
          actionType: "PO_CREATED",
          performedBy: "ktc_budi",
          role: "kitchen",
          targetEntity: "PO-260907-0001",
          details: "Created draft purchase order for PT Dairy Supply (IDR 6,200,000).",
          timestamp: "2026-09-07 10:15",
        },
      ],

      logAction: (actionType, performedBy, role, targetEntity, details, metadata) => {
        const newLog: AuditLogEntry = {
          id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          actionType,
          performedBy: performedBy || "system",
          role: role || "cashier",
          targetEntity,
          details,
          metadata,
          timestamp: new Date().toLocaleString("id-ID", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        set((state) => ({ logs: [newLog, ...state.logs] }));
      },

      clearLogs: () => {
        set({ logs: [] });
      },
    }),
    {
      name: "bloc-gelato-audit-logs",
    }
  )
);
