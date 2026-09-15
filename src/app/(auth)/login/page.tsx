"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Lock, User, Eye, EyeOff, ArrowRight, AlertCircle, HelpCircle, X, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("csh_sarah");
  const [pin, setPin] = useState("123456");
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);
  const [isForgotPinOpen, setIsForgotPinOpen] = useState(false);

  const router = useRouter();
  const { login } = useAuthStore();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const res = login(username, pin);

    if (res.success && res.defaultRoute) {
      router.push(res.defaultRoute);
    } else {
      setError(res.error || "Invalid username or 6-digit PIN code.");
    }
  };

  return (
    <div className="min-h-screen bg-[#EEF2F8] flex items-center justify-center p-4 sm:p-6 lg:p-10 select-none">
      {/* Unified Master Luxury Card */}
      <div className="w-full max-w-4xl min-h-[560px] bg-white rounded-[36px] shadow-[0_24px_70px_rgba(45,61,110,0.12)] border border-slate-100 overflow-hidden flex flex-col md:flex-row relative">
        
        {/* LEFT COLUMN: Deep Blue Navy Box with Soft #F0E79D Warm Butter Glow (No Lines) */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-[#2D3D6E] via-[#223057] to-[#17203A] p-8 sm:p-12 flex items-center justify-center relative overflow-hidden">
          {/* Ambient Warm Butter #F0E79D & Periwinkle Smooth Atmospheric Glows */}
          <div className="absolute -bottom-16 -right-16 w-80 h-80 rounded-full bg-[#F0E79D]/18 blur-3xl pointer-events-none" />
          <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-[#7F85D1]/20 blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-radial from-[#F0E79D]/10 via-transparent to-transparent blur-2xl pointer-events-none" />

          {/* Large Centered Logo (High Contrast Cream/White on Deep Navy) */}
          <div className="relative z-10 flex items-center justify-center p-4">
            <Image
              src="/assets/Primary logo.svg"
              alt="Bloc. Gelato"
              width={280}
              height={90}
              className="w-56 sm:w-64 md:w-72 h-auto object-contain brightness-100 drop-shadow-md"
              priority
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Minimalist White Box with Navy Typography */}
        <div className="w-full md:w-1/2 p-8 sm:p-10 lg:p-12 flex flex-col justify-between bg-white z-10">
          <div>
            {/* Centered Welcome Title & Subtitle in Navy Palette */}
            <div className="text-center pt-2 pb-8">
              <h1 className="text-3xl font-extrabold text-[#2D3D6E] tracking-tight">
                Welcome
              </h1>
              <p className="text-xs text-[#2D3D6E]/70 font-medium mt-2">
                Please enter your credentials to access the workstation
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Username Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#2D3D6E] px-1">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2D3D6E]/50">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setError(null);
                    }}
                    placeholder="e.g. csh_sarah"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-full text-xs font-semibold text-[#2D3D6E] placeholder:text-[#2D3D6E]/35 focus:outline-hidden focus:border-[#2D3D6E] focus:bg-white focus:ring-4 focus:ring-[#2D3D6E]/10 transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {/* PIN Input (6 Digits) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#2D3D6E] px-1">
                  PIN
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2D3D6E]/50">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPin ? "text" : "password"}
                    maxLength={6}
                    value={pin}
                    onChange={(e) => {
                      setPin(e.target.value);
                      setError(null);
                    }}
                    placeholder="••••••"
                    className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-full text-xs font-mono font-bold tracking-widest text-[#2D3D6E] placeholder:text-[#2D3D6E]/35 focus:outline-hidden focus:border-[#2D3D6E] focus:bg-white focus:ring-4 focus:ring-[#2D3D6E]/10 transition-all duration-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-[#2D3D6E]/50 hover:text-[#2D3D6E] transition-colors focus:outline-hidden"
                  >
                    {showPin ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Options: Remember Me & Forgot PIN */}
              <div className="flex items-center justify-between px-1 pt-0.5 pb-1 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-[#2D3D6E]/75 hover:text-[#2D3D6E] select-none font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-[#2D3D6E] focus:ring-0 cursor-pointer accent-[#2D3D6E]"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotPinOpen(true)}
                  className="text-[#2D3D6E] hover:underline font-bold focus:outline-hidden"
                >
                  Forgot PIN?
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs rounded-2xl font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 px-6 bg-[#2D3D6E] hover:bg-[#1C2646] active:scale-[0.99] text-white font-bold text-xs rounded-full shadow-lg shadow-[#2D3D6E]/20 flex items-center justify-center gap-2 transition-all duration-200 focus:outline-hidden focus:ring-4 focus:ring-[#2D3D6E]/20"
              >
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Footer note in soft Navy */}
          <div className="pt-6 text-center text-[11px] text-[#2D3D6E]/40 font-medium">
            &copy; 2026 Bloc. Gelato Management System.
          </div>
        </div>

      </div>

      {/* CUSTOM NOTIFICATION / ASSISTANCE MODAL */}
      {isForgotPinOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in select-none">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#2D3D6E]/10 text-[#2D3D6E] flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-[#2D3D6E]">PIN Assistance</h3>
              </div>
              <button
                onClick={() => setIsForgotPinOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-[#2D3D6E]/85 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 font-normal">
              <div className="flex items-center gap-2 text-[#2D3D6E] font-bold mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Security Verification Required</span>
              </div>
              <p>
                Staff PIN codes are securely managed by Store Management. Please contact your duty <strong className="font-bold text-[#2D3D6E]">Manager</strong> or <strong className="font-bold text-[#2D3D6E]">System Administrator</strong> to verify your identity and reset your 6-digit authorization PIN.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsForgotPinOpen(false)}
              className="w-full py-2.5 bg-[#2D3D6E] hover:bg-[#1C2646] text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
