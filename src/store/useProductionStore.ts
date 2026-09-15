import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ProductionBatch, ProductionStage } from "@/types/kitchen";
import { GELATO_FLAVORS } from "@/lib/constants/gelatoData";
import { useAuditStore } from "./useAuditStore";

interface ProductionState {
  batches: ProductionBatch[];
  createBatch: (flavorId: string, targetLiter: number, producedBy: string, notes?: string, targetSlotId?: string) => ProductionBatch;
  advanceBatchStage: (batchId: string, nextStage: ProductionStage, actualLiter?: number, variancePercent?: number, tubsProduced?: number, staffName?: string) => void;
  cancelBatch: (batchId: string, reason: string, staffName: string) => void;
}

export const useProductionStore = create<ProductionState>()(
  persist(
    (set, get) => ({
      batches: [
        {
          id: "BATCH-260907-001",
          flavorId: "flv-milk-04",
          flavorName: "Korean Strawberry Milk",
          series: "Milk",
          baseType: "milk",
          targetOutputLiter: 10,
          actualOutputLiter: 10.2,
          varianceOverrunPercent: 30,
          totalTubsProduced: 4,
          stage: "churning",
          targetSlotId: "A04",
          fatContentPercent: 6,
          temperatureCelsius: -7,
          stageDurationMinutes: 15,
          producedBy: "ktc_budi",
          expiryDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          createdAt: "2026-09-07 08:45",
          notes: "Target Refill Slot A04.",
        },
        {
          id: "BATCH-260907-002",
          flavorId: "flv-choco-01",
          flavorName: "Dark Chocolate",
          series: "Chocolate",
          baseType: "milk",
          targetOutputLiter: 15,
          actualOutputLiter: 14.8,
          varianceOverrunPercent: 30,
          totalTubsProduced: 5,
          stage: "blast_freezer",
          targetSlotId: "B02",
          fatContentPercent: 6,
          temperatureCelsius: -35,
          stageDurationMinutes: 45,
          producedBy: "ktc_budi",
          expiryDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          createdAt: "2026-09-07 07:30",
          notes: "Target Refill Slot B02. Selesai blast freeze pukul 11:30.",
        },
      ],

      createBatch: (flavorId, targetLiter, producedBy = "ktc_budi", notes, targetSlotId) => {
        const flavor = GELATO_FLAVORS.find((f) => f.id === flavorId);
        const flavorName = flavor ? flavor.name : "Gelato Batch";
        const series = flavor ? flavor.series : "Milk";
        const baseType = flavor ? flavor.baseType : "milk";

        const newBatch: ProductionBatch = {
          id: `BATCH-${Date.now().toString().slice(-6)}`,
          flavorId,
          flavorName,
          series,
          baseType,
          targetOutputLiter: targetLiter,
          actualOutputLiter: targetLiter,
          varianceOverrunPercent: 30, // Standard 30% overrun
          totalTubsProduced: Math.max(1, Math.round(targetLiter / 2.5)),
          stage: "balancing",
          targetSlotId,
          fatContentPercent: 6, // Standard 6% fat
          temperatureCelsius: 85,
          stageDurationMinutes: 30,
          producedBy,
          expiryDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          createdAt: new Date().toLocaleString("id-ID"),
          notes: notes || (targetSlotId ? `Target slot etalase: ${targetSlotId}` : undefined),
        };

        set((state) => ({ batches: [newBatch, ...state.batches] }));

        useAuditStore.getState().logAction(
          "BATCH_STAGE_ADVANCED",
          producedBy,
          "kitchen",
          newBatch.id,
          `Started batch ${newBatch.id} for ${flavorName} (Target: ${targetLiter}L, Stage: Balancing (6% Fat), Slot: ${targetSlotId || "Unassigned"}).`
        );

        return newBatch;
      },

      advanceBatchStage: (batchId, nextStage, actualLiter, variancePercent, tubsProduced, staffName = "ktc_budi") => {
        const batch = get().batches.find((b) => b.id === batchId);
        if (!batch) return;

        let temp = 85;
        let dur = 30;
        if (nextStage === "pasteurizing") { temp = 85; dur = 30; }
        else if (nextStage === "aging") { temp = 4; dur = 240; }
        else if (nextStage === "churning") { temp = -7; dur = 15; }
        else if (nextStage === "blast_freezer") { temp = -35; dur = 45; }
        else if (nextStage === "tempering_ready") { temp = -12; dur = 0; }

        set((state) => ({
          batches: state.batches.map((b) =>
            b.id === batchId
              ? {
                  ...b,
                  stage: nextStage,
                  temperatureCelsius: temp,
                  stageDurationMinutes: dur,
                  actualOutputLiter: actualLiter !== undefined ? actualLiter : b.actualOutputLiter,
                  varianceOverrunPercent: variancePercent !== undefined ? variancePercent : b.varianceOverrunPercent,
                  totalTubsProduced: tubsProduced !== undefined ? tubsProduced : b.totalTubsProduced,
                }
              : b
          ),
        }));

        const isCompleted = nextStage === "completed";
        useAuditStore.getState().logAction(
          isCompleted ? "BATCH_COMPLETED" : "BATCH_STAGE_ADVANCED",
          staffName,
          "kitchen",
          batchId,
          `Advanced batch ${batchId} (${batch.flavorName}) to stage "${nextStage.toUpperCase()}" (${temp}°C, target slot: ${batch.targetSlotId || "-"}).`
        );
      },

      cancelBatch: (batchId, reason, staffName) => {
        set((state) => ({
          batches: state.batches.map((b) =>
            b.id === batchId ? { ...b, stage: "cancelled", notes: `${b.notes || ""} [Cancelled: ${reason}]` } : b
          ),
        }));

        useAuditStore.getState().logAction(
          "BATCH_CANCELLED",
          staffName,
          "kitchen",
          batchId,
          `Cancelled batch ${batchId}. Reason: ${reason}`
        );
      },
    }),
    {
      name: "bloc-gelato-production",
    }
  )
);
