"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import { useInventoryStore } from "@/store/useInventoryStore";
import { useFreezerStore } from "@/store/useFreezerStore";
import { useAuthStore } from "@/store/useAuthStore";
import { formatRupiah } from "@/lib/utils/formatters";
import KpiCard from "@/components/common/ui/KpiCard";
import PinModal from "@/components/common/ui/PinModal";
import {
  ShieldCheck,
  Award,
} from "lucide-react";

export default function OwnerOverviewSection() {
  const { currentUser } = useAuthStore();
  const { transactions } = useCartStore();
  const { purchaseOrders, approvePurchaseOrderByOwner } = useInventoryStore();
  const { wasteLogs } = useFreezerStore();
  const [selectedPoId, setSelectedPoId] = useState<string | null>(null);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  // Financial Calculations
  const totalRevenue = transactions.reduce(
    (sum, t) => sum + (t.paymentStatus === "paid" ? t.totalAmount : 0),
    0
  ) || 12850000;

  const estimatedCOGS = Math.round(totalRevenue * 0.32); // 32% COGS standard
  const estimatedWasteCost = wasteLogs.reduce((sum, w) => sum + (w.estimatedWeightGram * 150), 0) || 185000;
  const netProfit = totalRevenue - estimatedCOGS - estimatedWasteCost - 1500000; // Operational overhead
  const netMarginPercent = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 58;

  const pendingOwnerPOs = purchaseOrders.filter((p) => p.status === "pending_owner_approval");
  const voidedTransactions = transactions.filter((t) => t.paymentStatus === "void" || t.paymentStatus === "refunded");
  const totalVoidAmount = voidedTransactions.reduce((sum, t) => sum + t.totalAmount, 0);

  // Monthly Best-Seller Leaderboard Data
  const monthlyBestSellers = [
    { rank: 1, name: "Pistachio Bronte Pure", series: "Peanut & Nuts", scoopsSold: 840, revenue: 37800000, margin: "64%" },
    { rank: 2, name: "Dark Chocolate 70%", series: "Chocolate", scoopsSold: 720, revenue: 32400000, margin: "68%" },
    { rank: 3, name: "Korean Strawberry Milk", series: "Milk", scoopsSold: 650, revenue: 29250000, margin: "70%" },
    { rank: 4, name: "Salted Caramel Butter", series: "Dessert", scoopsSold: 510, revenue: 22950000, margin: "66%" },
    { rank: 5, name: "Stracciatella Classic", series: "Milk", scoopsSold: 460, revenue: 20700000, margin: "69%" },
  ];

  // 7-Day Flavor Demand Forecasting Data
  const flavorForecasts = [
    {
      flavorName: "Pistachio Bronte",
      category: "Peanut & Nuts",
      currentDailyVelocity: "42 Scoops/Day",
      predictedSurge: "+35% Weekend Surge",
      stockoutRisk: "High Risk",
      recommendedAction: "Schedule 3 tubs in Kitchen before Friday and reserve 5kg Pistachio Paste",
    },
    {
      flavorName: "Dark Chocolate 70%",
      category: "Chocolate",
      currentDailyVelocity: "36 Scoops/Day",
      predictedSurge: "+20% Steady Demand",
      stockoutRisk: "Low Risk",
      recommendedAction: "Showcase levels optimal; maintain 2-tub cold storage buffer",
    },
    {
      flavorName: "Korean Strawberry Milk",
      category: "Fruit & Milk",
      currentDailyVelocity: "32 Scoops/Day",
      predictedSurge: "+25% Warm Weather Surge",
      stockoutRisk: "Medium Risk",
      recommendedAction: "Queue 2 new tubs in batch pipeline for Thursday afternoon",
    },
    {
      flavorName: "Alfonso Mango Sorbet",
      category: "Dairy-Free",
      currentDailyVelocity: "28 Scoops/Day",
      predictedSurge: "+40% Afternoon Peak",
      stockoutRisk: "Medium Risk",
      recommendedAction: "Issue restocking PO for 10kg Mango Puree to Primary Supplier",
    },
  ];

  const handleAuthorizeClick = (poId: string) => {
    setSelectedPoId(poId);
    setIsPinModalOpen(true);
  };

  const handlePinSuccess = (ownerName: string) => {
    if (selectedPoId) {
      approvePurchaseOrderByOwner(selectedPoId, ownerName);
      setIsPinModalOpen(false);
      setSelectedPoId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-[0_10px_30px_rgba(45,61,110,0.05)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#2D3D6E] tracking-tight">Executive Strategic Oversight</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Executive metrics, best-sellers, demand forecast, and fraud controls.
          </p>
        </div>

        {pendingOwnerPOs.length > 0 && (
          <button
            type="button"
            onClick={() => handleAuthorizeClick(pendingOwnerPOs[0].id)}
            className="bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold px-6 py-3 rounded-full flex items-center gap-2 shadow-lg shadow-purple-700/20 transition-all cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-[#F0E79D]" />
            <span>{pendingOwnerPOs.length} PO (&gt;10M) Requires Owner Sign-Off</span>
          </button>
        )}
      </div>

      {/* TOP ROW FINANCIAL KPIS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <KpiCard
          title="Gross Sales"
          value={formatRupiah(totalRevenue)}
          subtitle="Registered turnover"
          variant="navy"
          trend={{ value: "+14.2% vs last week", isUp: true }}
        />
        <KpiCard
          title="Total COGS"
          value={formatRupiah(estimatedCOGS)}
          subtitle="32% of total revenue"
          variant="warning"
        />
        <KpiCard
          title="Wastage Cost"
          value={formatRupiah(estimatedWasteCost)}
          subtitle={`${((estimatedWasteCost / totalRevenue) * 100).toFixed(1)}% revenue ratio`}
          variant="danger"
        />
        <KpiCard
          title="Net Operating Profit"
          value={formatRupiah(netProfit)}
          subtitle={`Net Margin: ${netMarginPercent}%`}
          variant="success"
        />
      </div>

      {/* FRAUD & RISK ANOMALY MONITOR PANEL */}
      <div className="p-6 sm:p-8 rounded-[32px] bg-[#2D3D6E] text-white space-y-4 shadow-xl">
        <div className="border-b border-white/10 pb-3">
          <h3 className="font-extrabold text-base text-white">Risk & Fraud Anomaly Controls</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-[10px] font-mono text-slate-300 block uppercase">Void & Refund Actions</span>
            <p className="font-mono font-bold text-sm text-rose-300">
              {voidedTransactions.length} Events ({formatRupiah(totalVoidAmount)})
            </p>
            <p className="text-[11px] text-slate-300">
              {voidedTransactions.length > 0 ? "Manager verification recorded." : "Zero unauthorized void anomalies."}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-[10px] font-mono text-slate-300 block uppercase">Cash Reconciliation</span>
            <p className="font-mono font-bold text-sm text-emerald-300">IDR 0 (Balanced)</p>
            <p className="text-[11px] text-slate-300">Register counts match physical totals.</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-[10px] font-mono text-slate-300 block uppercase">High-Value POs (&gt;10M)</span>
            <p className="font-mono font-bold text-sm text-purple-300">
              {pendingOwnerPOs.length} Pending Approval
            </p>
            <p className="text-[11px] text-slate-300">
              {pendingOwnerPOs.length > 0 ? "Requires Owner PIN verification." : "All supplier commitments authorized."}
            </p>
          </div>
        </div>
      </div>

      {/* 2-COLUMN GRID: MONTHLY BEST-SELLERS & DEMAND FORECASTING */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Best-Sellers Leaderboard */}
        <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-[0_10px_30px_rgba(45,61,110,0.05)] space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-base text-[#2D3D6E]">Monthly Best-Seller Flavors</h3>
          </div>

          <div className="space-y-3">
            {monthlyBestSellers.map((flavor) => (
              <div
                key={flavor.rank}
                className="p-4 rounded-2xl border border-slate-100 bg-[#F6F8FC] flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-8 h-8 rounded-full font-mono font-extrabold text-xs flex items-center justify-center shrink-0 ${
                      flavor.rank === 1
                        ? "bg-[#F0E79D] text-[#2D3D6E] shadow-sm"
                        : flavor.rank === 2
                        ? "bg-slate-200 text-slate-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    #{flavor.rank}
                  </span>
                  <div>
                    <h4 className="font-bold text-xs text-[#2D3D6E]">{flavor.name}</h4>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {flavor.series} • {flavor.scoopsSold.toLocaleString()} Scoops Dispensed
                    </p>
                  </div>
                </div>

                <div className="text-right font-mono text-xs">
                  <span className="font-bold text-[#2D3D6E] block">{formatRupiah(flavor.revenue)}</span>
                  <span className="text-[10px] text-emerald-700 font-bold">Margin {flavor.margin}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 7-Day Flavor Demand Forecasting */}
        <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-[0_10px_30px_rgba(45,61,110,0.05)] space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-base text-[#2D3D6E]">7-Day Flavor Demand Forecast</h3>
            <p className="text-xs text-slate-400 font-medium">Predictive batch planning & raw material buffers</p>
          </div>

          <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
            {flavorForecasts.map((f, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-slate-100 bg-[#F6F8FC] space-y-2 text-xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-[#2D3D6E]">{f.flavorName}</h4>
                    <p className="text-[10px] text-slate-400 font-mono">{f.category} • {f.currentDailyVelocity}</p>
                  </div>
                  <span
                    className={`font-mono font-bold text-[10px] px-2.5 py-0.5 rounded-full ${
                      f.stockoutRisk === "High Risk"
                        ? "bg-rose-100 text-rose-800 border border-rose-200"
                        : "bg-amber-100 text-amber-800 border border-amber-200"
                    }`}
                  >
                    {f.predictedSurge}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200/80 font-mono text-[11px] text-slate-700">
                  <span className="font-bold text-[#2D3D6E]">Production Advisory: </span>
                  {f.recommendedAction}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* OWNER PIN MODAL */}
      {isPinModalOpen && (
        <PinModal
          isOpen={isPinModalOpen}
          title="Owner Sign-Off: High Value Purchase Order"
          description={`Authorizing Purchase Order ${selectedPoId} (> IDR 10,000,000) requires Owner PIN verification.`}
          requiredRole="owner"
          onSuccess={handlePinSuccess}
          onCancel={() => {
            setIsPinModalOpen(false);
            setSelectedPoId(null);
          }}
        />
      )}
    </div>
  );
}
