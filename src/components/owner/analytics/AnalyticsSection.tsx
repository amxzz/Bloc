"use client";

import React from "react";
import { HorizontalBarDiagram, BarChart } from "@/components/common/ui/Charts";
import { formatRupiah } from "@/lib/utils/formatters";

export default function AnalyticsSection() {
  const topFlavorsData = [
    { label: "Pistachio Bronte", sublabel: "Peanut & Nuts", value: 340, max: 350, formattedValue: "340 scoops (IDR 8.5M)" },
    { label: "Korean Strawberry Milk", sublabel: "Milk Series", value: 290, max: 350, formattedValue: "290 scoops (IDR 7.2M)" },
    { label: "Dark Chocolate", sublabel: "Chocolate Series", value: 275, max: 350, formattedValue: "275 scoops (IDR 6.8M)" },
    { label: "Kyoto Oici Matcha", sublabel: "Tea Series", value: 210, max: 350, formattedValue: "210 scoops (IDR 5.2M)" },
    { label: "Lotus Biscoff Speculoos", sublabel: "Dessert Series", value: 195, max: 350, formattedValue: "195 scoops (IDR 4.8M)" },
    { label: "Wild Mixed Berries", sublabel: "Dairy-Free Sorbetto", value: 160, max: 350, formattedValue: "160 scoops (IDR 4.0M)" },
  ];

  const hourlySalesData = [
    { label: "10:00", value: 650000 },
    { label: "12:00", value: 1850000 },
    { label: "14:00", value: 1400000 },
    { label: "16:00", value: 2900000 },
    { label: "18:00", value: 4600000 },
    { label: "20:00", value: 5800000 },
    { label: "21:30", value: 3200000 },
  ];

  return (
    <div className="space-y-6 max-w-7xl select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-[0_10px_30px_rgba(45,61,110,0.05)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#2D3D6E] tracking-tight">Sales Analytics & Flavor Performance</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Product popularity metrics, hourly traffic peaks, and series performance.
          </p>
        </div>
      </div>

      {/* 2-Column Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 6 Flavors Contribution */}
        <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-[0_10px_30px_rgba(45,61,110,0.05)]">
          <HorizontalBarDiagram
            title="Top Selling Gelato Flavors (Volume & Revenue)"
            subtitle="Ranked by total scoop orders in the last 30 days"
            data={topFlavorsData}
          />
        </div>

        {/* Hourly Rush Distribution */}
        <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-[0_10px_30px_rgba(45,61,110,0.05)]">
          <BarChart
            title="Hourly Sales Rush (Peak Traffic Analysis)"
            subtitle="Peak order volume occurs between 18:00 and 21:00"
            data={hourlySalesData}
            height={230}
            valueFormatter={(v) => formatRupiah(v)}
          />
        </div>
      </div>
    </div>
  );
}
