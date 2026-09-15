"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useCartStore } from "@/store/useCartStore";
import { Transaction } from "@/types/cashier";
import { formatRupiah } from "@/lib/utils/formatters";
import DataTable, { Column } from "@/components/common/ui/DataTable";
import PinModal from "@/components/common/ui/PinModal";
import {
  Printer,
  Ban,
  RotateCcw,
  Eye,
  X,
  CreditCard,
  Banknote,
  QrCode,
} from "lucide-react";

export default function TransactionsSection() {
  const { transactions, voidRefundTransaction } = useCartStore();
  const [selectedTrx, setSelectedTrx] = useState<Transaction | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Pin authorization state
  const [isPinOpen, setIsPinOpen] = useState(false);
  const [actionType, setActionType] = useState<"void" | "refunded">("void");
  const [targetTrxId, setTargetTrxId] = useState<string | null>(null);
  const [voidReason, setVoidReason] = useState("");

  const handleInitiateVoidRefund = (trx: Transaction, type: "void" | "refunded") => {
    setTargetTrxId(trx.id);
    setActionType(type);
    setIsPinOpen(true);
  };

  const handlePinSuccess = (managerName: string) => {
    if (targetTrxId) {
      voidRefundTransaction(
        targetTrxId,
        voidReason || "Customer cancellation requested.",
        managerName,
        actionType
      );
    }
    setIsPinOpen(false);
    setTargetTrxId(null);
    setVoidReason("");
  };

  const columns: Column<Transaction>[] = [
    {
      header: "Receipt #",
      accessorKey: "receiptNumber",
      cell: (row) => (
        <div>
          <span className="font-mono font-bold text-xs text-[#2D3D6E] block">
            {row.receiptNumber}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">@{row.cashierUsername}</span>
        </div>
      ),
    },
    {
      header: "Date & Time",
      accessorKey: "createdAt",
      cell: (row) => <span className="font-mono text-xs text-slate-600">{row.createdAt}</span>,
    },
    {
      header: "Items Summary",
      cell: (row) => (
        <div className="max-w-xs truncate text-xs text-[#2D3D6E] font-medium">
          {row.items.map((it) => `${it.quantity}x ${it.packaging.name}`).join(", ")}
        </div>
      ),
    },
    {
      header: "Payment",
      accessorKey: "paymentMethod",
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          {row.paymentMethod === "qris" && <QrCode className="w-3.5 h-3.5 text-[#2D3D6E]" />}
          {row.paymentMethod === "cash" && <Banknote className="w-3.5 h-3.5 text-emerald-600" />}
          {row.paymentMethod === "edc" && <CreditCard className="w-3.5 h-3.5 text-indigo-600" />}
          <span className="font-mono text-xs uppercase font-semibold text-slate-700">
            {row.paymentMethod}
          </span>
        </div>
      ),
    },
    {
      header: "Total",
      accessorKey: "totalAmount",
      cell: (row) => (
        <span className="font-mono font-bold text-xs text-[#2D3D6E]">
          {formatRupiah(row.totalAmount)}
        </span>
      ),
    },
    {
      header: "Status",
      accessorKey: "paymentStatus",
      cell: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            row.paymentStatus === "paid"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : row.paymentStatus === "void"
              ? "bg-rose-50 text-rose-700 border border-rose-200"
              : "bg-amber-50 text-amber-800 border border-amber-200"
          }`}
        >
          {row.paymentStatus}
        </span>
      ),
    },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            title="View Details"
            onClick={() => {
              setSelectedTrx(row);
              setIsDetailOpen(true);
            }}
            className="p-2 rounded-full text-slate-500 hover:text-[#2D3D6E] hover:bg-slate-100 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Reprint Thermal Receipt"
            onClick={() => {
              setSelectedTrx(row);
              setIsReceiptOpen(true);
            }}
            className="p-2 rounded-full text-slate-500 hover:text-[#2D3D6E] hover:bg-slate-100 transition-colors"
          >
            <Printer className="w-4 h-4" />
          </button>
          {row.paymentStatus === "paid" && (
            <>
              <button
                type="button"
                title="Void Transaction"
                onClick={() => handleInitiateVoidRefund(row, "void")}
                className="p-2 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <Ban className="w-4 h-4" />
              </button>
              <button
                type="button"
                title="Refund Transaction"
                onClick={() => handleInitiateVoidRefund(row, "refunded")}
                className="p-2 rounded-full text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl select-none">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-[0_10px_30px_rgba(45,61,110,0.05)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#2D3D6E] tracking-tight">Transaction Journal</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Real-time sales register. Void and Refund actions require Manager PIN authorization.
          </p>
        </div>
      </div>

      {/* Transactions Data Table */}
      <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-[0_10px_30px_rgba(45,61,110,0.05)] space-y-4">
        <DataTable
          data={transactions}
          columns={columns}
          searchPlaceholder="Search by receipt # or cashier..."
          searchKey="receiptNumber"
          pageSize={8}
        />
      </div>

      {/* DETAIL MODAL */}
      {isDetailOpen && selectedTrx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in select-none">
          <div className="w-full max-w-md bg-white rounded-[32px] p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-lg text-[#2D3D6E]">Transaction Details</h3>
                <p className="font-mono text-xs text-slate-400">{selectedTrx.receiptNumber}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailOpen(false)}
                className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
              {selectedTrx.items.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-[#F6F8FC] border border-slate-100 space-y-1">
                  <div className="flex justify-between font-bold text-xs text-[#2D3D6E]">
                    <span>
                      {item.quantity}x {item.packaging.name} ({item.packaging.category})
                    </span>
                    <span className="font-mono">{formatRupiah(item.totalPrice)}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {item.selectedFlavors.map((f) => f.flavorName).join(" • ")}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>{formatRupiah(selectedTrx.subtotalAmount)}</span>
              </div>
              {selectedTrx.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount:</span>
                  <span>-{formatRupiah(selectedTrx.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>PB1 Tax (10%):</span>
                <span>{formatRupiah(selectedTrx.taxAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-[#2D3D6E] pt-2 border-t border-slate-200">
                <span>Total Amount:</span>
                <span>{formatRupiah(selectedTrx.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AUTHENTIC REPRINT RECEIPT MODAL */}
      {isReceiptOpen && selectedTrx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in select-none">
          <div className="w-full max-w-sm bg-white rounded-[32px] p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-200 p-4 bg-white font-mono text-xs text-slate-800 space-y-3 pr-2">
              <div className="text-center space-y-1">
                <div className="flex justify-center pb-1">
                  <Image
                    src="/assets/Secondary logo.svg"
                    alt="Bloc. Logo"
                    width={40}
                    height={28}
                    className="h-7 w-auto object-contain brightness-0"
                    priority
                  />
                </div>
                <h2 className="font-bold text-sm text-[#2D3D6E] tracking-wider">BLOC. GELATO</h2>
                <p className="text-[11px] text-slate-500">Artisanal Italian Gelato</p>
                <p className="text-[10px] text-slate-400">Flagship Store (Reprint)</p>
              </div>

              <div className="pt-2">
                <div className="flex justify-between items-center text-[10px] text-slate-500 pb-2">
                  <span>Receipt #{selectedTrx.receiptNumber}</span>
                  <span>{selectedTrx.createdAt}</span>
                </div>
                <div className="border-b border-dotted border-slate-300" />
              </div>

              {/* Items List */}
              <div className="space-y-2 py-1 max-h-[160px] overflow-y-auto pr-1">
                {selectedTrx.items.map((item, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-900">
                      <span>
                        {item.packaging.name} × {item.quantity}
                      </span>
                      <span>IDR {item.totalPrice.toLocaleString("id-ID")}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-sans leading-tight">
                      {item.selectedFlavors.map((f) => f.flavorName).join(", ")}
                    </p>
                  </div>
                ))}
              </div>

              <div>
                <div className="border-b border-dotted border-slate-300 mb-2" />
                <div className="space-y-1.5 text-xs text-slate-700">
                  <div className="flex justify-between items-center">
                    <span>Subtotal</span>
                    <span>IDR {selectedTrx.subtotalAmount.toLocaleString("id-ID")}</span>
                  </div>
                  {selectedTrx.discountAmount > 0 && (
                    <div className="flex justify-between items-center text-emerald-700">
                      <span>Discount</span>
                      <span>-IDR {selectedTrx.discountAmount.toLocaleString("id-ID")}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span>Tax (10%)</span>
                    <span>IDR {selectedTrx.taxAmount.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between items-center font-bold text-sm text-slate-900 pt-1.5">
                    <span>Total Paid</span>
                    <span>IDR {selectedTrx.totalAmount.toLocaleString("id-ID")}</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="border-b border-dotted border-slate-300 mb-2" />
                <div className="space-y-1 text-[10px] text-slate-600">
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span className="font-bold uppercase">{selectedTrx.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cashier:</span>
                    <span className="font-bold">@{selectedTrx.cashierUsername}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 shrink-0">
              <button
                type="button"
                onClick={() => setIsReceiptOpen(false)}
                className="py-3 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                  setIsReceiptOpen(false);
                }}
                className="py-3 rounded-full bg-[#2D3D6E] hover:bg-[#1E293B] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-[#2D3D6E]/20 transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PIN AUTH MODAL FOR VOID/REFUND */}
      <PinModal
        isOpen={isPinOpen}
        title={`Manager Authorization: ${actionType.toUpperCase()}`}
        description={`Authorizing transaction ${actionType.toUpperCase()} requires Manager 6-digit PIN.`}
        requiredRole="manager"
        onSuccess={handlePinSuccess}
        onCancel={() => {
          setIsPinOpen(false);
          setTargetTrxId(null);
        }}
      />
    </div>
  );
}
