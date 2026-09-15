"use client";

import React, { useState } from "react";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { formatRupiah } from "@/lib/utils/formatters";
import {
  RotateCcw,
  CheckCircle,
} from "lucide-react";

export default function SettingsSection() {
  const { currentUser } = useAuthStore();
  const { settings, updateSettings, resetToDefaults } = useSettingsStore();
  const { showToast, showModal } = useNotificationStore();

  const [tax, setTax] = useState(settings.taxPercentage);
  const [scoopWeight, setScoopWeight] = useState(settings.defaultScoopWeightGrams);
  const [poThreshold, setPoThreshold] = useState(settings.poOwnerApprovalThreshold);
  const [pointEarnRate, setPointEarnRate] = useState(settings.loyaltyPointEarnRate);
  const [pointRedeemVal, setPointRedeemVal] = useState(settings.loyaltyPointRedeemValue);
  const [shelfLife, setShelfLife] = useState(settings.maxShelfLifeDays);
  const [isSavedAlert, setIsSavedAlert] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(
      {
        taxPercentage: Number(tax),
        defaultScoopWeightGrams: Number(scoopWeight),
        poOwnerApprovalThreshold: Number(poThreshold),
        loyaltyPointEarnRate: Number(pointEarnRate),
        loyaltyPointRedeemValue: Number(pointRedeemVal),
        maxShelfLifeDays: Number(shelfLife),
      },
      currentUser?.username || "mgr_doni"
    );
    showToast("Settings Saved", "Operational parameters have been successfully updated.", "SUCCESS");
    setIsSavedAlert(true);
    setTimeout(() => setIsSavedAlert(false), 3000);
  };

  const handleReset = () => {
    showModal(
      "Reset Configuration",
      "Are you sure you want to restore all operational parameters to factory defaults?",
      "WARNING",
      [
        {
          label: "Cancel",
          variant: "secondary",
          onClick: () => {},
        },
        {
          label: "Reset to Defaults",
          variant: "danger",
          onClick: () => {
            resetToDefaults(currentUser?.username || "mgr_doni");
            setTax(10);
            setScoopWeight(70);
            setPoThreshold(10000000);
            setPointEarnRate(10000);
            setPointRedeemVal(500);
            setShelfLife(8);
            showToast("Reset Successful", "All parameters have been restored to defaults.", "INFO");
          },
        },
      ]
    );
  };

  return (
    <div className="space-y-6 max-w-5xl select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-[0_10px_30px_rgba(45,61,110,0.05)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#2D3D6E] tracking-tight">System Configuration</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Configure tax, approval thresholds, scoop portion weight, and loyalty rates.
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold px-5 py-2.5 rounded-full flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {isSavedAlert && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Configuration saved successfully. System parameters updated and logged to audit trail.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Pricing & Tax Rules */}
        <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-[0_10px_30px_rgba(45,61,110,0.05)] space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-base text-[#2D3D6E]">Tax & High-Value Approval Threshold</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#2D3D6E] block mb-1.5">
                Value Added Tax / PB1 Rate (%)
              </label>
              <input
                type="number"
                min={0}
                max={30}
                required
                value={tax}
                onChange={(e) => setTax(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 font-mono text-xs font-bold text-[#2D3D6E] focus:ring-2 focus:ring-[#2D3D6E]/20 focus:outline-hidden"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Standard retail tax calculated on Net Subtotal.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-[#2D3D6E] block mb-1.5">
                PO Owner Escalation Threshold (IDR)
              </label>
              <input
                type="number"
                step={500000}
                required
                value={poThreshold}
                onChange={(e) => setPoThreshold(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 font-mono text-xs font-bold text-[#2D3D6E] focus:ring-2 focus:ring-[#2D3D6E]/20 focus:outline-hidden"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Current: {formatRupiah(poThreshold)}. POs exceeding this amount require Owner PIN authorization.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Gelato Portion & Showcase Shelf Life */}
        <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-[0_10px_30px_rgba(45,61,110,0.05)] space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-base text-[#2D3D6E]">Scoop Portion & Showcase Shelf Life</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#2D3D6E] block mb-1.5">
                Configurable Scoop Portion (Grams per Scoop)
              </label>
              <input
                type="number"
                min={30}
                max={150}
                required
                value={scoopWeight}
                onChange={(e) => setScoopWeight(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 font-mono text-xs font-bold text-[#2D3D6E] focus:ring-2 focus:ring-[#2D3D6E]/20 focus:outline-hidden"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Used to deduct physical tub weight upon each POS order checkout (Default: 70g).
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-[#2D3D6E] block mb-1.5">
                Showcase Tub Max Shelf Life (Days)
              </label>
              <input
                type="number"
                min={1}
                max={30}
                required
                value={shelfLife}
                onChange={(e) => setShelfLife(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 font-mono text-xs font-bold text-[#2D3D6E] focus:ring-2 focus:ring-[#2D3D6E]/20 focus:outline-hidden"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Tubs open longer than {shelfLife} days are automatically flagged as EXPIRED.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Loyalty Program Parameters */}
        <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-[0_10px_30px_rgba(45,61,110,0.05)] space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-base text-[#2D3D6E]">Member Loyalty Point Rules</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#2D3D6E] block mb-1.5">
                Point Earn Rate (Spend per 1 Point in IDR)
              </label>
              <input
                type="number"
                step={1000}
                required
                value={pointEarnRate}
                onChange={(e) => setPointEarnRate(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 font-mono text-xs font-bold text-[#2D3D6E] focus:ring-2 focus:ring-[#2D3D6E]/20 focus:outline-hidden"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Members receive 1 point for every {formatRupiah(pointEarnRate)} spent.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-[#2D3D6E] block mb-1.5">
                Point Redemption Value (IDR Discount per Point)
              </label>
              <input
                type="number"
                step={50}
                required
                value={pointRedeemVal}
                onChange={(e) => setPointRedeemVal(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 font-mono text-xs font-bold text-[#2D3D6E] focus:ring-2 focus:ring-[#2D3D6E]/20 focus:outline-hidden"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Each point is redeemed for {formatRupiah(pointRedeemVal)} discount at register.
              </p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 rounded-full bg-[#2D3D6E] hover:bg-[#1E293B] active:scale-[0.99] text-white text-xs font-bold shadow-lg shadow-[#2D3D6E]/20 flex items-center justify-center gap-2 transition-all"
        >
          <span>Save Changes to System Configuration</span>
        </button>
      </form>
    </div>
  );
}
