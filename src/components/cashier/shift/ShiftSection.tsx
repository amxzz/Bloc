"use client";

import React, { useState } from "react";
import { useShiftStore } from "@/store/useShiftStore";
import { useAuthStore } from "@/store/useAuthStore";
import { formatRupiah } from "@/lib/utils/formatters";
import DataTable, { Column } from "@/components/common/ui/DataTable";
import KpiCard from "@/components/common/ui/KpiCard";
import { CashierShift } from "@/types/cashier";
import {
  Clock,
  PlayCircle,
  StopCircle,
  ArrowRight,
  X,
} from "lucide-react";

export default function ShiftSection() {
  const { currentUser } = useAuthStore();
  const { activeShift, shiftHistory, openShift, closeShift } = useShiftStore();

  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isOpenModalOpen, setIsOpenModalOpen] = useState(false);
  const [cashCountInput, setCashCountInput] = useState<number>(0);
  const [initialFloatInput, setInitialFloatInput] = useState<number>(500000);
  const [shiftNotes, setShiftNotes] = useState("");

  const expectedCash = (activeShift?.initialCashFloat || 0) + (activeShift?.totalSalesCash || 0);
  const calculatedDiscrepancy = cashCountInput - expectedCash;

  const handleOpenShiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    openShift(
      1,
      currentUser?.username || "csh_sarah",
      currentUser?.fullName || "Sarah Jenkins",
      initialFloatInput
    );
    setIsOpenModalOpen(false);
  };

  const handleCloseShiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    closeShift(cashCountInput, shiftNotes);
    setIsCloseModalOpen(false);
    setCashCountInput(0);
    setShiftNotes("");
  };

  const columns: Column<CashierShift>[] = [
    {
      header: "Shift #",
      accessorKey: "shiftNumber",
      cell: (row) => (
        <span className="font-mono font-bold text-xs text-[#2D3D6E]">
          Shift #{row.shiftNumber}
        </span>
      ),
    },
    {
      header: "Date",
      accessorKey: "shiftDate",
      cell: (row) => <span className="font-mono text-xs text-slate-600">{row.shiftDate}</span>,
    },
    {
      header: "Cashier",
      accessorKey: "cashierName",
      cell: (row) => (
        <div>
          <span className="font-bold text-xs text-[#2D3D6E] block">{row.cashierName}</span>
          <span className="text-[10px] text-slate-400 font-mono">@{row.cashierUsername}</span>
        </div>
      ),
    },
    {
      header: "Initial Float",
      accessorKey: "initialCashFloat",
      cell: (row) => (
        <span className="font-mono text-xs text-slate-700">{formatRupiah(row.initialCashFloat)}</span>
      ),
    },
    {
      header: "Cash Sales",
      accessorKey: "totalSalesCash",
      cell: (row) => (
        <span className="font-mono text-xs text-emerald-700 font-bold">
          {formatRupiah(row.totalSalesCash)}
        </span>
      ),
    },
    {
      header: "Digital Sales",
      accessorKey: "totalSalesDigital",
      cell: (row) => (
        <span className="font-mono text-xs text-indigo-700 font-bold">
          {formatRupiah(row.totalSalesDigital)}
        </span>
      ),
    },
    {
      header: "Variance",
      accessorKey: "discrepancyAmount",
      cell: (row) => {
        const disc = row.discrepancyAmount || 0;
        return (
          <span
            className={`font-mono font-bold text-xs ${
              disc === 0
                ? "text-slate-600"
                : disc > 0
                ? "text-emerald-700"
                : "text-rose-700"
            }`}
          >
            {disc !== 0 ? (disc > 0 ? `+${formatRupiah(disc)}` : formatRupiah(disc)) : "Balanced (0)"}
          </span>
        );
      },
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            row.status === "open"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-slate-100 text-slate-600 border border-slate-200"
          }`}
        >
          {row.status}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl select-none">
      {/* Active Shift Dashboard Card */}
      {activeShift ? (
        <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-[0_10px_30px_rgba(45,61,110,0.05)] space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-[#2D3D6E]">
                    {activeShift.shiftName || "Shift 1 Active"}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono text-xs font-bold border border-emerald-200">
                    OPEN
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Staff: <strong className="text-[#2D3D6E]">{activeShift.cashierName}</strong> • Started at {activeShift.startTime}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setCashCountInput(expectedCash);
                setIsCloseModalOpen(true);
              }}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-5 py-2.5 rounded-full flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <StopCircle className="w-4 h-4" />
              <span>Close Shift & Reconcile</span>
            </button>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <KpiCard
              title="Opening Cash Float"
              value={formatRupiah(activeShift.initialCashFloat)}
              subtitle="Initial drawer balance"
            />
            <KpiCard
              title="Cash Sales"
              value={formatRupiah(activeShift.totalSalesCash)}
              subtitle="Cash transactions in drawer"
              variant="success"
            />
            <KpiCard
              title="Digital Sales"
              value={formatRupiah(activeShift.totalSalesDigital)}
              subtitle="QRIS & EDC transactions"
            />
            <KpiCard
              title="Expected Drawer Cash"
              value={formatRupiah(expectedCash)}
              subtitle="Float + Cash Sales"
              variant="navy"
            />
          </div>
        </div>
      ) : (
        <div className="bg-white p-10 sm:p-12 rounded-[32px] border border-slate-100 shadow-[0_10px_30px_rgba(45,61,110,0.05)] text-center space-y-6">
          <div className="max-w-md mx-auto space-y-3">
            <h2 className="text-2xl font-extrabold text-[#2D3D6E] tracking-tight">Cashier Shift Inactive</h2>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              Open a new shift register to record duty cashier staff, verify initial cash float, and activate the POS terminal.
            </p>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-left text-xs font-mono text-slate-700 flex justify-between items-center">
              <span>Staff: <strong className="text-[#2D3D6E]">@{currentUser?.username || "csh_sarah"}</strong></span>
              <span className="text-[11px] text-slate-500">Standard Float: Rp 500.000</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOpenModalOpen(true)}
            className="bg-[#2D3D6E] hover:bg-[#1C2646] text-white text-xs font-bold px-8 py-3.5 rounded-full inline-flex items-center gap-2 shadow-lg shadow-[#2D3D6E]/20 transition-all cursor-pointer"
          >
            <span>Open Cashier Register</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* History Table */}
      <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-[0_10px_30px_rgba(45,61,110,0.05)] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-extrabold text-base text-[#2D3D6E]">Shift History Journal</h3>
          <span className="text-xs text-slate-400 font-mono">{shiftHistory.length} Recorded Shifts</span>
        </div>
        <DataTable
          data={shiftHistory}
          columns={columns}
          searchPlaceholder="Search cashier or date..."
          searchKey="cashierName"
          pageSize={6}
        />
      </div>

      {/* CLOSE SHIFT RECONCILIATION MODAL */}
      {isCloseModalOpen && activeShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in select-none">
          <form
            onSubmit={handleCloseShiftSubmit}
            className="w-full max-w-md bg-white rounded-[32px] p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-[#2D3D6E]">Close Shift Reconciliation</h3>
              <button
                type="button"
                onClick={() => setIsCloseModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Initial Float:</span>
                <span>{formatRupiah(activeShift.initialCashFloat)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Cash Sales:</span>
                <span>+{formatRupiah(activeShift.totalSalesCash)}</span>
              </div>
              <div className="flex justify-between font-bold text-[#2D3D6E] pt-1.5 border-t border-slate-200">
                <span>Expected Drawer Total:</span>
                <span>{formatRupiah(expectedCash)}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2D3D6E] block px-1">
                Actual Physical Cash Counted (IDR)
              </label>
              <input
                type="number"
                required
                value={cashCountInput || ""}
                onChange={(e) => setCashCountInput(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-full border border-slate-200 font-mono text-sm font-bold text-right text-[#2D3D6E] focus:outline-hidden focus:border-[#2D3D6E]"
              />
            </div>

            {/* Discrepancy Alert */}
            <div
              className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs font-mono font-bold ${
                calculatedDiscrepancy === 0
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-rose-50 border-rose-200 text-rose-800"
              }`}
            >
              <span>Variance (Discrepancy):</span>
              <span>
                {calculatedDiscrepancy === 0
                  ? "Balanced (IDR 0)"
                  : calculatedDiscrepancy > 0
                  ? `+${formatRupiah(calculatedDiscrepancy)} (Over)`
                  : `${formatRupiah(calculatedDiscrepancy)} (Short)`}
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2D3D6E] block px-1">Closing Notes</label>
              <textarea
                rows={2}
                placeholder="Notes or variance explanations..."
                value={shiftNotes}
                onChange={(e) => setShiftNotes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-2xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-[#2D3D6E]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCloseModalOpen(false)}
                className="py-3 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md"
              >
                Confirm & Close Shift
              </button>
            </div>
          </form>
        </div>
      )}

      {/* OPEN SHIFT MODAL */}
      {isOpenModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in select-none">
          <form
            onSubmit={handleOpenShiftSubmit}
            className="w-full max-w-sm bg-white rounded-[32px] p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-lg text-[#2D3D6E]">Open Register Shift</h3>
                <p className="text-xs text-slate-500 font-medium">Shift 1 (Morning)</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpenModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2D3D6E] block px-1">
                Opening Cash Float (IDR)
              </label>
              <input
                type="number"
                required
                value={initialFloatInput || ""}
                onChange={(e) => setInitialFloatInput(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-full border border-slate-200 font-mono text-sm font-bold text-right text-[#2D3D6E] focus:outline-hidden focus:border-[#2D3D6E]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsOpenModalOpen(false)}
                className="py-3 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-3 rounded-full bg-[#2D3D6E] hover:bg-[#1C2646] text-white text-xs font-bold shadow-md"
              >
                Start Shift
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
