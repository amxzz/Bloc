"use client";

import React, { useState } from "react";
import { GELATO_SERIES, GELATO_FLAVORS } from "@/lib/constants/gelatoData";
import { GELATO_SERIES_META } from "@/lib/firebase/seedData";
import { useNotificationStore } from "@/store/useNotificationStore";
import { ShowcaseSlot, GelatoFlavor } from "@/types/kitchen";
import { Search, Plus, AlertCircle, CheckCircle2 } from "lucide-react";

interface CatalogSectionProps {
  activeShowcaseFlavors: ShowcaseSlot[];
  onOpenConfigurator: (flavor?: ShowcaseSlot | GelatoFlavor) => void;
}

export default function CatalogSection({
  activeShowcaseFlavors,
  onOpenConfigurator,
}: CatalogSectionProps) {
  const { showToast } = useNotificationStore();
  const [activeSeriesTab, setActiveSeriesTab] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Map showcase slots by flavorId or flavorName for fast lookup
  const slotMap = new Map<string, ShowcaseSlot>();
  for (const slot of activeShowcaseFlavors) {
    if (slot.flavorId) {
      slotMap.set(slot.flavorId, slot);
    }
  }

  // Combine flavor database with live showcase status
  const allCatalogFlavors = GELATO_FLAVORS.map((flavor) => {
    const matchingSlot = slotMap.get(flavor.id) || activeShowcaseFlavors.find((s) => s.flavorName === flavor.name);
    const currentGrams = matchingSlot ? matchingSlot.currentGrams : 0;
    const isSlotExpired = matchingSlot ? matchingSlot.daysOpen >= 8 || matchingSlot.status === "EXPIRED" : false;
    const isOutOfStock = !matchingSlot || currentGrams <= 0 || matchingSlot.status === "EMPTY" || isSlotExpired;
    const isLowStock = !isOutOfStock && currentGrams < 500;

    return {
      flavor,
      slot: matchingSlot,
      currentGrams,
      isOutOfStock,
      isLowStock,
      slotNumber: matchingSlot?.id,
    };
  });

  const filteredFlavors = allCatalogFlavors.filter(({ flavor, slotNumber }) => {
    const matchesSeries = activeSeriesTab === "All" || flavor.series === activeSeriesTab;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      flavor.name.toLowerCase().includes(query) ||
      flavor.series.toLowerCase().includes(query) ||
      (slotNumber && slotNumber.toLowerCase().includes(query)) ||
      (flavor.description && flavor.description.toLowerCase().includes(query));

    return matchesSeries && matchesSearch;
  });

  return (
    <div className="space-y-4 select-none">
      {/* Catalog Header Bar: Category Filter + Search + Custom Order Button */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono font-bold text-[#7F85D1] uppercase tracking-widest bg-[#7F85D1]/10 px-2.5 py-0.5 rounded-full">
              Gelato Flavor Catalog
            </span>
            <h2 className="text-base font-bold text-slate-900 mt-1">Gelato Flavors & Tubs</h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search flavor, series, slot..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#2D3D6E] focus:outline-hidden"
              />
            </div>

            {/* Custom Build Order Button */}
            <button
              type="button"
              onClick={() => onOpenConfigurator()}
              className="bg-[#2D3D6E] hover:bg-[#1B2544] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#F0E79D]" />
              <span>Custom Order</span>
            </button>
          </div>
        </div>

        {/* All 9 Series Filter Tabs with Pastel Accents */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          {GELATO_SERIES.map((series) => {
            const isSelected = activeSeriesTab === series;
            const meta = GELATO_SERIES_META[series];

            return (
              <button
                key={series}
                type="button"
                onClick={() => setActiveSeriesTab(series)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#2D3D6E] text-white shadow-2xs font-extrabold"
                    : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/80"
                }`}
              >
                {series}
              </button>
            );
          })}
        </div>
      </div>

      {/* Gelato Flavors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredFlavors.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-slate-200/80 text-slate-400 space-y-1">
            <p className="text-sm font-semibold">No gelato flavors match your filter.</p>
            <p className="text-xs text-slate-400">Try changing the series tab or search term.</p>
          </div>
        ) : (
          filteredFlavors.map(({ flavor, slot, currentGrams, isOutOfStock, isLowStock }) => {
            const seriesMeta = GELATO_SERIES_META[flavor.series || "Milk"];

            return (
              <div
                key={flavor.id}
                onClick={() => {
                  if (isOutOfStock) {
                    showToast(
                      "Flavor Unavailable",
                      `The flavor "${flavor.name}" is currently empty or not loaded in the showcase freezer.`,
                      "WARNING"
                    );
                    return;
                  }
                  onOpenConfigurator(slot || flavor);
                }}
                className={`p-4 rounded-3xl border transition-all flex flex-col justify-between ${
                  isOutOfStock
                    ? "bg-slate-50/60 border-slate-200/60 opacity-60 cursor-not-allowed select-none"
                    : "bg-white border-slate-200/90 hover:border-[#2D3D6E] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                }`}
              >
                <div>
                  {/* Top Bar: Series Badge + Slot Pill + Live Stock Status */}
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-lg border ${
                          seriesMeta
                            ? `${seriesMeta.badgeBg} ${seriesMeta.badgeText} ${seriesMeta.borderColor}`
                            : "bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        {flavor.series}
                      </span>
                      {slot && (
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                          {slot.id}
                        </span>
                      )}
                    </div>

                    {/* Stock Status Tag */}
                    {isOutOfStock ? (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-600">
                        Out of Stock
                      </span>
                    ) : isLowStock ? (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span>Low Stock</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>In Stock</span>
                      </span>
                    )}
                  </div>

                  {/* Flavor Name & Best Seller badge */}
                  <div className="flex items-center gap-1.5">
                    <h3
                      className={`font-bold text-sm truncate leading-snug ${
                        isOutOfStock ? "text-slate-400" : "text-[#2D3D6E]"
                      }`}
                    >
                      {flavor.name}
                    </h3>
                    {flavor.isBestSeller && (
                      <span className="text-[9px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-[#F0E79D] text-[#2D3D6E]">
                        Best
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-[11px] text-slate-500 font-medium line-clamp-2 mt-1 leading-relaxed">
                    {flavor.description || `${flavor.series} handcrafted gelato base.`}
                  </p>

                  {/* Allergen Chips (Filter out series duplicates) */}
                  {flavor.allergens &&
                    flavor.allergens.filter(
                      (alg) => alg.toLowerCase() !== flavor.series.toLowerCase()
                    ).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2.5">
                        {flavor.allergens
                          .filter((alg) => alg.toLowerCase() !== flavor.series.toLowerCase())
                          .map((alg) => (
                            <span
                              key={alg}
                              className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium"
                            >
                              {alg}
                            </span>
                          ))}
                      </div>
                    )}
                </div>

                {/* Card Footer: Live Remaining Grams Indicator */}
                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-mono font-bold text-slate-700">
                      {currentGrams > 0 ? `${currentGrams.toLocaleString("id-ID")}g` : "0g"}
                    </span>
                  </div>

                  {/* Minimal Status Icon */}
                  {!isOutOfStock && (
                    <div className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-[#2D3D6E] flex items-center justify-center text-slate-600 transition-colors">
                      <Plus className="w-3 h-3 text-[#2D3D6E]" />
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
