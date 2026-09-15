"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useAuthStore } from "@/store/useAuthStore";
import { useShiftStore } from "@/store/useShiftStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useHoldStore } from "@/store/useHoldStore";
import { useFreezerStore } from "@/store/useFreezerStore";
import { useInventoryStore } from "@/store/useInventoryStore";
import { UserRole } from "@/types/auth";
import { useRouter } from "next/navigation";
import {
  Clock,
  Calendar,
  Bell,
  Lock,
  KeyRound,
  LogOut,
  ChevronDown,
  X,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

interface HeaderProps {
  onLockClick: () => void;
}

interface SystemAlertItem {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "warning" | "info";
  badge: string;
  actionLabel: string;
  actionHref: string;
}

const roleAvatarMap: Record<UserRole, string> = {
  cashier: "/assets/photo profil/cashier.png",
  kitchen: "/assets/photo profil/kitchen.png",
  manager: "/assets/photo profil/manager.png",
  owner: "/assets/photo profil/owner.png",
};

export default function Header({ onLockClick }: HeaderProps) {
  const router = useRouter();
  const { currentUser, logout, updatePinCode } = useAuthStore();
  const { activeShift } = useShiftStore();
  const { toasts, showToast, removeToast } = useNotificationStore();
  const { holdOrders } = useHoldStore();
  const { slots } = useFreezerStore();
  const { items: inventoryItems, purchaseOrders } = useInventoryStore();

  const [currentDateTime, setCurrentDateTime] = useState<Date | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isChangePinOpen, setIsChangePinOpen] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinError, setPinError] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Construct structured actionable alerts based on active role
  const alertsList: SystemAlertItem[] = [];

  if (currentUser?.role === "cashier") {
    if (holdOrders.length > 0) {
      alertsList.push({
        id: "cashier-hold-orders",
        title: "Active Held Orders",
        description: `${holdOrders.length} cart transaction(s) temporarily on hold. Resume checkout before end of shift.`,
        severity: "warning",
        badge: `${holdOrders.length}`,
        actionLabel: "Resume in POS",
        actionHref: "/cashier/pos",
      });
    }
  } else if (currentUser?.role === "kitchen") {
    const criticalTubs = slots.filter((s) => s.status === "CRITICAL" || s.status === "EMPTY");
    if (criticalTubs.length > 0) {
      alertsList.push({
        id: "kitchen-critical-tubs",
        title: "Showcase Tubs Restock Needed",
        description: `${criticalTubs.length} flavor tub slot(s) are critically low or empty.`,
        severity: "critical",
        badge: `${criticalTubs.length}`,
        actionLabel: "View Showcase",
        actionHref: "/kitchen/showcase",
      });
    }
    const expiredTubs = slots.filter((s) => s.status === "EXPIRED");
    if (expiredTubs.length > 0) {
      alertsList.push({
        id: "kitchen-expired-tubs",
        title: "Expired Showcase Tubs",
        description: `${expiredTubs.length} tub(s) have passed the 14-day freshness threshold.`,
        severity: "warning",
        badge: `${expiredTubs.length}`,
        actionLabel: "Inspect Showcase",
        actionHref: "/kitchen/showcase",
      });
    }
    const lowStock = inventoryItems.filter((i) => i.currentStock <= i.minRestockThreshold);
    if (lowStock.length > 0) {
      alertsList.push({
        id: "kitchen-low-stock",
        title: "Low Ingredient Stock",
        description: `${lowStock.length} raw inventory item(s) below minimum stock threshold.`,
        severity: "warning",
        badge: `${lowStock.length}`,
        actionLabel: "Check Inventory",
        actionHref: "/kitchen/inventory",
      });
    }
  } else if (currentUser?.role === "manager") {
    const pendingManager = purchaseOrders.filter((p) => p.status === "pending_manager_approval");
    if (pendingManager.length > 0) {
      alertsList.push({
        id: "manager-pending-pos",
        title: "Pending Purchase Orders",
        description: `${pendingManager.length} purchase order(s) submitted by kitchen awaiting manager authorization.`,
        severity: "warning",
        badge: `${pendingManager.length}`,
        actionLabel: "Review Approvals",
        actionHref: "/manager/approvals",
      });
    }
    const lowStock = inventoryItems.filter((i) => i.currentStock <= i.minRestockThreshold);
    if (lowStock.length > 0) {
      alertsList.push({
        id: "manager-low-stock",
        title: "Raw Material Reorder Warning",
        description: `${lowStock.length} ingredient(s) reaching critical minimum stock levels.`,
        severity: "info",
        badge: `${lowStock.length}`,
        actionLabel: "Suppliers Directory",
        actionHref: "/manager/suppliers",
      });
    }
  } else if (currentUser?.role === "owner") {
    const pendingOwner = purchaseOrders.filter((p) => p.status === "pending_owner_approval");
    if (pendingOwner.length > 0) {
      alertsList.push({
        id: "owner-pending-pos",
        title: "High-Value PO Approvals",
        description: `${pendingOwner.length} purchase order(s) exceeding threshold awaiting owner sign-off.`,
        severity: "critical",
        badge: `${pendingOwner.length}`,
        actionLabel: "Authorize POs",
        actionHref: "/owner/managers",
      });
    }
  }

  const totalAlerts = alertsList.length + toasts.length;
  const currentRole: UserRole = currentUser?.role || "cashier";
  const avatarSrc = roleAvatarMap[currentRole] || "/assets/photo profil/cashier.png";

  // Live real-time clock
  useEffect(() => {
    setCurrentDateTime(new Date());
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDayDate = (date: Date) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${dayName}, ${day} ${month} ${year}`;
  };

  const formatTime = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${hours}:${minutes}:${seconds} WIB`;
  };

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const handleChangePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length !== 6 || !/^\d{6}$/.test(newPin)) {
      setPinError("PIN must be exactly 6 digits.");
      return;
    }
    if (newPin !== confirmPin) {
      setPinError("PIN confirmation does not match.");
      return;
    }

    if (currentUser) {
      updatePinCode(currentUser.id, newPin);
      showToast("PIN Updated", "Your staff security PIN has been successfully updated.", "SUCCESS");
      setIsChangePinOpen(false);
      setNewPin("");
      setConfirmPin("");
      setPinError("");
    }
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between shrink-0 select-none shadow-2xs z-30">
        {/* Left: Dynamic Live Day, Date & Time Clock */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-sm font-extrabold text-slate-900 tracking-tight tabular-nums">
              {currentDateTime ? formatTime(currentDateTime) : "--:--:-- WIB"}
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-xs font-semibold text-slate-700">
              {currentDateTime ? formatDayDate(currentDateTime) : "Loading..."}
            </span>
          </div>
        </div>

        {/* Right: Cashier Shift Badge + Unified Single User Profile Dropdown */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Active Shift Indicator (Cashier) */}
          {currentUser?.role === "cashier" && (
            activeShift && activeShift.status === "open" ? (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono text-[11px]">
                  {activeShift.shiftName || "Shift 1 Active"}
                </span>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="font-mono text-[11px]">
                  Shift Closed • Standby
                </span>
              </div>
            )
          )}

          {/* Unified Profile Dropdown Trigger */}
          <div
            ref={dropdownRef}
            className="relative"
            onMouseEnter={() => setIsDropdownOpen(true)}
          >
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl border border-slate-200/80 hover:border-slate-300 bg-slate-50 hover:bg-white transition-all shadow-2xs group cursor-pointer"
            >
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-xl overflow-hidden bg-slate-100 ring-1 ring-slate-200/80 shrink-0">
                  <Image
                    src={avatarSrc}
                    alt={currentUser?.fullName || "Staff"}
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                </div>
                {totalAlerts > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-white font-mono text-[9px] font-extrabold ring-2 ring-white">
                    {totalAlerts}
                  </span>
                )}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-slate-800 leading-tight group-hover:text-[#2D3D6E]">
                  {currentUser?.fullName || "Staff Member"}
                </p>
                <p className="text-[10px] font-mono text-slate-400 capitalize">
                  {currentUser?.role || "user"}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform duration-200" />
            </button>

            {/* Hover / Click Dropdown Menu */}
            {isDropdownOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200/90 py-2.5 z-50 animate-in fade-in zoom-in-95 duration-150"
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                {/* User Summary Header */}
                <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 ring-1 ring-slate-200/80 shrink-0">
                    <Image
                      src={avatarSrc}
                      alt={currentUser?.fullName || "Staff"}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-slate-900 truncate">{currentUser?.fullName}</p>
                    <p className="text-[11px] font-mono text-slate-500 capitalize">
                      {currentUser?.role || "Staff"} • @{currentUser?.username}
                    </p>
                  </div>
                </div>

                {/* Dropdown Items */}
                <div className="py-1 space-y-0.5">
                  {/* Notifications */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setIsNotificationsOpen(true);
                    }}
                    className="w-full px-3 py-2 flex items-center justify-between hover:bg-slate-50 cursor-pointer rounded-xl mx-1 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                        <Bell className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-slate-700 block">Notifications & Alerts</span>
                        <span className="text-[10px] text-slate-400 block">
                          {totalAlerts > 0
                            ? `${totalAlerts} active item${totalAlerts > 1 ? "s" : ""}`
                            : "All operational states clear"}
                        </span>
                      </div>
                    </div>
                    {totalAlerts > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-mono font-bold">
                        {totalAlerts}
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-400">0</span>
                    )}
                  </button>

                  {/* Lock Screen */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onLockClick();
                    }}
                    className="w-full px-3 py-2 flex items-center gap-2.5 hover:bg-slate-50 cursor-pointer rounded-xl mx-1 transition-colors text-left"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-700 block">Lock Screen</span>
                      <span className="text-[10px] text-slate-400 block">Enter PIN to lock workstation</span>
                    </div>
                  </button>

                  {/* Change Password / PIN */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setIsChangePinOpen(true);
                    }}
                    className="w-full px-3 py-2 flex items-center gap-2.5 hover:bg-slate-50 cursor-pointer rounded-xl mx-1 transition-colors text-left"
                  >
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                      <KeyRound className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-700 block">Change PIN Code</span>
                      <span className="text-[10px] text-slate-400 block">Update 6-digit staff PIN</span>
                    </div>
                  </button>
                </div>

                {/* Sign Out Action */}
                <div className="pt-1.5 mt-1 border-t border-slate-100 px-1">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full px-3 py-2 flex items-center gap-2.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left text-xs font-bold"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* NOTIFICATIONS & ALERTS MODAL */}
      {isNotificationsOpen && (
        <div className="fixed inset-0 z-500 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-[#2D3D6E] text-[#F0E79D] flex items-center justify-center shadow-xs">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900">Notifications & Alerts</h3>
                    {totalAlerts > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-mono font-bold">
                        {totalAlerts}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Operational warnings and system messages for your workstation
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNotificationsOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content / Alert Items */}
            <div className="p-6 overflow-y-auto space-y-3 flex-1">
              {totalAlerts === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center ring-8 ring-emerald-50/50">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">All Systems Clear</p>
                    <p className="text-xs text-slate-500 max-w-xs mt-0.5">
                      No active operational alerts or pending items require attention for your role right now.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Actionable Alerts List */}
                  {alertsList.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        alert.severity === "critical"
                          ? "bg-rose-50/50 border-rose-200/80"
                          : alert.severity === "warning"
                          ? "bg-amber-50/40 border-amber-200/80"
                          : "bg-slate-50 border-slate-200/80"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                              alert.severity === "critical"
                                ? "bg-rose-100 text-rose-700"
                                : alert.severity === "warning"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-slate-900">{alert.title}</h4>
                              <span
                                className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                                  alert.severity === "critical"
                                    ? "bg-rose-500 text-white"
                                    : alert.severity === "warning"
                                    ? "bg-amber-500 text-white"
                                    : "bg-slate-200 text-slate-700"
                                }`}
                              >
                                {alert.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                              {alert.description}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setIsNotificationsOpen(false);
                            router.push(alert.actionHref);
                          }}
                          className="shrink-0 px-3 py-1.5 rounded-xl bg-[#2D3D6E] hover:bg-[#1B2544] text-[#F0E79D] text-[11px] font-bold shadow-xs hover:shadow transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                        >
                          <span>{alert.actionLabel}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Toasts / Activity Log Section */}
                  {toasts.length > 0 && (
                    <div className="pt-2">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                          Recent System Messages ({toasts.length})
                        </span>
                      </div>
                      <div className="space-y-2">
                        {toasts.map((toast) => (
                          <div
                            key={toast.id}
                            className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-2 shadow-2xs"
                          >
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                              <div className="truncate">
                                <p className="text-xs font-semibold text-slate-800 truncate">{toast.title}</p>
                                <p className="text-[10px] text-slate-500 truncate">{toast.message}</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeToast(toast.id)}
                              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
                              title="Dismiss"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">
                Role: <span className="font-semibold text-slate-700 capitalize">{currentUser?.role}</span>
              </span>
              <button
                type="button"
                onClick={() => setIsNotificationsOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-200/80 hover:bg-slate-300/80 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHANGE PIN MODAL */}
      {isChangePinOpen && (
        <div className="fixed inset-0 z-500 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#2D3D6E]" />
                <h3 className="font-bold text-sm text-slate-900">Change Staff PIN</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsChangePinOpen(false);
                  setPinError("");
                  setNewPin("");
                  setConfirmPin("");
                }}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleChangePinSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">New 6-Digit PIN</label>
                <input
                  type="password"
                  maxLength={6}
                  placeholder="••••••"
                  value={newPin}
                  onChange={(e) => {
                    setNewPin(e.target.value);
                    setPinError("");
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-center font-mono text-base font-bold tracking-widest focus:ring-2 focus:ring-[#2D3D6E] focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Confirm New PIN</label>
                <input
                  type="password"
                  maxLength={6}
                  placeholder="••••••"
                  value={confirmPin}
                  onChange={(e) => {
                    setConfirmPin(e.target.value);
                    setPinError("");
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-center font-mono text-base font-bold tracking-widest focus:ring-2 focus:ring-[#2D3D6E] focus:outline-hidden"
                />
              </div>

              {pinError && (
                <p className="text-xs text-rose-600 font-medium text-center bg-rose-50 p-2 rounded-xl border border-rose-200">
                  {pinError}
                </p>
              )}

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsChangePinOpen(false)}
                  className="py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={newPin.length !== 6 || confirmPin.length !== 6}
                  className="py-2.5 rounded-xl bg-[#2D3D6E] hover:bg-[#1B2544] text-white text-xs font-bold shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Save New PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
