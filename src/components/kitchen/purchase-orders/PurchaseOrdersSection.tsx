"use client";

import React, { useState } from "react";
import { useInventoryStore } from "@/store/useInventoryStore";
import { useAuthStore } from "@/store/useAuthStore";
import { PurchaseOrder, POLineItem } from "@/types/inventory";
import { formatRupiah } from "@/lib/utils/formatters";
import DataTable, { Column } from "@/components/common/ui/DataTable";
import {
  FileText,
  Plus,
  PackageCheck,
  CheckCircle,
  Trash2,
  X,
} from "lucide-react";

export default function PurchaseOrdersSection() {
  const { currentUser } = useAuthStore();
  const { purchaseOrders, createPurchaseOrder, receivePurchaseOrder, items, suppliers } = useInventoryStore();

  const [isNewPOOpen, setIsNewPOOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id || "sup-01");
  const [notes, setNotes] = useState("");

  const activeSupplier = suppliers.find((s) => s.id === selectedSupplierId) || suppliers[0];

  const getFilteredItems = (supplierCategory?: string) => {
    if (!supplierCategory) return items;
    if (supplierCategory === "Packaging") {
      const match = items.filter((i) => i.category === "packaging");
      return match.length > 0 ? match : items;
    }
    if (supplierCategory === "Dairy") {
      const match = items.filter((i) => i.category === "raw_material");
      return match.length > 0 ? match : items;
    }
    if (supplierCategory === "Flavor & Puree") {
      const match = items.filter((i) => i.category === "raw_material" || i.category === "topping" || i.category === "sauce");
      return match.length > 0 ? match : items;
    }
    return items;
  };

  const currentAvailableItems = getFilteredItems(activeSupplier?.category);

  const [lineItems, setLineItems] = useState<POLineItem[]>([
    {
      itemId: currentAvailableItems[0]?.id || items[0]?.id || "item-01",
      itemCode: currentAvailableItems[0]?.itemCode || items[0]?.itemCode || "PKG-CUP-MED",
      itemName: currentAvailableItems[0]?.itemName || items[0]?.itemName || "Cup Medio",
      quantity: 500,
      unitCost: currentAvailableItems[0]?.costPerUnit || items[0]?.costPerUnit || 1200,
      subtotal: 500 * (currentAvailableItems[0]?.costPerUnit || items[0]?.costPerUnit || 1200),
    },
  ]);

  const handleSupplierChange = (supId: string) => {
    setSelectedSupplierId(supId);
    const sup = suppliers.find((s) => s.id === supId);
    const validItems = getFilteredItems(sup?.category);
    if (validItems.length > 0) {
      setLineItems([
        {
          itemId: validItems[0].id,
          itemCode: validItems[0].itemCode,
          itemName: validItems[0].itemName,
          quantity: 100,
          unitCost: validItems[0].costPerUnit,
          subtotal: 100 * validItems[0].costPerUnit,
        },
      ]);
    }
  };

  const totalCalculated = lineItems.reduce((sum, it) => sum + it.subtotal, 0);
  const isHighValue = totalCalculated > 10000000;

  const handleAddLineItem = () => {
    const defaultItem = currentAvailableItems[0] || items[0];
    if (!defaultItem) return;
    setLineItems((prev) => [
      ...prev,
      {
        itemId: defaultItem.id,
        itemCode: defaultItem.itemCode,
        itemName: defaultItem.itemName,
        quantity: 100,
        unitCost: defaultItem.costPerUnit,
        subtotal: 100 * defaultItem.costPerUnit,
      },
    ]);
  };

  const handleUpdateLine = (index: number, itemId: string, quantity: number) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    setLineItems((prev) =>
      prev.map((line, idx) =>
        idx === index
          ? {
              ...line,
              itemId: item.id,
              itemCode: item.itemCode,
              itemName: item.itemName,
              quantity,
              unitCost: item.costPerUnit,
              subtotal: quantity * item.costPerUnit,
            }
          : line
      )
    );
  };

  const handleRemoveLine = (index: number) => {
    setLineItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleCreatePOSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSupplier || lineItems.length === 0) return;
    createPurchaseOrder(activeSupplier.name, lineItems, notes, currentUser?.username || "ktc_budi");
    setIsNewPOOpen(false);
    setNotes("");
  };

  const columns: Column<PurchaseOrder>[] = [
    {
      header: "PO Reference",
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
      header: "Items Count",
      cell: (row) => (
        <span className="text-xs text-slate-600 font-mono">
          {row.items.reduce((s, it) => s + it.quantity, 0).toLocaleString("id-ID")} units ({row.items.length} SKUs)
        </span>
      ),
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
            <span className="text-[9px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full font-mono border border-purple-200 inline-block mt-0.5">
              &gt;10M (Owner Escalation)
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
            row.status === "received"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : row.status === "approved"
              ? "bg-blue-50 text-blue-700 border border-blue-200"
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
      header: "Kitchen Action",
      cell: (row) =>
        row.status === "approved" ? (
          <button
            type="button"
            onClick={() => receivePurchaseOrder(row.id, currentUser?.username || "ktc_budi")}
            className="px-3.5 py-1.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-[0.98] transition-all"
          >
            <PackageCheck className="w-3.5 h-3.5" />
            <span>Receive Stock</span>
          </button>
        ) : row.status === "received" ? (
          <span className="text-emerald-700 font-semibold text-xs flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" /> Stock Loaded
          </span>
        ) : (
          <span className="text-xs text-slate-400 font-medium">Pending Approval</span>
        ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-[0_10px_30px_rgba(45,61,110,0.05)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#2D3D6E] tracking-tight">Purchase Orders &amp; Receiving</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Kitchen restock requests and supplier receipt verification.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNewPOOpen(true)}
          className="bg-[#2D3D6E] hover:bg-[#1E293B] text-white text-xs font-bold px-6 py-3 rounded-full flex items-center gap-2 shadow-lg shadow-[#2D3D6E]/20 transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Create Draft PO</span>
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-[0_10px_30px_rgba(45,61,110,0.05)] space-y-4">
        <DataTable
          data={purchaseOrders}
          columns={columns}
          searchPlaceholder="Search PO ID or supplier..."
          searchKey="supplierName"
          pageSize={6}
        />
      </div>

      {/* CREATE DRAFT PO MODAL */}
      {isNewPOOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in select-none">
          <form
            onSubmit={handleCreatePOSubmit}
            className="w-full max-w-lg bg-white rounded-[32px] p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-lg text-[#2D3D6E]">Create Draft Purchase Order</h3>
                <p className="text-xs text-slate-500 font-medium">Prepared by @{currentUser?.username}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsNewPOOpen(false)}
                className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#2D3D6E] block mb-1.5">
                  Select Registered Supplier
                </label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => handleSupplierChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs font-semibold text-[#2D3D6E] bg-white focus:ring-2 focus:ring-[#2D3D6E]/20 focus:outline-hidden"
                >
                  {suppliers.map((sup) => (
                    <option key={sup.id} value={sup.id}>
                      {sup.name} ({sup.category}) • {sup.contactPerson}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1 font-mono">
                  Category: <strong className="text-[#2D3D6E]">{activeSupplier?.category}</strong> • Contact: {activeSupplier?.phone}
                </p>
              </div>

              {/* Line Items */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-[#2D3D6E]">
                    Order Items ({activeSupplier?.category})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="text-xs font-bold text-[#2D3D6E] hover:text-[#1C2646] flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {lineItems.map((line, idx) => (
                    <div key={idx} className="p-3 rounded-2xl border border-slate-100 bg-[#F6F8FC] flex items-center gap-2">
                      <select
                        value={line.itemId}
                        onChange={(e) => handleUpdateLine(idx, e.target.value, line.quantity)}
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-[#2D3D6E] bg-white"
                      >
                        {currentAvailableItems.map((it) => (
                          <option key={it.id} value={it.id}>
                            {it.itemName} ({it.unit}) - @{formatRupiah(it.costPerUnit)}
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        min={1}
                        value={line.quantity}
                        onChange={(e) => handleUpdateLine(idx, line.itemId, Number(e.target.value))}
                        className="w-20 px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs font-bold text-right text-[#2D3D6E] bg-white"
                      />

                      <span className="font-mono text-xs font-bold text-[#2D3D6E] w-24 text-right">
                        {formatRupiah(line.subtotal)}
                      </span>

                      {lineItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* PO Total & Automatic Authorization Routing */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#2D3D6E] text-white flex items-center justify-between font-mono shadow-md">
                <div>
                  <span className="text-[10px] text-slate-300 uppercase tracking-wider block font-semibold">
                    Estimated PO Total
                  </span>
                  <p className="text-lg font-bold text-white">{formatRupiah(totalCalculated)}</p>
                </div>
                <div className="text-right">
                  {isHighValue ? (
                    <span className="text-[10px] font-bold text-[#2D3D6E] bg-[#F0E79D] px-3 py-1 rounded-full inline-block">
                      Owner Authorization (&gt; 10M)
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-300 font-medium block">
                      Operations Manager Approval
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsNewPOOpen(false)}
                className="py-3 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-3 rounded-full bg-[#2D3D6E] hover:bg-[#1E293B] text-white text-xs font-bold shadow-lg shadow-[#2D3D6E]/20 transition-all active:scale-[0.98]"
              >
                Submit Draft PO
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
