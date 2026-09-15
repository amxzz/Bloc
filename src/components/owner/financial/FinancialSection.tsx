"use client";

import React from "react";
import { useCartStore } from "@/store/useCartStore";
import { formatRupiah } from "@/lib/utils/formatters";
import KpiCard from "@/components/common/ui/KpiCard";
import { SplineAreaChart, SplineDataPoint } from "@/components/common/ui/Charts";

export default function FinancialSection() {
  const { transactions } = useCartStore();

  const grossRevenue = transactions.reduce((sum, t) => sum + t.subtotalAmount, 0) || 48500000;
  const discounts = transactions.reduce((sum, t) => sum + t.discountAmount, 0) || 1250000;
  const netSales = grossRevenue - discounts;
  const cogs = Math.round(netSales * 0.32); // 32% COGS
  const grossProfit = netSales - cogs;
  const operatingExpenses = 14200000; // Labor, Utilities, Rent
  const netProfit = grossProfit - operatingExpenses;
  const netProfitMargin = Math.round((netProfit / netSales) * 100);

  // Financial Trend Data for Spline Area Chart
  const financialTrendData: SplineDataPoint[] = [
    { label: "Week 1", value: 8500000, secondaryValue: 2720000 },
    { label: "Week 2", value: 11200000, secondaryValue: 3584000 },
    { label: "Week 3", value: 9800000, secondaryValue: 3136000 },
    { label: "Week 4", value: 13400000, secondaryValue: 4288000 },
    { label: "Week 5", value: 15600000, secondaryValue: 4992000 },
  ];

  return (
    <div className="space-y-6 max-w-7xl select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-[0_10px_30px_rgba(45,61,110,0.05)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#2D3D6E] tracking-tight">
            Financial n&apos; P&amp;L Performance
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Monthly revenue breakdown, COGS, operating expenses, and net profit margins.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <KpiCard
          title="Net Sales Revenue"
          value={formatRupiah(netSales)}
          subtitle="After member discounts"
          variant="navy"
        />
        <KpiCard
          title="COGS (32%)"
          value={formatRupiah(cogs)}
          subtitle="Raw materials & packaging"
          variant="warning"
        />
        <KpiCard
          title="Operating Expenses"
          value={formatRupiah(operatingExpenses)}
          subtitle="Staff, utilities, and lease"
        />
        <KpiCard
          title="Net Operating Profit"
          value={formatRupiah(netProfit)}
          subtitle={`${netProfitMargin}% Net Margin`}
          variant="success"
          trend={{ value: "+8.4% vs last month", isUp: true }}
        />
      </div>

      {/* Financial Area Chart: Revenue vs COGS Trend */}
      <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-[0_10px_30px_rgba(45,61,110,0.05)]">
        <SplineAreaChart
          title="Revenue & COGS Trajectory (Current Month)"
          subtitle="Weekly sales velocity compared against raw material expenditure"
          data={financialTrendData}
          primaryLabel="Net Revenue"
          secondaryLabel="COGS (32%)"
          valueFormatter={(v) => formatRupiah(v)}
          height={220}
        />
      </div>

      {/* P&L Statement Card */}
      <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-[0_10px_30px_rgba(45,61,110,0.05)] space-y-5 font-mono text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-extrabold text-base text-[#2D3D6E] font-sans">Statement of Profit and Loss (P&amp;L)</h3>
          <span className="text-xs text-slate-400 font-medium font-sans">Period: Current Month</span>
        </div>

        <div className="space-y-4">
          {/* Revenue */}
          <div className="space-y-2">
            <div className="flex justify-between font-bold text-[#2D3D6E] text-sm">
              <span>Gross Sales Revenue</span>
              <span>{formatRupiah(grossRevenue)}</span>
            </div>
            <div className="flex justify-between text-rose-600 pl-4">
              <span>Less: Member Loyalty Discounts &amp; Promotions</span>
              <span>-{formatRupiah(discounts)}</span>
            </div>
            <div className="flex justify-between font-bold text-[#2D3D6E] pt-2 border-t border-slate-100">
              <span>Net Sales Revenue</span>
              <span>{formatRupiah(netSales)}</span>
            </div>
          </div>

          {/* COGS */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <div className="flex justify-between font-bold text-[#2D3D6E]">
              <span>Cost of Goods Sold (COGS)</span>
              <span className="text-rose-600">-{formatRupiah(cogs)}</span>
            </div>
            <div className="flex justify-between text-slate-500 pl-4">
              <span>- Raw Dairy, Flavor Purees &amp; Pastes (24%)</span>
              <span>{formatRupiah(Math.round(netSales * 0.24))}</span>
            </div>
            <div className="flex justify-between text-slate-500 pl-4">
              <span>- Packaging Cups, Cones &amp; Vaschetta (8%)</span>
              <span>{formatRupiah(Math.round(netSales * 0.08))}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-100 text-sm">
              <span>Gross Profit (Margin: 68%)</span>
              <span className="text-emerald-700">{formatRupiah(grossProfit)}</span>
            </div>
          </div>

          {/* Operating Expenses */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <div className="flex justify-between font-bold text-[#2D3D6E]">
              <span>Operating Expenses (OPEX)</span>
              <span className="text-rose-600">-{formatRupiah(operatingExpenses)}</span>
            </div>
            <div className="flex justify-between text-slate-500 pl-4">
              <span>- Store Staff &amp; Kitchen Operations Labor</span>
              <span>{formatRupiah(8500000)}</span>
            </div>
            <div className="flex justify-between text-slate-500 pl-4">
              <span>- Store Lease, Electricity &amp; Water</span>
              <span>{formatRupiah(4200000)}</span>
            </div>
            <div className="flex justify-between text-slate-500 pl-4">
              <span>- Maintenance, POS Cloud &amp; Consumables</span>
              <span>{formatRupiah(1500000)}</span>
            </div>
            <div className="flex justify-between font-bold text-sm text-[#2D3D6E] pt-3 border-t-2 border-slate-200">
              <span>Net Operating Income (EBIT)</span>
              <span className="text-emerald-700 font-bold">{formatRupiah(netProfit)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
