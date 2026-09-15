"use client";

import React, { useState } from "react";
import { Lock, ShieldCheck, X, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { UserRole } from "@/types/auth";

interface PinModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  requiredRole?: UserRole;
  onSuccess: (approverName: string) => void;
  onCancel: () => void;
}

export default function PinModal({
  isOpen,
  title,
  description,
  requiredRole = "manager",
  onSuccess,
  onCancel,
}: PinModalProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { verifyPin } = useAuthStore();

  if (!isOpen) return null;

  const handleDigitClick = (digit: string) => {
    if (pin.length < 6) {
      setPin((prev) => prev + digit);
      setError(null);
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(null);
  };

  const handleClear = () => {
    setPin("");
    setError(null);
  };

  const handleVerify = () => {
    if (pin.length !== 6) {
      setError("Please enter a 6-digit PIN code.");
      return;
    }

    const isValid = verifyPin(pin, requiredRole);
    if (isValid) {
      const approverName = requiredRole === "owner" ? "own_hendra" : "mgr_doni";
      onSuccess(approverName);
      setPin("");
      setError(null);
    } else {
      setError(`Invalid PIN code for ${requiredRole.toUpperCase()} authorization.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in select-none">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2D3D6E]/10 text-[#2D3D6E]">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">{title}</h3>
              <p className="text-xs text-slate-500 font-medium">Authorization Required</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
          {description}
        </p>

        {/* PIN Dots Indicator (6 Digits) */}
        <div className="flex justify-center items-center gap-2.5 py-2">
          {[0, 1, 2, 3, 4, 5].map((idx) => (
            <div
              key={idx}
              className={`h-3.5 w-3.5 rounded-full border-2 transition-all duration-200 ${
                idx < pin.length
                  ? "border-[#2D3D6E] bg-[#2D3D6E] scale-110"
                  : "border-slate-300 bg-white"
              }`}
            />
          ))}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50 p-2.5 rounded-lg border border-rose-200 font-medium">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigitClick(digit)}
              className="h-12 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-100 font-mono text-base font-bold text-slate-800 transition-all active:scale-95 shadow-2xs"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="h-12 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-100 text-xs font-semibold text-slate-500 transition-all active:scale-95 shadow-2xs"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleDigitClick("0")}
            className="h-12 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-100 font-mono text-base font-bold text-slate-800 transition-all active:scale-95 shadow-2xs"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="h-12 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-100 text-xs font-semibold text-slate-500 transition-all active:scale-95 shadow-2xs"
          >
            Del
          </button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleVerify}
            className="h-10 rounded-xl bg-[#2D3D6E] hover:bg-[#1E293B] text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-sm transition-colors"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Authorize</span>
          </button>
        </div>
      </div>
    </div>
  );
}
