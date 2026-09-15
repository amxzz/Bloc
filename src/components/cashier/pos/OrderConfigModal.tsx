"use client";

import React, { useState, useEffect } from "react";
import { PACKAGING_OPTIONS } from "@/lib/constants/packagingData";
import { TOPPING_OPTIONS, SAUCE_OPTIONS } from "@/lib/constants/addonData";
import { GELATO_FLAVORS } from "@/lib/constants/gelatoData";
import { PackagingOption, ToppingOption, SauceOption, CartItemFlavor } from "@/types/cashier";
import { ShowcaseSlot, GelatoFlavor } from "@/types/kitchen";
import { formatRupiah } from "@/lib/utils/formatters";
import { useNotificationStore } from "@/store/useNotificationStore";
import { X, Check, Plus, AlertCircle } from "lucide-react";

interface OrderConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFlavor?: ShowcaseSlot | GelatoFlavor | null;
  activeShowcaseSlots: ShowcaseSlot[];
  onAddToCart: (
    packaging: PackagingOption,
    flavors: CartItemFlavor[],
    toppings: ToppingOption[],
    sauces: SauceOption[]
  ) => void;
}

export default function OrderConfigModal({
  isOpen,
  onClose,
  initialFlavor,
  activeShowcaseSlots,
  onAddToCart,
}: OrderConfigModalProps) {
  const { showToast } = useNotificationStore();
  const [selectedPackaging, setSelectedPackaging] = useState<PackagingOption>(PACKAGING_OPTIONS[1]); // Default Medio (2 scoops)
  const [selectedFlavors, setSelectedFlavors] = useState<CartItemFlavor[]>([]);
  const [selectedToppings, setSelectedToppings] = useState<ToppingOption[]>([]);
  const [selectedSauces, setSelectedSauces] = useState<SauceOption[]>([]);
  const [flavorSearch, setFlavorSearch] = useState("");

  // Initialize selected flavor when opened with a clicked card
  useEffect(() => {
    if (initialFlavor) {
      const isSlot = "slotNumber" in initialFlavor || "freezerGroup" in initialFlavor;
      const rawFlavorId = isSlot
        ? (initialFlavor as ShowcaseSlot).flavorId || (initialFlavor as ShowcaseSlot).id
        : (initialFlavor as GelatoFlavor).id;
      const rawFlavorName = isSlot
        ? (initialFlavor as ShowcaseSlot).flavorName
        : (initialFlavor as GelatoFlavor).name;
      const series = initialFlavor.series || "Milk";

      // Match against available active showcase slots
      const matchingSlot = activeShowcaseSlots.find(
        (s) =>
          (s.flavorId === rawFlavorId ||
            s.id === rawFlavorId ||
            (s.flavorName && rawFlavorName && s.flavorName.toLowerCase() === rawFlavorName.toLowerCase())) &&
          s.status !== "EMPTY" &&
          s.status !== "EXPIRED" &&
          s.currentGrams > 0 &&
          s.daysOpen < 8
      );

      if (matchingSlot && matchingSlot.flavorId && matchingSlot.flavorName) {
        setSelectedFlavors([
          {
            flavorId: matchingSlot.flavorId,
            flavorName: matchingSlot.flavorName,
            series: matchingSlot.series || series,
            scoops: 1,
          },
        ]);
      } else {
        setSelectedFlavors([]);
      }
    } else {
      setSelectedFlavors([]);
    }
    setSelectedToppings([]);
    setSelectedSauces([]);
  }, [initialFlavor, activeShowcaseSlots, isOpen]);

  if (!isOpen) return null;

  const handleToggleFlavor = (slot: ShowcaseSlot) => {
    if (!slot.flavorId || !slot.flavorName || slot.status === "EMPTY" || slot.status === "EXPIRED" || slot.currentGrams <= 0) {
      return;
    }

    const existingIdx = selectedFlavors.findIndex(
      (f) =>
        f.flavorId === slot.flavorId ||
        f.flavorId === slot.id ||
        (f.flavorName && slot.flavorName && f.flavorName.toLowerCase() === slot.flavorName.toLowerCase())
    );

    if (existingIdx > -1) {
      setSelectedFlavors((prev) => prev.filter((_, idx) => idx !== existingIdx));
    } else {
      const newFlavorEntry: CartItemFlavor = {
        flavorId: slot.flavorId,
        flavorName: slot.flavorName,
        series: slot.series || "Milk",
        scoops: 1,
      };

      if (selectedFlavors.length >= selectedPackaging.maxScoops) {
        const updated =
          selectedPackaging.maxScoops === 1
            ? [newFlavorEntry]
            : [...selectedFlavors.slice(1), newFlavorEntry];
        setSelectedFlavors(updated);
      } else {
        setSelectedFlavors((prev) => [...prev, newFlavorEntry]);
      }
    }
  };

  const handlePackagingSelect = (pkg: PackagingOption) => {
    setSelectedPackaging(pkg);
    if (selectedFlavors.length > pkg.maxScoops) {
      setSelectedFlavors(selectedFlavors.slice(0, pkg.maxScoops));
    }
  };

  const calculateItemTotal = () => {
    const toppingsTotal = selectedToppings.reduce((sum, t) => sum + t.price, 0);
    const saucesTotal = selectedSauces.reduce((sum, s) => sum + s.price, 0);
    return selectedPackaging.price + toppingsTotal + saucesTotal;
  };

  const handleSubmit = () => {
    if (selectedFlavors.length === 0) {
      showToast("Flavor Selection Required", "Please select at least 1 gelato flavor to proceed.", "WARNING");
      return;
    }

    onAddToCart(selectedPackaging, selectedFlavors, selectedToppings, selectedSauces);
    onClose();
  };

  const availableSlots = activeShowcaseSlots.filter(
    (slot) =>
      Boolean(slot.flavorName) &&
      slot.status !== "EMPTY" &&
      slot.status !== "EXPIRED" &&
      slot.currentGrams > 0 &&
      slot.daysOpen < 8
  );

  const filteredSlots = availableSlots.filter((slot) => {
    if (!slot.flavorName) return false;
    if (!flavorSearch) return true;
    const q = flavorSearch.toLowerCase();
    return (
      slot.flavorName.toLowerCase().includes(q) ||
      (slot.series && slot.series.toLowerCase().includes(q)) ||
      slot.id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 select-none animate-in fade-in">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#7F85D1] bg-[#7F85D1]/10 px-2 py-0.5 rounded-full">
                Order Configurator
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-1">Configure Gelato Serving</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* STEP 1: PACKAGING SELECTION */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                1. Select Packaging & Size
              </label>
              <span className="text-[11px] font-bold text-slate-500 font-mono">
                Max {selectedPackaging.maxScoops} Scoop{selectedPackaging.maxScoops > 1 ? "s" : ""}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PACKAGING_OPTIONS.map((pkg) => {
                const isSelected = selectedPackaging.id === pkg.id;
                return (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => handlePackagingSelect(pkg)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? "border-[#2D3D6E] bg-[#2D3D6E]/5 ring-2 ring-[#2D3D6E] shadow-2xs"
                        : "border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                        {pkg.category}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-mono">
                        {pkg.maxScoops} scp
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-slate-900 truncate">{pkg.name}</h4>
                    <p className="font-mono text-xs font-bold text-[#2D3D6E] mt-1">
                      {formatRupiah(pkg.price)}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: FLAVOR SELECTION */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                2. Select Gelato Flavors ({selectedFlavors.length}/{selectedPackaging.maxScoops})
              </label>
              <input
                type="text"
                placeholder="Filter available flavors..."
                value={flavorSearch}
                onChange={(e) => setFlavorSearch(e.target.value)}
                className="px-2.5 py-1 text-[11px] rounded-lg border border-slate-200 font-medium w-44 focus:outline-hidden focus:ring-1 focus:ring-[#2D3D6E]"
              />
            </div>

            {filteredSlots.length === 0 ? (
              <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-xs font-semibold text-slate-600">No available flavors found</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {flavorSearch
                    ? "Try adjusting your search query."
                    : "No tubs currently in stock in the showcase freezer."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[190px] overflow-y-auto pr-1">
                {filteredSlots.map((slot) => {
                  const isSelected = selectedFlavors.some(
                    (f) =>
                      f.flavorId === slot.flavorId ||
                      f.flavorId === slot.id ||
                      (f.flavorName && slot.flavorName && f.flavorName.toLowerCase() === slot.flavorName.toLowerCase())
                  );
                  const flavorMeta = GELATO_FLAVORS.find((f) => f.id === slot.flavorId);

                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => handleToggleFlavor(slot)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all relative ${
                        isSelected
                          ? "border-[#2D3D6E] bg-[#2D3D6E]/5 ring-2 ring-[#2D3D6E] font-bold text-[#2D3D6E]"
                          : "border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] font-mono text-slate-400">Slot {slot.id}</span>
                        <span className="text-[9px] font-mono text-emerald-600 font-bold">{slot.currentGrams}g</span>
                      </div>
                      <div className="font-bold text-slate-900 truncate">{slot.flavorName}</div>
                      <div className="text-[10px] text-slate-500 truncate">{slot.series}</div>

                      {flavorMeta?.allergens && flavorMeta.allergens.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {flavorMeta.allergens.slice(0, 2).map((a) => (
                            <span key={a} className="text-[8px] px-1 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200/60">
                              {a}
                            </span>
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* STEP 3: TOPPINGS & SAUCES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Toppings */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                3. Add Toppings (Optional)
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {TOPPING_OPTIONS.map((top) => {
                  const isSelected = selectedToppings.some((t) => t.id === top.id);
                  return (
                    <button
                      key={top.id}
                      type="button"
                      onClick={() =>
                        setSelectedToppings((prev) =>
                          isSelected ? prev.filter((t) => t.id !== top.id) : [...prev, top]
                        )
                      }
                      className={`p-2 rounded-xl border text-left text-xs transition-all ${
                        isSelected
                          ? "border-[#2D3D6E] bg-[#2D3D6E]/5 font-bold text-[#2D3D6E]"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="truncate">{top.name}</div>
                      <div className="text-[10px] font-mono text-slate-500 font-semibold">
                        +{formatRupiah(top.price)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sauces */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                4. Add Sauces (Optional)
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {SAUCE_OPTIONS.map((sauce) => {
                  const isSelected = selectedSauces.some((s) => s.id === sauce.id);
                  return (
                    <button
                      key={sauce.id}
                      type="button"
                      onClick={() =>
                        setSelectedSauces((prev) =>
                          isSelected ? prev.filter((s) => s.id !== sauce.id) : [...prev, sauce]
                        )
                      }
                      className={`p-2 rounded-xl border text-left text-xs transition-all ${
                        isSelected
                          ? "border-[#2D3D6E] bg-[#2D3D6E]/5 font-bold text-[#2D3D6E]"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="truncate">{sauce.name}</div>
                      <div className="text-[10px] font-mono text-slate-500 font-semibold">
                        +{formatRupiah(sauce.price)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-500 block">Calculated Item Total:</span>
            <span className="font-mono text-base font-extrabold text-[#2D3D6E]">
              {formatRupiah(calculateItemTotal())}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={selectedFlavors.length === 0}
              onClick={handleSubmit}
              className="px-6 py-2.5 rounded-xl bg-[#2D3D6E] hover:bg-[#1B2544] text-white text-xs font-bold shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add to Order</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
