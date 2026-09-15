"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useAuthStore } from "@/store/useAuthStore";
import { Lock, Unlock, ShieldAlert, X } from "lucide-react";

interface ScreenLockModalProps {
  isLockTriggerOpen: boolean;
  setIsLockTriggerOpen: (open: boolean) => void;
  isSessionLocked: boolean;
  setIsSessionLocked: (locked: boolean) => void;
}

export default function ScreenLockModal({
  isLockTriggerOpen,
  setIsLockTriggerOpen,
  isSessionLocked,
  setIsSessionLocked,
}: ScreenLockModalProps) {
  const { currentUser } = useAuthStore();
  const [pinInput, setPinInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleDigitClick = (digit: string) => {
    if (pinInput.length < 6) {
      setPinInput((prev) => prev + digit);
      setErrorMessage("");
    }
  };

  const handleBackspace = () => {
    setPinInput((prev) => prev.slice(0, -1));
    setErrorMessage("");
  };

  const handleClear = () => {
    setPinInput("");
    setErrorMessage("");
  };

  // Lock Action: Confirm lock with staff PIN
  const handleConfirmLock = () => {
    if (pinInput.length !== 6) {
      setErrorMessage("Please enter full 6-digit PIN.");
      return;
    }

    if (currentUser?.pinCode && pinInput !== currentUser.pinCode) {
      setErrorMessage("Incorrect staff PIN.");
      return;
    }

    setIsSessionLocked(true);
    setIsLockTriggerOpen(false);
    setPinInput("");
    setErrorMessage("");
  };

  // Unlock Action: Validate PIN to resume session
  const handleConfirmUnlock = () => {
    if (pinInput.length !== 6) {
      setErrorMessage("Please enter 6-digit PIN.");
      return;
    }

    if (currentUser?.pinCode && pinInput === currentUser.pinCode) {
      setIsSessionLocked(false);
      setPinInput("");
      setErrorMessage("");
    } else {
      setErrorMessage("Invalid PIN. Session remains securely locked.");
      setPinInput("");
    }
  };

  // 1. FULLSCREEN LOCKED SCREEN (When session is locked)
  if (isSessionLocked) {
    return (
      <div className="fixed inset-0 z-500 bg-[#2D3D6E]/95 backdrop-blur-md flex flex-col items-center justify-center p-4 select-none animate-in fade-in">
        <div className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl border border-slate-200 text-center space-y-6">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#2D3D6E]/10 flex items-center justify-center text-[#2D3D6E]">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Session Locked</h2>
            <p className="text-xs text-slate-500 font-medium">
              Signed in as <strong className="text-slate-800">{currentUser?.fullName}</strong> ({currentUser?.role.toUpperCase()})
            </p>
          </div>

          {/* PIN Display Circles (6 Digits) */}
          <div className="flex justify-center items-center gap-2.5">
            {[0, 1, 2, 3, 4, 5].map((idx) => (
              <div
                key={idx}
                className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                  pinInput.length > idx
                    ? "bg-[#2D3D6E] border-[#2D3D6E] scale-110"
                    : "border-slate-300 bg-slate-50"
                }`}
              />
            ))}
          </div>

          {errorMessage && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-rose-600 font-medium bg-rose-50 p-2 rounded-xl border border-rose-200">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-2 max-w-[220px] mx-auto">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "Del"].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => {
                  if (val === "C") handleClear();
                  else if (val === "Del") handleBackspace();
                  else handleDigitClick(val);
                }}
                className={`h-12 rounded-xl text-sm font-bold font-mono transition-all flex items-center justify-center ${
                  val === "C" || val === "Del"
                    ? "bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 shadow-2xs active:scale-95"
                }`}
              >
                {val}
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={pinInput.length !== 6}
            onClick={handleConfirmUnlock}
            className="w-full py-3 rounded-xl bg-[#2D3D6E] hover:bg-[#1B2544] text-white text-xs font-bold shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Unlock className="w-4 h-4" />
            <span>Unlock Session</span>
          </button>
        </div>
      </div>
    );
  }

  // 2. LOCK TRIGGER MODAL (Prompting staff to enter PIN before locking)
  if (isLockTriggerOpen) {
    return (
      <div className="fixed inset-0 z-400 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-in fade-in">
        <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#2D3D6E]" />
              <h3 className="font-bold text-sm text-slate-900">Lock Workstation</h3>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsLockTriggerOpen(false);
                setPinInput("");
                setErrorMessage("");
              }}
              className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-600 font-medium">
            Enter your 6-digit staff PIN to lock session while preserving current screen state.
          </p>

          {/* PIN Circles (6 Digits) */}
          <div className="flex justify-center items-center gap-2.5">
            {[0, 1, 2, 3, 4, 5].map((idx) => (
              <div
                key={idx}
                className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                  pinInput.length > idx
                    ? "bg-[#2D3D6E] border-[#2D3D6E] scale-110"
                    : "border-slate-300 bg-slate-50"
                }`}
              />
            ))}
          </div>

          {errorMessage && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-rose-600 font-medium bg-rose-50 p-2 rounded-xl border border-rose-200">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-2 max-w-[220px] mx-auto">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "Del"].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => {
                  if (val === "C") handleClear();
                  else if (val === "Del") handleBackspace();
                  else handleDigitClick(val);
                }}
                className={`h-11 rounded-xl text-sm font-bold font-mono transition-all flex items-center justify-center ${
                  val === "C" || val === "Del"
                    ? "bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 shadow-2xs active:scale-95"
                }`}
              >
                {val}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsLockTriggerOpen(false);
                setPinInput("");
                setErrorMessage("");
              }}
              className="py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={pinInput.length !== 6}
              onClick={handleConfirmLock}
              className="py-2.5 rounded-xl bg-[#2D3D6E] hover:bg-[#1B2544] text-white text-xs font-bold shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Lock Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
