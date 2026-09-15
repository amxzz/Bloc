"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useFreezerStore } from "@/store/useFreezerStore";
import { useProductionStore } from "@/store/useProductionStore";
import { useInventoryStore } from "@/store/useInventoryStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { GELATO_FLAVORS } from "@/lib/constants/gelatoData";
import { ShowcaseSlot, ProductionBatch, ProductionStage } from "@/types/kitchen";
import { TubStatusBadge } from "@/components/common/ui/StatusBadge";
import KpiCard from "@/components/common/ui/KpiCard";
import { formatRupiah } from "@/lib/utils/formatters";
import {
  LayoutDashboard,
  Grid3X3,
  Factory,
  Package,
  AlertTriangle,
  PlayCircle,
  Clock,
  ArrowRight,
  CheckCircle2,
  Thermometer,
  ShieldCheck,
  X,
} from "lucide-react";

export default function KitchenOverviewSection() {
  const { currentUser } = useAuthStore();
  const { slots, refillSlot } = useFreezerStore();
  const { batches, createBatch, advanceBatchStage } = useProductionStore();
  const { items, suppliers, createPurchaseOrder } = useInventoryStore();
  const { showToast } = useNotificationStore();

  // Quick Production Batch Modal State
  const [isQuickBatchModalOpen, setIsQuickBatchModalOpen] = useState(false);
  const [selectedSlotForBatch, setSelectedSlotForBatch] = useState<ShowcaseSlot | null>(null);
  const [selectedFlavorId, setSelectedFlavorId] = useState<string>(GELATO_FLAVORS[0]?.id || "");
  const [targetLiter, setTargetLiter] = useState<number>(10);

  // Quick Restock PO Modal State with Verification Gate
  const [isQuickPoModalOpen, setIsQuickPoModalOpen] = useState(false);
  const [verifiedItemIds, setVerifiedItemIds] = useState<Record<string, boolean>>({});

  // Sort critical slots by highest hygiene & operational priority
  const priorityMap: Record<string, number> = { EXPIRED: 1, EMPTY: 2, CRITICAL: 3, LOW: 4, FULL: 5, REFRESH_SOON: 6, NORMAL: 7 };
  const criticalSlots = slots
    .filter((s) => s.status === "CRITICAL" || s.status === "EMPTY" || s.status === "EXPIRED")
    .sort((a, b) => (priorityMap[a.status] ?? 99) - (priorityMap[b.status] ?? 99));

  const activeBatches = batches.filter((b) => b.stage !== "completed" && b.stage !== "cancelled");
  const lowStockItems = items.filter((i) => i.currentStock <= i.minRestockThreshold);

  // Handle open Quick Batch from Slot
  const handleOpenBatchForSlot = (slot: ShowcaseSlot) => {
    setSelectedSlotForBatch(slot);
    if (slot.flavorId) {
      setSelectedFlavorId(slot.flavorId);
    }
    setIsQuickBatchModalOpen(true);
  };

  const handleStartBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const staffName = currentUser?.username || "ktc_budi";
    const batch = createBatch(
      selectedFlavorId,
      targetLiter,
      staffName,
      selectedSlotForBatch ? `Auto-queue for Slot ${selectedSlotForBatch.id}` : undefined,
      selectedSlotForBatch ? selectedSlotForBatch.id : undefined
    );

    showToast(
      "Batch Started",
      `Batch ${batch.id} (${batch.flavorName}) entered Balancing stage (6.0% Fat Standard).`,
      "SUCCESS"
    );
    setIsQuickBatchModalOpen(false);
    setSelectedSlotForBatch(null);
  };

  // Handle direct slot refill from ready batch
  const handleDispenseToSlot = (batch: ProductionBatch) => {
    const slotId = batch.targetSlotId || "A01";
    const staffName = currentUser?.username || "ktc_budi";
    refillSlot(slotId, 3000, staffName);
    advanceBatchStage(batch.id, "completed", batch.actualOutputLiter, batch.varianceOverrunPercent, batch.totalTubsProduced, staffName);

    showToast(
      "Showcase Loaded",
      `Batch ${batch.id} (${batch.flavorName}) dispensed into Tub Slot ${slotId} (3,000g, 8-day freshness cycle).`,
      "SUCCESS"
    );
  };

  // Restock PO Verification Checkbox Helpers
  const isAllLowStockVerified = lowStockItems.length > 0 && lowStockItems.every((it) => verifiedItemIds[it.id]);

  const handleToggleVerifyItem = (id: string) => {
    setVerifiedItemIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleToggleVerifyAll = () => {
    if (isAllLowStockVerified) {
      setVerifiedItemIds({});
    } else {
      const all: Record<string, boolean> = {};
      lowStockItems.forEach((it) => { all[it.id] = true; });
      setVerifiedItemIds(all);
    }
  };

  const handleCreateVerifiedPO = () => {
    if (!isAllLowStockVerified) {
      showToast("Verification Incomplete", "Please verify all physical inventory items before submitting purchase order.", "WARNING");
      return;
    }

    const defaultSupplier = suppliers[0]?.name || "PT Kemasan Prima Nusantara";
    const poItems = lowStockItems.map((it) => {
      const qty = Math.max(10, it.minRestockThreshold * 2);
      return {
        itemId: it.id,
        itemCode: it.itemCode,
        itemName: it.itemName,
        quantity: qty,
        unitCost: it.costPerUnit,
        subtotal: qty * it.costPerUnit,
      };
    });

    const po = createPurchaseOrder(
      defaultSupplier,
      poItems,
      "Emergency restock PO generated from Kitchen Command Center.",
      currentUser?.username || "ktc_budi"
    );

    showToast(
      "Purchase Order Submitted",
      `PO ${po.id} for ${formatRupiah(po.totalCost)} submitted to Manager approval inbox.`,
      "SUCCESS"
    );
    setIsQuickPoModalOpen(false);
    setVerifiedItemIds({});
  };

  return (
    <div className="space-y-6 max-w-7xl select-none">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-[0_10px_30px_rgba(45,61,110,0.05)]">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2D3D6E]/10 text-[#2D3D6E] flex items-center justify-center font-bold">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#2D3D6E] tracking-tight">
                Kitchen Command Center
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-1">
                6-Stage gelato pipeline: Balancing (6% Fat), Pasteurizing, Aging, Churning, Blast Freezing, Tempering.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setSelectedSlotForBatch(null);
              setIsQuickBatchModalOpen(true);
            }}
            className="bg-[#2D3D6E] hover:bg-[#1C2646] text-white text-xs font-bold px-6 py-3 rounded-full flex items-center gap-2 shadow-lg shadow-[#2D3D6E]/20 transition-all cursor-pointer"
          >
            <PlayCircle className="w-4 h-4 text-[#F0E79D]" />
            <span>Start Production Batch</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <KpiCard
          title="Showcase Tubs Loaded"
          value={`${slots.filter((s) => s.currentGrams > 0).length} / ${slots.length}`}
          subtitle="Active freezer slots"
          variant="navy"
        />
        <KpiCard
          title="Tubs Needing Refill"
          value={criticalSlots.length}
          subtitle="Critical, empty, or expired"
          variant={criticalSlots.length > 0 ? "danger" : "default"}
        />
        <KpiCard
          title="Active Batches"
          value={activeBatches.length}
          subtitle="In 6-stage pipeline"
          variant="success"
        />
        <KpiCard
          title="Low Raw Materials"
          value={lowStockItems.length}
          subtitle="Below restock threshold"
          variant={lowStockItems.length > 0 ? "warning" : "default"}
        />
      </div>

      {/* Low Raw Materials Alert Banner with Verification PO Trigger */}
      {lowStockItems.length > 0 && (
        <div className="p-5 rounded-[28px] bg-amber-50 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-200 text-amber-950 flex items-center justify-center font-bold shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-950">
                Restock Alert: {lowStockItems.length} Raw Materials Below Restock Threshold
              </p>
              <p className="text-[11px] text-amber-900/80 mt-0.5">
                Items: {lowStockItems.map((it) => it.itemName).slice(0, 3).join(", ")}
                {lowStockItems.length > 3 ? ` and ${lowStockItems.length - 3} others` : ""}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsQuickPoModalOpen(true)}
            className="px-5 py-2.5 bg-[#2D3D6E] hover:bg-[#1C2646] text-white text-xs font-bold rounded-full text-center shadow-sm shrink-0 cursor-pointer"
          >
            Verify & Order Materials (PO)
          </button>
        </div>
      )}

      {/* 2-Column Operational Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ZONE 1: Urgent Showcase Tubs Demand */}
        <div className="bg-white p-6 sm:p-7 rounded-[32px] border border-slate-100 shadow-[0_10px_30px_rgba(45,61,110,0.05)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-base text-[#2D3D6E]">Urgent Showcase Demands</h3>
              <p className="text-xs text-slate-400 font-medium">Prioritized freezer tubs needing immediate refill</p>
            </div>
            <Link
              href="/kitchen/showcase"
              className="text-xs font-bold text-[#2D3D6E] hover:underline flex items-center gap-1"
            >
              <span>All {slots.length} Slots</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {criticalSlots.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                All 48 showcase slots are fully loaded and in fresh condition.
              </div>
            ) : (
              criticalSlots.map((slot) => {
                const isRed = slot.status === "EMPTY" || slot.status === "EXPIRED";
                const isYellow = slot.status === "CRITICAL" || slot.status === "LOW";

                return (
                  <div
                    key={slot.id}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isRed
                        ? "bg-rose-50/70 border-rose-200"
                        : isYellow
                        ? "bg-amber-50/70 border-amber-200"
                        : "bg-white border-slate-100"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-xs text-[#2D3D6E]">
                          Slot {slot.id}
                        </span>
                        <h4 className="font-bold text-xs text-[#2D3D6E] truncate">
                          {slot.flavorName || "Empty Tub"}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {slot.currentGrams.toLocaleString("en-US")}g / {slot.maxCapacityGram.toLocaleString("en-US")}g • Open: {slot.daysOpen}/{slot.maxDaysAllowed || 8} Days
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <TubStatusBadge status={slot.status} size="sm" />
                      <button
                        type="button"
                        onClick={() => handleOpenBatchForSlot(slot)}
                        className="px-4 py-2 rounded-full bg-[#2D3D6E] hover:bg-[#1C2646] text-white text-[11px] font-bold shadow-sm flex items-center gap-1.5 cursor-pointer"
                      >
                        <PlayCircle className="w-3.5 h-3.5 text-[#F0E79D]" />
                        <span>Start Batch</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ZONE 2: Live 6-Stage Production Pipeline */}
        <div className="bg-white p-6 sm:p-7 rounded-[32px] border border-slate-100 shadow-[0_10px_30px_rgba(45,61,110,0.05)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-base text-[#2D3D6E]">Live Production Pipeline</h3>
              <p className="text-xs text-slate-400 font-medium">Standardized 6-stage gelato batch cycle</p>
            </div>
            <Link
              href="/kitchen/production"
              className="text-xs font-bold text-[#2D3D6E] hover:underline flex items-center gap-1"
            >
              <span>Production Board</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {activeBatches.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                No production batches are currently active.
              </div>
            ) : (
              activeBatches.map((batch) => {
                const isBlastDone = batch.stage === "blast_freezer" || batch.stage === "tempering_ready";

                return (
                  <div
                    key={batch.id}
                    className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70 space-y-3 shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-extrabold text-xs text-[#2D3D6E]">
                            {batch.id}
                          </span>
                          <h4 className="font-bold text-xs text-[#2D3D6E]">{batch.flavorName}</h4>
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                          Target: {batch.targetOutputLiter}L ({batch.totalTubsProduced} Tubs) • Standard Fat: 6.0% • Slot: {batch.targetSlotId || "-"}
                        </p>
                      </div>

                      <span className="font-mono font-bold text-[10px] uppercase px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                        {batch.stage.replace("_", " ")}
                      </span>
                    </div>

                    {/* Stage Temperature & Duration Indicator */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-white p-2.5 rounded-xl border border-slate-200/80">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Thermometer className="w-3.5 h-3.5 text-rose-500" />
                        <span>Temp: {batch.temperatureCelsius ?? -7}°C</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Time: {batch.stageDurationMinutes ?? 15} mins</span>
                      </div>
                    </div>

                    {/* Action Row */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      {isBlastDone ? (
                        <button
                          type="button"
                          onClick={() => handleDispenseToSlot(batch)}
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-full shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4 text-[#F0E79D]" />
                          <span>Dispense to Tub Slot {batch.targetSlotId || "A01"} in Showcase</span>
                        </button>
                      ) : (
                        <div className="flex items-center justify-between w-full">
                          <span className="text-[11px] text-slate-400 font-mono">
                            By: @{batch.producedBy}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const nextMap: Record<ProductionStage, ProductionStage> = {
                                balancing: "pasteurizing",
                                pasteurizing: "aging",
                                aging: "churning",
                                churning: "blast_freezer",
                                blast_freezer: "tempering_ready",
                                tempering_ready: "completed",
                                completed: "completed",
                                cancelled: "cancelled",
                              };
                              advanceBatchStage(batch.id, nextMap[batch.stage] || "completed");
                            }}
                            className="px-4 py-1.5 bg-[#2D3D6E] hover:bg-[#1C2646] text-white text-xs font-bold rounded-full shadow-sm flex items-center gap-1 cursor-pointer"
                          >
                            <span>Next Stage</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* QUICK BATCH PRODUCTION MODAL (AUTO-FILLED) */}
      {isQuickBatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in select-none">
          <div className="w-full max-w-md bg-white rounded-[32px] p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-base text-[#2D3D6E]">Start Gelato Production Batch</h3>
                <p className="text-xs text-slate-500">Standardized Italian gelato recipe formulation</p>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickBatchModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleStartBatchSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2D3D6E] block px-1">
                  Select Gelato Flavor
                </label>
                <select
                  value={selectedFlavorId}
                  onChange={(e) => setSelectedFlavorId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-full border border-slate-200 text-xs font-semibold text-[#2D3D6E] focus:outline-hidden focus:border-[#2D3D6E]"
                  required
                >
                  {GELATO_FLAVORS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.series} - 6.0% Fat Standard)
                    </option>
                  ))}
                </select>
              </div>

              {selectedSlotForBatch && (
                <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800">
                    Target Showcase Destination
                  </span>
                  <p className="text-xs font-bold text-indigo-950">
                    Slot {selectedSlotForBatch.id} ({selectedSlotForBatch.flavorName || "Empty Slot"})
                  </p>
                </div>
              )}

              {/* Standard Parameters Info Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between font-mono">
                  <span className="text-slate-500">Fat Balance:</span>
                  <span className="font-bold text-[#2D3D6E]">6.0% Standard (Balancing)</span>
                </div>
                <div className="flex items-center justify-between font-mono">
                  <span className="text-slate-500">Pasteurization:</span>
                  <span className="font-bold text-[#2D3D6E]">85°C (30 mins)</span>
                </div>
                <div className="flex items-center justify-between font-mono">
                  <span className="text-slate-500">Aging & Churn:</span>
                  <span className="font-bold text-[#2D3D6E]">4°C (4h) &rarr; -7°C (15m, 30% Overrun)</span>
                </div>
                <div className="flex items-center justify-between font-mono">
                  <span className="text-slate-500">Blast Freezing:</span>
                  <span className="font-bold text-[#2D3D6E]">-35°C (45 mins)</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2D3D6E] block px-1">
                  Target Output Volume (Liters)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[5, 10, 15].map((vol) => (
                    <button
                      key={vol}
                      type="button"
                      onClick={() => setTargetLiter(vol)}
                      className={`py-2.5 rounded-full text-xs font-mono font-bold border transition-all ${
                        targetLiter === vol
                          ? "bg-[#2D3D6E] text-white border-[#2D3D6E]"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {vol}L ({Math.round(vol / 2.5)} Tubs)
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#2D3D6E] hover:bg-[#1C2646] text-white text-xs font-bold rounded-full shadow-lg shadow-[#2D3D6E]/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Confirm & Begin Balancing Stage</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK RESTOCK PO MODAL WITH VERIFICATION GATE */}
      {isQuickPoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in select-none">
          <div className="w-full max-w-lg bg-white rounded-[32px] p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-base text-[#2D3D6E]">Material Verification & Restock PO</h3>
                <p className="text-xs text-slate-500 font-normal">Verify physical inventory in storage before dispatching purchase order</p>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickPoModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Checklist items */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-[#2D3D6E]">Critical Materials List ({lowStockItems.length})</span>
                <button
                  type="button"
                  onClick={handleToggleVerifyAll}
                  className="text-xs font-bold text-[#2D3D6E] hover:underline"
                >
                  {isAllLowStockVerified ? "Deselect All" : "Select All"}
                </button>
              </div>

              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {lowStockItems.map((item) => {
                  const isChecked = !!verifiedItemIds[item.id];
                  const suggestedQty = Math.max(10, item.minRestockThreshold * 2);

                  return (
                    <label
                      key={item.id}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                        isChecked
                          ? "bg-indigo-50/60 border-[#2D3D6E]/40"
                          : "bg-slate-50 border-slate-200 hover:bg-slate-100/70"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleVerifyItem(item.id)}
                          className="w-4 h-4 rounded text-[#2D3D6E] focus:ring-[#2D3D6E]"
                        />
                        <div>
                          <p className="text-xs font-bold text-[#2D3D6E]">{item.itemName}</p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            Stock: {item.currentStock} {item.unit} • Min: {item.minRestockThreshold} {item.unit}
                          </p>
                        </div>
                      </div>

                      <div className="text-right font-mono text-xs">
                        <span className="font-bold text-[#2D3D6E]">+{suggestedQty} {item.unit}</span>
                        <span className="text-[10px] text-slate-400 block">{formatRupiah(suggestedQty * item.costPerUnit)}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                disabled={!isAllLowStockVerified}
                onClick={handleCreateVerifiedPO}
                className={`w-full py-3.5 rounded-full text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all ${
                  isAllLowStockVerified
                    ? "bg-[#2D3D6E] hover:bg-[#1C2646] text-white cursor-pointer"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-[#F0E79D]" />
                <span>
                  {isAllLowStockVerified
                    ? "Submit Purchase Order to Manager"
                    : "Check All Items to Enable Submission"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
