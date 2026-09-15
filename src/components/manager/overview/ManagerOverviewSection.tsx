"use client";

import React from "react";
import Link from "next/link";
import { useInventoryStore } from "@/store/useInventoryStore";
import { useCartStore } from "@/store/useCartStore";
import { useAuditStore } from "@/store/useAuditStore";
import { useFreezerStore } from "@/store/useFreezerStore";
import KpiCard from "@/components/common/ui/KpiCard";
import { SplineAreaChart, SplineDataPoint } from "@/components/common/ui/Charts";
import { formatRupiah } from "@/lib/utils/formatters";
import {
  CheckSquare,
  ArrowRight,
  AlertTriangle,
  Package,
  Trash2,
  CheckCircle2,
} from "lucide-react";

export default function ManagerOverviewSection() {
  const { purchaseOrders, items: inventoryItems } = useInventoryStore();
  const { transactions } = useCartStore();
  const { logs } = useAuditStore();
  const { slots, wasteLogs } = useFreezerStore();

  const pendingManagerPOs = purchaseOrders.filter((p) => p.status === "pending_manager_approval");
  const pendingOwnerPOs = purchaseOrders.filter((p) => p.status === "pending_owner_approval");
  const todayTotalRevenue = transactions.reduce((sum, t) => sum + (t.paymentStatus === "paid" ? t.totalAmount : 0), 0);

  // Operational Critical Indicators
  const criticalTubs = slots.filter((s) => s.status === "CRITICAL" || s.status === "EMPTY");
  const lowStockItems = inventoryItems.filter((i) => i.currentStock <= i.minRestockThreshold);
  const totalWasteGrams = wasteLogs.reduce((sum, w) => sum + w.estimatedWeightGram, 0);
  const estimatedWasteCost = (totalWasteGrams / 1000) * 45000; // Average cost ~Rp 45k/kg

  // 7-Day Daily Revenue vs Sales Target (Operational Store Performance)
  const weeklyRevenueTargetData: SplineDataPoint[] = [
    { label: "Mon", value: 6800000, secondaryValue: 6500000 },
    { label: "Tue", value: 6200000, secondaryValue: 6500000 },
    { label: "Wed", value: 7900000, secondaryValue: 7000000 },
    { label: "Thu", value: 7400000, secondaryValue: 7000000 },
    { label: "Fri", value: 12800000, secondaryValue: 11000000 },
    { label: "Sat", value: 17500000, secondaryValue: 15000000 },
    { label: "Sun", value: 19200000, secondaryValue: 16000000 },
  ];

  return (
    <div className="space-y-6 max-w-7xl select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-[0_10px_30px_rgba(45,61,110,0.05)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#2D3D6E] tracking-tight">Manager Overview</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Daily sales targets, shift operations pacing, procurement approvals, and critical store controls.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/manager/approvals"
            className="bg-[#2D3D6E] hover:bg-[#1E293B] text-white text-xs font-bold px-6 py-3 rounded-full flex items-center gap-2 shadow-lg shadow-[#2D3D6E]/20 transition-all active:scale-[0.98] cursor-pointer"
          >
            <CheckSquare className="w-4 h-4 text-[#F0E79D]" />
            <span>Approvals Inbox ({pendingManagerPOs.length})</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <KpiCard
          title="Today's Gross Sales"
          value={formatRupiah(todayTotalRevenue)}
          subtitle={`${transactions.length} registered orders`}
          variant="success"
        />
        <KpiCard
          title="Pending PO Approvals"
          value={pendingManagerPOs.length}
          subtitle="Awaiting Manager authorization"
          variant={pendingManagerPOs.length > 0 ? "warning" : "default"}
        />
        <KpiCard
          title="Critical Stock Alerts"
          value={criticalTubs.length + lowStockItems.length}
          subtitle={`${criticalTubs.length} tubs • ${lowStockItems.length} raw ingredients`}
          variant={criticalTubs.length + lowStockItems.length > 0 ? "danger" : "default"}
        />
        <KpiCard
          title="High-Value POs (>10M)"
          value={pendingOwnerPOs.length}
          subtitle="Escalated to Executive Owner"
          variant={pendingOwnerPOs.length > 0 ? "warning" : "default"}
        />
      </div>

      {/* Visual Chart: Daily Sales Revenue vs Store Target (7-Day Performance) */}
      <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-[0_10px_30px_rgba(45,61,110,0.05)]">
        <SplineAreaChart
          data={weeklyRevenueTargetData}
          title="Daily Sales Revenue vs Target (7-Day Performance)"
          subtitle="Realized gross daily revenue compared against operational store sales targets"
          primaryLabel="Actual Sales (IDR)"
          secondaryLabel="Daily Target (IDR)"
          valueFormatter={(val) => `Rp ${(val / 1000000).toFixed(1)}M`}
          height={240}
        />
      </div>

      {/* Operational Health & Vital Controls Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Showcase Stock Status */}
        <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-[0_10px_30px_rgba(45,61,110,0.03)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
              criticalTubs.length > 0 ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
            }`}>
              {criticalTubs.length > 0 ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Showcase Freezer Stock</p>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                {criticalTubs.length > 0 ? `${criticalTubs.length} slots critical (<20%)` : "All 48 display slots healthy"}
              </p>
            </div>
          </div>
          <Link
            href="/kitchen/showcase"
            className="p-2 rounded-xl text-slate-400 hover:text-[#2D3D6E] hover:bg-slate-100 transition-colors"
            title="Inspect Showcase"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Raw Ingredient Inventory */}
        <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-[0_10px_30px_rgba(45,61,110,0.03)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
              lowStockItems.length > 0 ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
            }`}>
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Raw Ingredients Stock</p>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                {lowStockItems.length > 0 ? `${lowStockItems.length} items below minimum` : "All ingredients sufficient"}
              </p>
            </div>
          </div>
          <Link
            href="/kitchen/inventory"
            className="p-2 rounded-xl text-slate-400 hover:text-[#2D3D6E] hover:bg-slate-100 transition-colors"
            title="View Inventory"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Waste & Spillage Cost Ratio */}
        <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-[0_10px_30px_rgba(45,61,110,0.03)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Waste & Spillage Index</p>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                {wasteLogs.length} logs • {formatRupiah(estimatedWasteCost)} est. cost
              </p>
            </div>
          </div>
          <Link
            href="/kitchen/waste"
            className="p-2 rounded-xl text-slate-400 hover:text-[#2D3D6E] hover:bg-slate-100 transition-colors"
            title="Inspect Waste"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* 2-Column Grid: Pending Approvals & Recent Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Pending Approvals Preview */}
        <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-[0_10px_30px_rgba(45,61,110,0.05)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-base text-[#2D3D6E]">Pending Purchase Orders</h3>
            <Link
              href="/manager/approvals"
              className="text-xs font-bold text-[#2D3D6E] hover:text-[#1C2646] flex items-center gap-1"
            >
              <span>View Full Inbox</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {pendingManagerPOs.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs font-medium">
                No pending Manager approvals in queue.
              </div>
            ) : (
              pendingManagerPOs.map((po) => (
                <div
                  key={po.id}
                  className="p-4 rounded-2xl border border-amber-200 bg-amber-50/40 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-[#2D3D6E]">{po.id}</span>
                      <h4 className="font-bold text-xs text-slate-900">{po.supplierName}</h4>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {formatRupiah(po.totalCost)} • By @{po.createdBy}
                    </p>
                  </div>
                  <Link
                    href="/manager/approvals"
                    className="px-4 py-2 rounded-full bg-[#2D3D6E] hover:bg-[#1E293B] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                  >
                    Authorize
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Recent Audit Activities */}
        <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-[0_10px_30px_rgba(45,61,110,0.05)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-base text-[#2D3D6E]">Recent Audit Trail</h3>
            <Link
              href="/manager/audits"
              className="text-xs font-bold text-[#2D3D6E] hover:text-[#1C2646] flex items-center gap-1"
            >
              <span>View All Logs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 max-h-[320px] overflow-y-auto pr-1">
            {logs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="py-3 px-2 hover:bg-slate-50/80 transition-colors flex items-start justify-between gap-3 text-xs rounded-xl"
              >
                <div className="space-y-0.5 min-w-0">
                  <p className="text-slate-800 font-semibold text-xs leading-snug truncate">
                    {log.details}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                    <span className="font-bold text-[#2D3D6E] uppercase">
                      {log.actionType.replace(/_/g, " ")}
                    </span>
                    <span>•</span>
                    <span>@{log.performedBy} ({log.role})</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-mono shrink-0 whitespace-nowrap pt-0.5">
                  {log.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
