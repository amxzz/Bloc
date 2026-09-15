"use client";

import React, { useState } from "react";
import { useInventoryStore } from "@/store/useInventoryStore";
import { useFreezerStore } from "@/store/useFreezerStore";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { PurchaseOrder } from "@/types/inventory";
import { formatRupiah } from "@/lib/utils/formatters";
import DataTable, { Column } from "@/components/common/ui/DataTable";
import PinModal from "@/components/common/ui/PinModal";
import {
  ShieldCheck,
  CheckCircle,
  Lock,
  X,
} from "lucide-react";

export default function ApprovalsSection() {
  const { currentUser } = useAuthStore();
  const { purchaseOrders, approvePurchaseOrderByManager, rejectPurchaseOrder } = useInventoryStore();
  const { wasteLogs } = useFreezerStore();
  const { transactions } = useCartStore();
  const { showToast } = useNotificationStore();

  const [activeTab, setActiveTab] = useState<"po" | "waste" | "void">("po");
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [isPinOpen, setIsPinOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejectOpen, setIsRejectOpen] = useState(false);

  const pendingPOs = purchaseOrders.filter(
    (p) => p.status === "pending_manager_approval" || p.status === "pending_owner_approval"
  );
  const pendingWaste = wasteLogs;
  const voidedTransactions = transactions.filter((t) => t.paymentStatus === "void" || t.paymentStatus === "refunded");

  const handleOpenApprovePO = (po: PurchaseOrder) => {
    if (po.requiresOwnerApproval) {
      showToast(
        "Owner Approval Required",
        `PO ${po.id} is valued at ${formatRupiah(po.totalCost)} (> IDR 10,000,000) and must be authorized directly by the Owner.`,
        "WARNING"
      );
      return;
    }
    setSelectedPO(po);
    setIsPinOpen(true);
  };

  const handlePinSuccess = (managerName: string) => {
    if (selectedPO) {
      approvePurchaseOrderByManager(selectedPO.id, managerName);
    }
    setIsPinOpen(false);
    setSelectedPO(null);
  };

  const poColumns: Column<PurchaseOrder>[] = [
    {
      header: "PO ID",
      accessorKey: "id",
      cell: (row) => (
        <div>
          <span className="font-mono font-bold text-xs text-[#2D3D6E] block">{row.id}</span>
          <span className="text-[10px] text-slate-400 font-mono">By @{row.createdBy}</span>
        </div>
      ),
    },
    {
      header: "Supplier",
      accessorKey: "supplierName",
      cell: (row) => <span className="font-bold text-xs text-[#2D3D6E]">{row.supplierName}</span>,
    },
    {
      header: "Total Cost",
      accessorKey: "totalCost",
      cell: (row) => (
        <div>
          <span className="font-mono font-bold text-xs text-[#2D3D6E] block">
            {formatRupiah(row.totalCost)}
          </span>
          {row.requiresOwnerApproval && (
            <span className="text-[10px] text-slate-400 font-mono block">
              &gt; 10M Owner Required
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            row.status === "approved"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : row.status === "pending_owner_approval"
              ? "bg-purple-50 text-purple-700 border border-purple-200"
              : "bg-amber-50 text-amber-800 border border-amber-200"
          }`}
        >
          {row.status.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      header: "Manager Action",
      cell: (row) =>
        row.status === "approved" ? (
          <span className="text-emerald-700 font-semibold text-xs flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" /> Approved
          </span>
        ) : row.requiresOwnerApproval ? (
          <span className="text-purple-700 font-mono text-[11px] font-bold flex items-center gap-1 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
            <Lock className="w-3 h-3" /> Owner Required
          </span>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleOpenApprovePO(row)}
              className="px-3.5 py-1.5 rounded-full bg-[#2D3D6E] hover:bg-[#1E293B] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-[0.98]"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#F0E79D]" />
              <span>Authorize PIN</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedPO(row);
                setIsRejectOpen(true);
              }}
              className="px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition-all"
            >
              Reject
            </button>
          </div>
        ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-[0_10px_30px_rgba(45,61,110,0.05)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#2D3D6E] tracking-tight">Manager Approvals Inbox</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Authorize store purchase orders &lt;= IDR 10M, waste logs, and customer void requests.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-[#F6F8FC] p-1.5 rounded-full border border-slate-100">
          <button
            type="button"
            onClick={() => setActiveTab("po")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "po" ? "bg-[#2D3D6E] text-white shadow-md shadow-[#2D3D6E]/20" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Purchase Orders</span>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-white/20">
              {pendingPOs.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("waste")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "waste" ? "bg-[#2D3D6E] text-white shadow-md shadow-[#2D3D6E]/20" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Waste Logs</span>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
              {pendingWaste.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("void")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "void" ? "bg-[#2D3D6E] text-white shadow-md shadow-[#2D3D6E]/20" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Void & Refund Logs</span>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
              {voidedTransactions.length}
            </span>
          </button>
        </div>
      </div>

      {/* Content based on Tab */}
      {activeTab === "po" && (
        <div className="space-y-4">
          {pendingPOs.length === 0 && (
            <div className="p-8 rounded-[32px] bg-emerald-50/70 border border-emerald-200 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto font-bold shadow-2xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-emerald-950">All Approvals Completed (Zero-Inbox)</h3>
                <p className="text-xs text-emerald-800 font-medium max-w-md mx-auto mt-1">
                  There are no pending purchase orders or authorization tasks. All operational requests are cleared.
                </p>
              </div>
            </div>
          )}

          <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-[0_10px_30px_rgba(45,61,110,0.05)] space-y-4">
            <DataTable
              data={purchaseOrders}
              columns={poColumns}
              searchPlaceholder="Search PO reference or supplier..."
              searchKey="supplierName"
              pageSize={6}
            />
          </div>
        </div>
      )}

      {activeTab === "waste" && (
        <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-[0_10px_30px_rgba(45,61,110,0.05)] space-y-4">
          <h3 className="font-extrabold text-base text-[#2D3D6E]">Showcase Tub Waste Authorizations</h3>
          <div className="space-y-2.5">
            {pendingWaste.map((w) => (
              <div
                key={w.id}
                className="p-4 rounded-2xl border border-slate-100 bg-[#F6F8FC] flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-[#2D3D6E]">{w.id}</span>
                    <h4 className="font-bold text-xs text-[#2D3D6E]">{w.flavorName} ({w.estimatedWeightGram}g)</h4>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Reason: {w.reason} • Reported by @{w.reportedBy} • Approved by @{w.approvedByManager || "mgr_doni"}
                  </p>
                </div>
                <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Authorized
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "void" && (
        <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-[0_10px_30px_rgba(45,61,110,0.05)] space-y-4">
          <h3 className="font-extrabold text-base text-[#2D3D6E]">Void & Refund Authorizations History</h3>
          <div className="space-y-2.5">
            {voidedTransactions.length === 0 ? (
              <p className="text-center py-8 text-slate-400 text-xs font-medium">No void or refunded transactions recorded.</p>
            ) : (
              voidedTransactions.map((trx) => (
                <div
                  key={trx.id}
                  className="p-4 rounded-2xl border border-slate-100 bg-[#F6F8FC] flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-[#2D3D6E]">{trx.receiptNumber}</span>
                      <span className="font-mono font-bold text-xs text-rose-700">
                        {formatRupiah(trx.totalAmount)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      Reason: {trx.voidRefundReason || "Customer cancellation"} • Auth by @{trx.approvedBy || "mgr_doni"}
                    </p>
                  </div>
                  <span className="text-xs uppercase font-bold text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                    {trx.paymentStatus}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {isRejectOpen && selectedPO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in select-none">
          <div className="w-full max-w-md bg-white rounded-[32px] p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-lg text-[#2D3D6E]">Reject Purchase Order ({selectedPO.id})</h3>
              <button
                type="button"
                onClick={() => {
                  setIsRejectOpen(false);
                  setSelectedPO(null);
                  setRejectReason("");
                }}
                className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-600 font-medium">
                Please specify the business reason for rejecting PO {selectedPO.id} ({selectedPO.supplierName} - {formatRupiah(selectedPO.totalCost)}):
              </p>
              <textarea
                rows={3}
                placeholder="Reason for rejection (e.g., Price mismatch, Supplier unverified)..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs font-medium text-[#2D3D6E] focus:ring-2 focus:ring-[#2D3D6E]/20 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsRejectOpen(false);
                  setSelectedPO(null);
                  setRejectReason("");
                }}
                className="py-3 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (selectedPO) {
                    rejectPurchaseOrder(selectedPO.id, rejectReason || "Rejected by manager", currentUser?.username || "mgr_doni");
                    showToast("PO Rejected", `PO ${selectedPO.id} has been rejected.`, "INFO");
                  }
                  setIsRejectOpen(false);
                  setSelectedPO(null);
                  setRejectReason("");
                }}
                className="py-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-lg shadow-rose-600/20 transition-all active:scale-[0.98]"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PIN MODAL FOR PO APPROVAL */}
      <PinModal
        isOpen={isPinOpen}
        title="Manager PIN Authorization: Purchase Order"
        description={`Approving PO ${selectedPO?.id} (${formatRupiah(selectedPO?.totalCost || 0)}) requires Manager 6-digit PIN.`}
        requiredRole="manager"
        onSuccess={handlePinSuccess}
        onCancel={() => {
          setIsPinOpen(false);
          setSelectedPO(null);
        }}
      />
    </div>
  );
}
