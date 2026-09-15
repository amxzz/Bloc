"use client";

import React, { useState } from "react";
import { useFreezerStore } from "@/store/useFreezerStore";
import { useAuthStore } from "@/store/useAuthStore";
import { FreezerGroup, ShowcaseSlot, WasteReason } from "@/types/kitchen";
import { GELATO_FLAVORS } from "@/lib/constants/gelatoData";
import { TubStatusBadge } from "@/components/common/ui/StatusBadge";
import PinModal from "@/components/common/ui/PinModal";
import {
  Grid3X3,
  Plus,
  RefreshCw,
  Trash2,
  X,
  Thermometer,
} from "lucide-react";

export default function ShowcaseSection() {
  const { currentUser } = useAuthStore();
  const { slots, refillSlot, replaceTubInSlot, disposeTubInSlot } = useFreezerStore();
  const [selectedGroup, setSelectedGroup] = useState<FreezerGroup>("A");
  const [activeSlot, setActiveSlot] = useState<ShowcaseSlot | null>(null);

  // Modals
  const [isRefillOpen, setIsRefillOpen] = useState(false);
  const [isReplaceOpen, setIsReplaceOpen] = useState(false);
  const [isDisposePinOpen, setIsDisposePinOpen] = useState(false);
  const [refillGrams, setRefillGrams] = useState<number>(1000);
  const [newFlavorId, setNewFlavorId] = useState<string>("");
  const [wasteReason, setWasteReason] = useState<WasteReason>("Expired");
  const [wasteNotes, setWasteNotes] = useState("");

  const currentGroupSlots = slots.filter((s) => s.freezerGroup === selectedGroup);

  const groupTemperatures: Record<FreezerGroup, string> = {
    A: "-15.2°C",
    B: "-15.0°C",
    C: "-14.8°C",
  };

  const handleRefillSubmit = () => {
    if (!activeSlot) return;
    refillSlot(activeSlot.id, refillGrams, currentUser?.username);
    setIsRefillOpen(false);
    setActiveSlot(null);
  };

  const handleReplaceSubmit = () => {
    if (!activeSlot || !newFlavorId) return;
    replaceTubInSlot(activeSlot.id, newFlavorId, undefined, currentUser?.username);
    setIsReplaceOpen(false);
    setActiveSlot(null);
    setNewFlavorId("");
  };

  const handleDisposePinSuccess = (managerName: string) => {
    if (!activeSlot) return;
    disposeTubInSlot(activeSlot.id, wasteReason, managerName, wasteNotes, currentUser?.username);
    setIsDisposePinOpen(false);
    setActiveSlot(null);
    setWasteNotes("");
  };

  return (
    <div className="space-y-6 max-w-7xl select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-[0_10px_30px_rgba(45,61,110,0.05)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#2D3D6E] tracking-tight">Showcase Freezer Monitoring</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Real-time display tub inventory, automated temperature tracking, and strict 8-day shelf life compliance.
          </p>
        </div>

        {/* Freezer Pod Switcher */}
        <div className="flex items-center gap-1.5 bg-[#F6F8FC] p-1.5 rounded-full border border-slate-100">
          {(["A", "B", "C"] as FreezerGroup[]).map((group) => {
            const count = slots.filter((s) => s.freezerGroup === group && s.status !== "EMPTY").length;
            const isSelected = selectedGroup === group;
            return (
              <button
                key={group}
                type="button"
                onClick={() => setSelectedGroup(group)}
                className={`px-4 py-2 rounded-full text-xs font-bold font-mono transition-all flex items-center gap-2 ${
                  isSelected
                    ? "bg-[#2D3D6E] text-white shadow-md shadow-[#2D3D6E]/20"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                <span>Pod {group}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                  isSelected ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                }`}>
                  {groupTemperatures[group]}
                </span>
                <span className="text-[10px] opacity-75">({count}/18)</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pod Status Banner */}
      <div className="bg-[#F6F8FC] p-4 sm:p-5 rounded-[24px] border border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
          <span className="font-bold text-[#2D3D6E]">
            Freezer Pod {selectedGroup} Operating Status:
          </span>
          <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
            <Thermometer className="w-3 h-3 text-emerald-600" /> Optimal ({groupTemperatures[selectedGroup]})
          </span>
          <span className="text-slate-500 font-mono font-medium">
            Active Tubs: {slots.filter((s) => s.freezerGroup === selectedGroup && s.status !== "EMPTY").length} / 18
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> &gt;50% Normal</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> 20-50% Low</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> &lt;20% Critical</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span> Expired</span>
        </div>
      </div>

      {/* 3x6 Physical Grid Matrix of Slots */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {currentGroupSlots.map((slot) => {
          const fillPercentage = Math.round((slot.currentGrams / slot.maxCapacityGram) * 100);
          const flavorMeta = GELATO_FLAVORS.find((f) => f.id === slot.flavorId);

          return (
            <div
              key={slot.id}
              className={`p-4 rounded-[24px] border bg-white space-y-3 transition-all flex flex-col justify-between shadow-[0_10px_30px_rgba(45,61,110,0.03)] ${
                slot.status === "EMPTY"
                  ? "border-dashed border-slate-300 bg-slate-50/50"
                  : slot.status === "CRITICAL"
                  ? "border-rose-300 ring-2 ring-rose-100"
                  : slot.status === "EXPIRED"
                  ? "border-purple-300 ring-2 ring-purple-100"
                  : "border-slate-100 hover:border-[#2D3D6E]/20"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded-full bg-[#2D3D6E]/10 text-[#2D3D6E]">
                    Slot {slot.id}
                  </span>
                  <TubStatusBadge status={slot.status} size="sm" />
                </div>

                <h3 className="font-bold text-xs text-[#2D3D6E] truncate leading-tight">
                  {slot.flavorName || "Empty / Unassigned"}
                </h3>
                <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                  {slot.series || "No flavor loaded"}
                </p>

                {/* Allergen Badges */}
                {flavorMeta?.allergens && flavorMeta.allergens.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {flavorMeta.allergens.slice(0, 2).map((alg) => (
                      <span
                        key={alg}
                        className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#F0E79D] text-[#2D3D6E] font-bold shadow-2xs"
                      >
                        {alg}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-2.5 border-t border-slate-100">
                {/* Grams Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono font-semibold text-slate-600">
                    <span>{slot.currentGrams.toLocaleString("id-ID")}g</span>
                    <span>{fillPercentage}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        slot.status === "CRITICAL"
                          ? "bg-rose-500"
                          : slot.status === "LOW"
                          ? "bg-amber-500"
                          : slot.status === "EXPIRED"
                          ? "bg-purple-600"
                          : "bg-[#2D3D6E]"
                      }`}
                      style={{ width: `${Math.max(4, fillPercentage)}%` }}
                    />
                  </div>
                </div>

                <div className="text-[9px] font-mono text-slate-400 flex justify-between">
                  <span>Batch: {slot.batchId ? slot.batchId.slice(-6) : "-"}</span>
                  <span className={slot.daysOpen >= 7 ? "font-bold text-rose-600" : ""}>
                    Day {slot.daysOpen}/8
                  </span>
                </div>

                {/* Slot Actions */}
                <div className="grid grid-cols-3 gap-1 pt-1.5">
                  <button
                    type="button"
                    title="Refill Tub"
                    onClick={() => {
                      setActiveSlot(slot);
                      setIsRefillOpen(true);
                    }}
                    className="py-1.5 rounded-full border border-slate-200 text-[#2D3D6E] hover:bg-slate-50 text-[10px] font-bold flex items-center justify-center gap-0.5 transition-colors"
                  >
                    <Plus className="w-2.5 h-2.5" />
                    <span>Refill</span>
                  </button>
                  <button
                    type="button"
                    title="Replace Tub"
                    onClick={() => {
                      setActiveSlot(slot);
                      setIsReplaceOpen(true);
                    }}
                    className="py-1.5 rounded-full border border-slate-200 text-[#2D3D6E] hover:bg-slate-50 text-[10px] font-bold flex items-center justify-center gap-0.5 transition-colors"
                  >
                    <RefreshCw className="w-2.5 h-2.5" />
                    <span>Swap</span>
                  </button>
                  <button
                    type="button"
                    title="Dispose Tub"
                    disabled={slot.currentGrams === 0}
                    onClick={() => {
                      setActiveSlot(slot);
                      setIsDisposePinOpen(true);
                    }}
                    className="py-1.5 rounded-full border border-rose-200 bg-rose-50/50 text-rose-700 hover:bg-rose-100 text-[10px] font-bold flex items-center justify-center gap-0.5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                    <span>Waste</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* REFILL MODAL */}
      {isRefillOpen && activeSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in select-none">
          <div className="w-full max-w-sm bg-white rounded-[32px] p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-lg text-[#2D3D6E]">Refill Slot {activeSlot.id}</h3>
              <button
                type="button"
                onClick={() => {
                  setIsRefillOpen(false);
                  setActiveSlot(null);
                }}
                className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              Refill {activeSlot.flavorName} (Current: {activeSlot.currentGrams}g / {activeSlot.maxCapacityGram}g).
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#2D3D6E] block">Grams to Add</label>
              <input
                type="number"
                value={refillGrams}
                onChange={(e) => setRefillGrams(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 font-mono text-sm font-bold text-[#2D3D6E] text-right focus:outline-hidden focus:ring-2 focus:ring-[#2D3D6E]/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsRefillOpen(false);
                  setActiveSlot(null);
                }}
                className="py-3 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRefillSubmit}
                className="py-3 rounded-full bg-[#2D3D6E] hover:bg-[#1E293B] text-white text-xs font-bold shadow-lg shadow-[#2D3D6E]/20 transition-all active:scale-[0.98]"
              >
                Confirm Refill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REPLACE TUB MODAL */}
      {isReplaceOpen && activeSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in select-none">
          <div className="w-full max-w-md bg-white rounded-[32px] p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-lg text-[#2D3D6E]">Assign Tub to Slot {activeSlot.id}</h3>
              <button
                type="button"
                onClick={() => {
                  setIsReplaceOpen(false);
                  setActiveSlot(null);
                }}
                className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#2D3D6E] block">
                Select Flavor from Catalog
              </label>
              <select
                value={newFlavorId}
                onChange={(e) => setNewFlavorId(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs font-semibold text-[#2D3D6E] focus:outline-hidden focus:ring-2 focus:ring-[#2D3D6E]/20"
              >
                <option value="">-- Choose Gelato Flavor --</option>
                {GELATO_FLAVORS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.series} - {f.maxCapacityGram}g)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsReplaceOpen(false);
                  setActiveSlot(null);
                }}
                className="py-3 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!newFlavorId}
                onClick={handleReplaceSubmit}
                className="py-3 rounded-full bg-[#2D3D6E] hover:bg-[#1E293B] text-white text-xs font-bold shadow-lg shadow-[#2D3D6E]/20 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                Assign New Tub
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DISPOSE PIN MODAL */}
      {isDisposePinOpen && activeSlot && (
        <PinModal
          isOpen={isDisposePinOpen}
          title={`Manager Auth: Dispose Tub ${activeSlot.id}`}
          description={`Authorizing waste disposal of ${activeSlot.currentGrams}g ${activeSlot.flavorName} requires Manager PIN.`}
          requiredRole="manager"
          onSuccess={handleDisposePinSuccess}
          onCancel={() => {
            setIsDisposePinOpen(false);
            setActiveSlot(null);
          }}
        />
      )}
    </div>
  );
}
