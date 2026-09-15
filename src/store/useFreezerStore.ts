import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ShowcaseSlot, TubStatus, FreezerGroup, WasteLogEntry, WasteReason } from "@/types/kitchen";
import { INITIAL_FREEZER_SLOTS } from "@/lib/constants/initialFreezerSlots";
import { GELATO_FLAVORS } from "@/lib/constants/gelatoData";
import { useAuditStore } from "./useAuditStore";

interface FreezerState {
  slots: ShowcaseSlot[];
  selectedSlotId: string | null;
  wasteLogs: WasteLogEntry[];

  setSelectedSlot: (slotId: string | null) => void;
  getSlotById: (slotId: string) => ShowcaseSlot | undefined;
  getSlotsByGroup: (group: FreezerGroup) => ShowcaseSlot[];

  // Tub operations
  refillSlot: (slotId: string, gramsToAdd: number, staffName?: string) => void;
  replaceTubInSlot: (slotId: string, flavorId: string, batchId?: string, staffName?: string) => void;
  disposeTubInSlot: (slotId: string, reason: WasteReason, managerName: string, notes?: string, staffName?: string) => void;
  decrementGramsBySlot: (slotId: string, gramsUsed: number) => void;
  decrementGramsByFlavor: (flavorId: string, gramsUsed: number) => void;
}

export function recalculateTubStatus(currentGrams: number, maxCapacity: number, daysOpen: number): TubStatus {
  if (currentGrams <= 0) return "EMPTY";
  if (daysOpen >= 8) return "EXPIRED"; // 8 days strict shelf life
  const percentage = (currentGrams / maxCapacity) * 100;
  if (percentage < 20) return "CRITICAL";
  if (percentage <= 50) return "LOW";
  return "NORMAL";
}

export const useFreezerStore = create<FreezerState>()(
  persist(
    (set, get) => ({
      slots: INITIAL_FREEZER_SLOTS,
      selectedSlotId: "A01",
      wasteLogs: [
        {
          id: "wst-01",
          tubBatchId: "BCH-20260905-A02",
          slotId: "A02",
          flavorName: "Choco Mint Flakes",
          estimatedWeightGram: 350,
          reason: "Expired",
          reportedBy: "ktc_budi",
          approvedByManager: "mgr_doni",
          status: "approved",
          notes: "Masa simpan showcase telah melewati batas 8 hari.",
          createdAt: "2026-09-07 08:30",
        },
      ],

      setSelectedSlot: (slotId) => {
        set({ selectedSlotId: slotId });
      },

      getSlotById: (slotId) => {
        return get().slots.find((s) => s.id === slotId);
      },

      getSlotsByGroup: (group) => {
        return get().slots.filter((s) => s.freezerGroup === group);
      },

      refillSlot: (slotId, gramsToAdd, staffName = "ktc_budi") => {
        let flavorLabel = "Gelato";
        set((state) => ({
          slots: state.slots.map((slot) => {
            if (slot.id === slotId) {
              const updatedGrams = Math.min(slot.currentGrams + gramsToAdd, slot.maxCapacityGram);
              flavorLabel = slot.flavorName || flavorLabel;
              return {
                ...slot,
                currentGrams: updatedGrams,
                status: recalculateTubStatus(updatedGrams, slot.maxCapacityGram, slot.daysOpen),
              };
            }
            return slot;
          }),
        }));

        useAuditStore.getState().logAction(
          "SHOWCASE_REFILL",
          staffName,
          "kitchen",
          `Slot ${slotId} (${flavorLabel})`,
          `Refilled ${gramsToAdd}g into slot ${slotId}.`
        );
      },

      replaceTubInSlot: (slotId, flavorId, batchId, staffName = "ktc_budi") => {
        const flavor = GELATO_FLAVORS.find((f) => f.id === flavorId);
        if (!flavor) return;

        const genBatch = batchId || `BCH-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${slotId}`;

        set((state) => ({
          slots: state.slots.map((slot) => {
            if (slot.id === slotId) {
              const maxCap = flavor.maxCapacityGram;
              return {
                ...slot,
                flavorId: flavor.id,
                flavorName: flavor.name,
                series: flavor.series,
                baseType: flavor.baseType,
                maxCapacityGram: maxCap,
                currentGrams: maxCap,
                daysOpen: 1,
                maxDaysAllowed: 8,
                batchId: genBatch,
                producedDate: new Date().toISOString().split("T")[0],
                openedDate: new Date().toISOString().split("T")[0],
                status: "NORMAL",
              };
            }
            return slot;
          }),
        }));

        useAuditStore.getState().logAction(
          "SHOWCASE_REPLACE",
          staffName,
          "kitchen",
          `Slot ${slotId}`,
          `Assigned new tub: ${flavor.name} (Batch: ${genBatch}, Capacity: ${flavor.maxCapacityGram}g).`
        );
      },

      disposeTubInSlot: (slotId, reason, managerName, notes, staffName = "ktc_budi") => {
        const slot = get().getSlotById(slotId);
        if (!slot || slot.currentGrams <= 0) return;

        const newWasteEntry: WasteLogEntry = {
          id: `wst-${Date.now()}`,
          tubBatchId: slot.batchId || `BCH-${slot.id}`,
          slotId: slot.id,
          flavorName: slot.flavorName || "Unknown Flavor",
          estimatedWeightGram: slot.currentGrams,
          reason,
          reportedBy: staffName,
          approvedByManager: managerName,
          status: "approved",
          notes: notes || "Tub disposed from showcase display.",
          createdAt: new Date().toLocaleString("id-ID"),
        };

        set((state) => ({
          wasteLogs: [newWasteEntry, ...state.wasteLogs],
          slots: state.slots.map((s) => {
            if (s.id === slotId) {
              return {
                ...s,
                currentGrams: 0,
                daysOpen: 0,
                status: "EMPTY",
                flavorId: undefined,
                flavorName: undefined,
                batchId: undefined,
              };
            }
            return s;
          }),
        }));

        useAuditStore.getState().logAction(
          "SHOWCASE_DISPOSE",
          staffName,
          "kitchen",
          `Slot ${slotId} (${slot.flavorName})`,
          `Disposed ${slot.currentGrams}g of ${slot.flavorName}. Reason: ${reason}. Approved by Manager: @${managerName}.`
        );
      },

      decrementGramsBySlot: (slotId, gramsUsed) => {
        set((state) => ({
          slots: state.slots.map((slot) => {
            if (slot.id === slotId && slot.currentGrams > 0) {
              const newGrams = Math.max(slot.currentGrams - gramsUsed, 0);
              return {
                ...slot,
                currentGrams: newGrams,
                status: recalculateTubStatus(newGrams, slot.maxCapacityGram, slot.daysOpen),
              };
            }
            return slot;
          }),
        }));
      },

      decrementGramsByFlavor: (flavorId, gramsUsed) => {
        set((state) => ({
          slots: state.slots.map((slot) => {
            if (slot.flavorId === flavorId && slot.currentGrams > 0) {
              const newGrams = Math.max(slot.currentGrams - gramsUsed, 0);
              return {
                ...slot,
                currentGrams: newGrams,
                status: recalculateTubStatus(newGrams, slot.maxCapacityGram, slot.daysOpen),
              };
            }
            return slot;
          }),
        }));
      },
    }),
    {
      name: "bloc-gelato-freezer",
    }
  )
);
