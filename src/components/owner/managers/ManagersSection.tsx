"use client";

import React, { useState } from "react";
import { useInventoryStore } from "@/store/useInventoryStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { PurchaseOrder } from "@/types/inventory";
import { formatRupiah } from "@/lib/utils/formatters";
import DataTable, { Column } from "@/components/common/ui/DataTable";
import PinModal from "@/components/common/ui/PinModal";
import {
  ShieldCheck,
  CheckCircle,
  X,
} from "lucide-react";

export default function ManagersSection() {
  const { currentUser } = useAuthStore();
  const { purchaseOrders, approvePurchaseOrderByOwner, rejectPurchaseOrder } = useInventoryStore();
  const { showToast } = useNotificationStore();

  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [isPinOpen, setIsPinOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // Filter high-value POs (>10M)
  const highValuePOs = purchaseOrders.filter((p) => p.requiresOwnerApproval);

  const handleOpenOwnerApprove = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setIsPinOpen(true);
  };

  const handleOwnerPinSuccess = (ownerName: string) => {
    if (selectedPO) {
      approvePurchaseOrderByOwner(selectedPO.id, ownerName);
    }
    setIsPinOpen(false);
    setSelectedPO(null);
  };

  const columns: Column<PurchaseOrder>[] = [
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
      header: "Supplier Name",
      accessorKey: "supplierName",
      cell: (row) => <span className="font-bold text-xs text-[#2D3D6E]">{row.supplierName}</span>,
    },
    {
      header: "Order Total",
      accessorKey: "totalCost",
      cell: (row) => (
        <div>
          <span className="font-mono font-bold text-xs text-purple-900 block">
            {formatRupiah(row.totalCost)}
          </span>
          <span className="text-[10px] text-slate-400 font-mono block">
            &gt; 10M Owner Approval
          </span>
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
      header: "Owner Action",
      cell: (row) =>
        row.status === "approved" ? (
          <span className="text-emerald-700 font-semibold text-xs flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" /> Approved by Owner
          </span>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleOpenOwnerApprove(row)}
              className="px-3.5 py-1.5 rounded-full bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-[0.98]"
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
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#2D3D6E] tracking-tight">High-Value PO Approvals & Controls</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Governance: Purchase orders over IDR 10,000,000 require Owner PIN sign-off.
          </p>
        </div>
      </div>

      {/* High Value PO Table */}
      <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-[0_10px_30px_rgba(45,61,110,0.05)] space-y-4">
        <DataTable
          data={highValuePOs}
          columns={columns}
          searchPlaceholder="Search high-value PO ID or supplier..."
          searchKey="supplierName"
          pageSize={6}
        />
      </div>

      {/* REJECT MODAL */}
      {isRejectOpen && selectedPO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in select-none">
          <div className="w-full max-w-md bg-white rounded-[32px] p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-lg text-[#2D3D6E]">Reject High-Value PO ({selectedPO.id})</h3>
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
                Specify the owner governance reason for rejecting PO {selectedPO.id} ({selectedPO.supplierName} - {formatRupiah(selectedPO.totalCost)}):
              </p>
              <textarea
                rows={3}
                placeholder="Reason for owner rejection (e.g., Budget cap exceeded, Unscheduled purchase)..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs font-medium text-[#2D3D6E] focus:ring-2 focus:ring-purple-700/20 focus:outline-hidden"
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
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (selectedPO) {
                    rejectPurchaseOrder(selectedPO.id, rejectReason || "Rejected by owner", currentUser?.username || "own_hendra");
                    showToast("PO Rejected by Owner", `PO ${selectedPO.id} has been rejected.`, "INFO");
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

      {/* PIN MODAL FOR OWNER APPROVAL */}
      <PinModal
        isOpen={isPinOpen}
        title="Owner PIN Authorization: High-Value PO"
        description={`Authorizing high-value PO ${selectedPO?.id} (${formatRupiah(selectedPO?.totalCost || 0)}) requires Owner 6-digit PIN.`}
        requiredRole="owner"
        onSuccess={handleOwnerPinSuccess}
        onCancel={() => {
          setIsPinOpen(false);
          setSelectedPO(null);
        }}
      />
    </div>
  );
}
