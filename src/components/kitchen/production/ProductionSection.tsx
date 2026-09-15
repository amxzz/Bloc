"use client";

import React, { useState } from "react";
import { useProductionStore } from "@/store/useProductionStore";
import { useAuthStore } from "@/store/useAuthStore";
import { GELATO_FLAVORS } from "@/lib/constants/gelatoData";
import { ProductionBatch, ProductionStage } from "@/types/kitchen";
import DataTable, { Column } from "@/components/common/ui/DataTable";
import {
  Factory,
  PlayCircle,
  CheckCircle,
  ArrowRight,
  Plus,
  X,
  Clock,
  Thermometer,
} from "lucide-react";

export default function ProductionSection() {
  const { currentUser } = useAuthStore();
  const { batches, createBatch, advanceBatchStage } = useProductionStore();

  const [isNewBatchOpen, setIsNewBatchOpen] = useState(false);
  const [selectedFlavorId, setSelectedFlavorId] = useState(GELATO_FLAVORS[0].id);
  const [targetLiter, setTargetLiter] = useState<number>(10);
  const [notes, setNotes] = useState("");

  const stages: ProductionStage[] = [
    "balancing",
    "pasteurizing",
    "aging",
    "churning",
    "blast_freezer",
    "tempering_ready",
    "completed",
  ];

  const stageParams: Record<string, { desc: string; target: string; time: string }> = {
    balancing: { desc: "Fat formulation audit", target: "6% Fat", time: "10 min" },
    pasteurizing: { desc: "High-temp thermal treatment", target: "65°C - 85°C", time: "25 min" },
    aging: { desc: "Cold maturation cycle", target: "4°C", time: "4-12 hrs" },
    churning: { desc: "Continuous aeration freezing", target: "-5°C to -9°C", time: "15 min" },
    blast_freezer: { desc: "Flash thermal hardening", target: "-30°C to -40°C", time: "45 min" },
    tempering_ready: { desc: "Showcase staging stability", target: "-11°C to -14°C", time: "Ready" },
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createBatch(selectedFlavorId, targetLiter, currentUser?.username || "ktc_budi", notes);
    setIsNewBatchOpen(false);
    setNotes("");
  };

  const handleAdvance = (batch: ProductionBatch) => {
    const currentIndex = stages.indexOf(batch.stage);
    if (currentIndex < stages.length - 1) {
      const nextStage = stages[currentIndex + 1];
      advanceBatchStage(batch.id, nextStage, undefined, undefined, undefined, currentUser?.username);
    }
  };

  const columns: Column<ProductionBatch>[] = [
    {
      header: "Batch ID",
      accessorKey: "id",
      cell: (row) => (
        <span className="font-mono font-bold text-xs text-[#2D3D6E] block">{row.id}</span>
      ),
    },
    {
      header: "Gelato Flavor",
      accessorKey: "flavorName",
      cell: (row) => (
        <div>
          <span className="font-bold text-xs text-[#2D3D6E] block">{row.flavorName}</span>
          <span className="text-[10px] text-slate-400 font-mono">{row.series}</span>
        </div>
      ),
    },
    {
      header: "Target / Yield",
      accessorKey: "targetOutputLiter",
      cell: (row) => (
        <span className="font-mono text-xs text-slate-700 font-semibold">
          {row.targetOutputLiter}L ({row.totalTubsProduced} Tubs)
        </span>
      ),
    },
    {
      header: "Overrun",
      accessorKey: "varianceOverrunPercent",
      cell: (row) => (
        <span className="font-mono text-xs text-emerald-700 font-bold">
          {row.varianceOverrunPercent}%
        </span>
      ),
    },
    {
      header: "Stage",
      accessorKey: "stage",
      cell: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            row.stage === "completed"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : row.stage === "blast_freezer"
              ? "bg-cyan-50 text-cyan-700 border border-cyan-200"
              : "bg-amber-50 text-amber-800 border border-amber-200"
          }`}
        >
          {row.stage.replace("_", " ")}
        </span>
      ),
    },
    {
      header: "Action",
      cell: (row) =>
        row.stage === "completed" ? (
          <span className="text-emerald-700 font-semibold text-xs flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" /> Ready for Tub
          </span>
        ) : (
          <button
            type="button"
            onClick={() => handleAdvance(row)}
            className="px-4 py-1.5 rounded-full bg-[#2D3D6E] hover:bg-[#1E293B] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-[0.98]"
          >
            <span>Advance Stage</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        ),
    },
  ];

  const activePipelineStages: ProductionStage[] = [
    "balancing",
    "pasteurizing",
    "aging",
    "churning",
    "blast_freezer",
    "tempering_ready",
  ];

  return (
    <div className="space-y-6 max-w-7xl select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-[0_10px_30px_rgba(45,61,110,0.05)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#2D3D6E] tracking-tight">Batch Production Board</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Standard 6-stage artisanal cycle: Balancing, Pasteurizing, Aging, Churning, Blast Freezing, and Tempering.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNewBatchOpen(true)}
          className="bg-[#2D3D6E] hover:bg-[#1E293B] active:scale-[0.98] text-white text-xs font-bold px-6 py-3 rounded-full flex items-center gap-2 shadow-lg shadow-[#2D3D6E]/20 transition-all"
        >
          <PlayCircle className="w-4 h-4" />
          <span>Start New Batch</span>
        </button>
      </div>

      {/* 6-Stage Production Pipeline Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {activePipelineStages.map((stg, index) => {
          const stageBatches = batches.filter((b) => b.stage === stg);
          const meta = stageParams[stg] || { desc: "", target: "", time: "" };

          return (
            <div key={stg} className="bg-white p-4 rounded-[24px] border border-slate-100 shadow-[0_10px_30px_rgba(45,61,110,0.03)] space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#2D3D6E]/10 text-[#2D3D6E] text-[10px] font-bold font-mono flex items-center justify-center">
                      {index + 1}
                    </span>
                    <h3 className="font-bold text-[11px] uppercase tracking-wider text-[#2D3D6E] font-mono truncate">
                      {stg.replace("_", " ")}
                    </h3>
                  </div>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {stageBatches.length}
                  </span>
                </div>

                <div className="mt-1.5 bg-[#F6F8FC] p-2 rounded-xl border border-slate-100 space-y-0.5">
                  <div className="flex items-center justify-between text-[9px] font-mono text-slate-600 font-medium">
                    <span className="flex items-center gap-1"><Thermometer className="w-2.5 h-2.5 text-[#2D3D6E]" /> {meta.target}</span>
                    <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5 text-[#2D3D6E]" /> {meta.time}</span>
                  </div>
                </div>

                <div className="space-y-2 mt-3 max-h-[320px] overflow-y-auto">
                  {stageBatches.length === 0 ? (
                    <p className="text-center py-6 text-slate-400 text-[11px] font-medium">No batches</p>
                  ) : (
                    stageBatches.map((b) => (
                      <div
                        key={b.id}
                        className="p-3 rounded-2xl border border-slate-100 bg-[#F6F8FC] hover:bg-white hover:border-[#2D3D6E]/20 shadow-xs transition-all space-y-2"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-mono font-bold text-[10px] text-[#2D3D6E] block">{b.id}</span>
                            <h4 className="font-bold text-xs text-[#2D3D6E]">{b.flavorName}</h4>
                          </div>
                          <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded-full border border-slate-200">
                            {b.targetOutputLiter}L
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                          <span className="text-[10px] font-mono text-slate-400">@{b.producedBy}</span>
                          <button
                            type="button"
                            onClick={() => handleAdvance(b)}
                            className="text-[11px] font-bold text-[#2D3D6E] hover:text-[#1C2646] flex items-center gap-1"
                          >
                            <span>Next</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Batches Table */}
      <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-[0_10px_30px_rgba(45,61,110,0.05)] space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-base text-[#2D3D6E]">Production Batches Log</h3>
            <p className="text-xs text-slate-500 font-medium">Audit trail of all created and completed gelato batches.</p>
          </div>
        </div>
        <DataTable
          data={batches}
          columns={columns}
          searchPlaceholder="Search batch ID or flavor..."
          searchKey="flavorName"
          pageSize={6}
        />
      </div>

      {/* NEW BATCH MODAL */}
      {isNewBatchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in select-none">
          <form
            onSubmit={handleCreateSubmit}
            className="w-full max-w-md bg-white rounded-[32px] p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-lg text-[#2D3D6E]">Initialize Production Batch</h3>
                <p className="text-xs text-slate-500 font-medium">Stage 1: Balancing & Fat Formulation</p>
              </div>
              <button
                type="button"
                onClick={() => setIsNewBatchOpen(false)}
                className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#2D3D6E] block mb-1.5">Gelato Flavor</label>
                <select
                  value={selectedFlavorId}
                  onChange={(e) => setSelectedFlavorId(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs font-semibold text-[#2D3D6E] focus:outline-hidden focus:ring-2 focus:ring-[#2D3D6E]/20"
                >
                  {GELATO_FLAVORS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.series})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#2D3D6E] block mb-1.5">
                  Target Output Volume (Liters)
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  required
                  value={targetLiter}
                  onChange={(e) => setTargetLiter(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 font-mono text-xs font-bold text-[#2D3D6E] text-right focus:outline-hidden focus:ring-2 focus:ring-[#2D3D6E]/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#2D3D6E] block mb-1.5">Batch Notes</label>
                <textarea
                  rows={2}
                  placeholder="Notes for kitchen operators..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs font-medium text-[#2D3D6E] focus:outline-hidden focus:ring-2 focus:ring-[#2D3D6E]/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsNewBatchOpen(false)}
                className="py-3 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-3 rounded-full bg-[#2D3D6E] hover:bg-[#1E293B] text-white text-xs font-bold shadow-lg shadow-[#2D3D6E]/20 transition-all active:scale-[0.98]"
              >
                Start Balancing
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
