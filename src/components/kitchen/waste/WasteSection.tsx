"use client";

import React, { useState } from "react";
import { useFreezerStore } from "@/store/useFreezerStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { WasteLogEntry, WasteReason } from "@/types/kitchen";
import DataTable, { Column } from "@/components/common/ui/DataTable";
import PinModal from "@/components/common/ui/PinModal";
import {
  Trash2,
  CheckCircle,
  Plus,
  ShieldCheck,
  X,
} from "lucide-react";

export default function WasteSection() {
  const { currentUser } = useAuthStore();
  const { wasteLogs, slots, disposeTubInSlot } = useFreezerStore();
  const { showToast } = useNotificationStore();

  const [isDisposeModalOpen, setIsDisposeModalOpen] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState(slots[0]?.id || "A01");
  const [reason, setReason] = useState<WasteReason>("Expired");
  const [notes, setNotes] = useState("");
  const [isPinOpen, setIsPinOpen] = useState(false);

  const activeSlotToDispose = slots.find((s) => s.id === selectedSlotId);

  const handleStartDispose = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSlotToDispose || activeSlotToDispose.currentGrams <= 0) {
      showToast("Empty Slot", "The selected slot is currently empty.", "WARNING");
      return;
    }
    setIsDisposeModalOpen(false);
    setIsPinOpen(true);
  };

  const handlePinSuccess = (managerName: string) => {
    if (selectedSlotId) {
      disposeTubInSlot(selectedSlotId, reason, managerName, notes, currentUser?.username || "ktc_budi");
    }
    setIsPinOpen(false);
    setNotes("");
  };

  const columns: Column<WasteLogEntry>[] = [
    {
      header: "Log ID",
      accessorKey: "id",
      cell: (row) => (
        <span className="font-mono font-bold text-xs text-[#2D3D6E] block">{row.id}</span>
      ),
    },
    {
      header: "Tub Batch & Slot",
      accessorKey: "tubBatchId",
      cell: (row) => (
        <div>
          <span className="font-mono font-bold text-xs text-[#2D3D6E] block">{row.tubBatchId}</span>
          <span className="text-[10px] text-slate-400 font-mono">Slot {row.slotId || "-"}</span>
        </div>
      ),
    },
    {
      header: "Flavor Name",
      accessorKey: "flavorName",
      cell: (row) => <span className="font-bold text-xs text-[#2D3D6E]">{row.flavorName}</span>,
    },
    {
      header: "Waste Weight",
      accessorKey: "estimatedWeightGram",
      cell: (row) => (
        <span className="font-mono font-bold text-xs text-rose-700">
          {row.estimatedWeightGram.toLocaleString("id-ID")} grams
        </span>
      ),
    },
    {
      header: "Reason",
      accessorKey: "reason",
      cell: (row) => (
        <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200 uppercase font-mono">
          {row.reason}
        </span>
      ),
    },
    {
      header: "Manager Auth",
      accessorKey: "approvedByManager",
      cell: (row) => (
        <span className="text-emerald-700 font-mono text-xs font-semibold flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5" /> @{row.approvedByManager || "mgr_doni"}
        </span>
      ),
    },
    {
      header: "Timestamp",
      accessorKey: "createdAt",
      cell: (row) => <span className="font-mono text-xs text-slate-500">{row.createdAt}</span>,
    },
  ];

  const totalGramsWasted = wasteLogs.reduce((sum, w) => sum + w.estimatedWeightGram, 0);

  return (
    <div className="space-y-6 max-w-7xl select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-[0_10px_30px_rgba(45,61,110,0.05)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#2D3D6E] tracking-tight">Waste & Spoilage Logs</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Mandatory disposal recording for expired or defect gelato tubs. Requires Manager PIN authorization.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsDisposeModalOpen(true)}
          className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-6 py-3 rounded-full flex items-center gap-2 shadow-lg shadow-rose-600/20 transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Report Waste Tub</span>
        </button>
      </div>

      {/* Waste Table */}
      <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-[0_10px_30px_rgba(45,61,110,0.05)] space-y-4">
        <DataTable
          data={wasteLogs}
          columns={columns}
          searchPlaceholder="Search log ID, batch, or flavor..."
          searchKey="flavorName"
          pageSize={6}
        />
      </div>

      {/* REPORT WASTE FORM MODAL */}
      {isDisposeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in select-none">
          <form
            onSubmit={handleStartDispose}
            className="w-full max-w-md bg-white rounded-[32px] p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-lg text-[#2D3D6E]">Report Waste Tub</h3>
                <p className="text-xs text-slate-500 font-medium">Log spoilage and trigger Manager PIN</p>
              </div>
              <button
                type="button"
                onClick={() => setIsDisposeModalOpen(false)}
                className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#2D3D6E] block mb-1.5">Select Active Slot</label>
                <select
                  value={selectedSlotId}
                  onChange={(e) => setSelectedSlotId(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs font-semibold text-[#2D3D6E] bg-white focus:ring-2 focus:ring-[#2D3D6E]/20 focus:outline-hidden"
                >
                  {slots
                    .filter((s) => s.currentGrams > 0)
                    .map((slot) => (
                      <option key={slot.id} value={slot.id}>
                        Slot {slot.id} ({slot.flavorName} - {slot.currentGrams}g, Day {slot.daysOpen}/8)
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#2D3D6E] block mb-1.5">Waste Reason</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as WasteReason)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs font-semibold text-[#2D3D6E] bg-white focus:ring-2 focus:ring-[#2D3D6E]/20 focus:outline-hidden"
                >
                  {(
                    [
                      "Expired",
                      "Freezer Thawed",
                      "Contaminated",
                      "Texture Defect",
                      "Accidental Spill",
                    ] as WasteReason[]
                  ).map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#2D3D6E] block mb-1.5">Disposal Notes</label>
                <textarea
                  rows={2}
                  placeholder="Provide brief context on why this tub was discarded..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs font-medium text-[#2D3D6E] focus:outline-hidden focus:ring-2 focus:ring-[#2D3D6E]/20"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F6F8FC] border border-slate-100 text-xs font-medium text-[#2D3D6E] flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#2D3D6E] shrink-0" />
              <span>Proceeding will require Manager 6-digit PIN authorization to finalize disposal.</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDisposeModalOpen(false)}
                className="py-3 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                className="py-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-lg shadow-rose-600/20 transition-all active:scale-[0.98]"
              >
                Request PIN
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PIN MODAL */}
      <PinModal
        isOpen={isPinOpen}
        title="Manager Auth: Waste Disposal"
        description={`Authorizing disposal of Slot ${selectedSlotId} (${activeSlotToDispose?.flavorName || "Gelato"}) requires Manager PIN.`}
        requiredRole="manager"
        onSuccess={handlePinSuccess}
        onCancel={() => setIsPinOpen(false)}
      />
    </div>
  );
}
