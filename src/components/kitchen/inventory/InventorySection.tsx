"use client";

import React, { useState } from "react";
import { useInventoryStore } from "@/store/useInventoryStore";
import { useAuthStore } from "@/store/useAuthStore";
import { InventoryItem } from "@/types/inventory";
import { formatRupiah } from "@/lib/utils/formatters";
import DataTable, { Column } from "@/components/common/ui/DataTable";
import {
  Package,
  RefreshCw,
  ArrowRightLeft,
  X,
} from "lucide-react";

export default function InventorySection() {
  const { currentUser } = useAuthStore();
  const { items, adjustStock, transferToKitchen } = useInventoryStore();

  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [newStockQty, setNewStockQty] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState("");
  const [transferQty, setTransferQty] = useState<number>(10);

  const categories = ["All", "packaging", "raw_material", "topping", "sauce"];

  const filteredItems = items.filter(
    (item) => activeCategory === "All" || item.category === activeCategory
  );

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    adjustStock(selectedItem.id, newStockQty, adjustReason || "Stock Opname Audit", currentUser?.username || "ktc_budi");
    setIsAdjustOpen(false);
    setSelectedItem(null);
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    transferToKitchen(selectedItem.id, transferQty, currentUser?.username || "ktc_budi");
    setIsTransferOpen(false);
    setSelectedItem(null);
  };

  const columns: Column<InventoryItem>[] = [
    {
      header: "Item Code",
      accessorKey: "itemCode",
      cell: (row) => (
        <span className="font-mono font-bold text-xs text-[#2D3D6E] block">{row.itemCode}</span>
      ),
    },
    {
      header: "Item Name",
      accessorKey: "itemName",
      cell: (row) => (
        <div>
          <span className="font-bold text-xs text-[#2D3D6E] block">{row.itemName}</span>
          <span className="text-[10px] text-slate-400 font-mono capitalize">{row.category.replace("_", " ")}</span>
        </div>
      ),
    },
    {
      header: "Current Stock",
      accessorKey: "currentStock",
      cell: (row) => {
        const isLow = row.currentStock <= row.minRestockThreshold;
        return (
          <div className="flex items-center gap-2">
            <span className={`font-mono font-bold text-xs ${isLow ? "text-rose-700" : "text-[#2D3D6E]"}`}>
              {row.currentStock.toLocaleString("id-ID")} {row.unit}
            </span>
            {isLow && (
              <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[9px] font-bold border border-rose-200">
                LOW
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: "Min Threshold",
      accessorKey: "minRestockThreshold",
      cell: (row) => (
        <span className="font-mono text-xs text-slate-500">
          {row.minRestockThreshold} {row.unit}
        </span>
      ),
    },
    {
      header: "Unit Cost",
      accessorKey: "costPerUnit",
      cell: (row) => (
        <span className="font-mono text-xs text-slate-700 font-semibold">{formatRupiah(row.costPerUnit)}</span>
      ),
    },
    {
      header: "Supplier",
      accessorKey: "supplierName",
      cell: (row) => <span className="text-xs text-slate-600">{row.supplierName || "-"}</span>,
    },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            title="Stock Opname Adjust"
            onClick={() => {
              setSelectedItem(row);
              setNewStockQty(row.currentStock);
              setIsAdjustOpen(true);
            }}
            className="px-3 py-1.5 rounded-full border border-slate-200 text-[#2D3D6E] hover:bg-slate-50 text-xs font-bold transition-all flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Adjust</span>
          </button>
          <button
            type="button"
            title="Transfer to Kitchen"
            onClick={() => {
              setSelectedItem(row);
              setTransferQty(10);
              setIsTransferOpen(true);
            }}
            className="px-3 py-1.5 rounded-full bg-[#2D3D6E] hover:bg-[#1E293B] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1 active:scale-[0.98]"
          >
            <ArrowRightLeft className="w-3 h-3" />
            <span>Transfer</span>
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
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#2D3D6E] tracking-tight">Raw & Packaging Inventory</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Real-time stock tracking for dairy bases, flavor purees, packaging cups, and toppings.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1 bg-[#F6F8FC] p-1.5 rounded-full border border-slate-100 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold capitalize transition-all ${
                activeCategory === cat
                  ? "bg-[#2D3D6E] text-white shadow-md shadow-[#2D3D6E]/20"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {cat.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-[0_10px_30px_rgba(45,61,110,0.05)] space-y-4">
        <DataTable
          data={filteredItems}
          columns={columns}
          searchPlaceholder="Search SKU code or item name..."
          searchKey="itemName"
          pageSize={8}
        />
      </div>

      {/* STOCK ADJUST MODAL */}
      {isAdjustOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in select-none">
          <form
            onSubmit={handleAdjustSubmit}
            className="w-full max-w-md bg-white rounded-[32px] p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-lg text-[#2D3D6E]">Stock Opname Adjustment</h3>
                <p className="text-xs text-slate-500 font-medium">Reconcile physical inventory count</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAdjustOpen(false)}
                className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#F6F8FC] border border-slate-100 text-xs">
              <p className="font-bold text-[#2D3D6E]">{selectedItem.itemName}</p>
              <p className="font-mono text-slate-500 mt-0.5">Current Recorded: {selectedItem.currentStock} {selectedItem.unit}</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#2D3D6E] block mb-1.5">
                  Actual Counted Quantity ({selectedItem.unit})
                </label>
                <input
                  type="number"
                  required
                  value={newStockQty}
                  onChange={(e) => setNewStockQty(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 font-mono text-xs font-bold text-[#2D3D6E] text-right focus:outline-hidden focus:ring-2 focus:ring-[#2D3D6E]/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#2D3D6E] block mb-1.5">Reason for Adjustment</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Physical count discrepancy, damage..."
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs font-medium text-[#2D3D6E] focus:outline-hidden focus:ring-2 focus:ring-[#2D3D6E]/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAdjustOpen(false)}
                className="py-3 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-3 rounded-full bg-[#2D3D6E] hover:bg-[#1E293B] text-white text-xs font-bold shadow-lg shadow-[#2D3D6E]/20 transition-all active:scale-[0.98]"
              >
                Save Adjustment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TRANSFER TO KITCHEN MODAL */}
      {isTransferOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in select-none">
          <form
            onSubmit={handleTransferSubmit}
            className="w-full max-w-md bg-white rounded-[32px] p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-lg text-[#2D3D6E]">Transfer to Production Floor</h3>
                <p className="text-xs text-slate-500 font-medium">Issue material from warehouse</p>
              </div>
              <button
                type="button"
                onClick={() => setIsTransferOpen(false)}
                className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              Transfer <strong>{selectedItem.itemName}</strong> from main warehouse storage to the active kitchen line.
            </p>

            <div>
              <label className="text-xs font-bold text-[#2D3D6E] block mb-1.5">
                Transfer Quantity ({selectedItem.unit})
              </label>
              <input
                type="number"
                min={1}
                max={selectedItem.currentStock}
                required
                value={transferQty}
                onChange={(e) => setTransferQty(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 font-mono text-xs font-bold text-[#2D3D6E] text-right focus:outline-hidden focus:ring-2 focus:ring-[#2D3D6E]/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsTransferOpen(false)}
                className="py-3 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-3 rounded-full bg-[#2D3D6E] hover:bg-[#1E293B] text-white text-xs font-bold shadow-lg shadow-[#2D3D6E]/20 transition-all active:scale-[0.98]"
              >
                Confirm Transfer
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
