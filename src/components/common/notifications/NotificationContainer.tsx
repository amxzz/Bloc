"use client";

import React from "react";
import { useNotificationStore } from "@/store/useNotificationStore";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";

export default function NotificationContainer() {
  const { toasts, removeToast, activeModal, closeModal, activeBanner, closeBanner } =
    useNotificationStore();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
      case "WARNING":
        return <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />;
      case "ERROR":
        return <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />;
      case "ACTION_REQUIRED":
        return <AlertTriangle className="w-5 h-5 text-bloc-red shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-bloc-blue shrink-0" />;
    }
  };

  return (
    <>
      {/* 1. TOP BANNER (Action Required / Alerts) */}
      {activeBanner && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-bloc-red text-white px-6 py-3 shadow-lg flex items-center justify-between animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-white animate-pulse" />
            <div>
              <span className="font-bold mr-2">[{activeBanner.title}]</span>
              <span className="text-sm text-white/90">{activeBanner.message}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {activeBanner.actions?.map((act, idx) => (
              <button
                key={idx}
                onClick={() => {
                  act.onClick();
                  closeBanner();
                }}
                className="px-3 py-1 bg-white text-bloc-red font-semibold text-xs rounded-lg hover:bg-zinc-100 transition-colors"
              >
                {act.label}
              </button>
            ))}
            <button
              onClick={closeBanner}
              className="p-1 hover:bg-white/20 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. TOAST NOTIFICATIONS (Bottom Right / Top Right) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start gap-3 p-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-bloc-blue/30 animate-in slide-in-from-right duration-200"
          >
            {getStatusIcon(toast.status)}
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-bloc-navy uppercase tracking-wider">
                {toast.title}
              </h4>
              <p className="text-xs text-zinc-600 mt-0.5 leading-relaxed">{toast.message}</p>
              {toast.actions && toast.actions.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  {toast.actions.map((act, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        act.onClick();
                        removeToast(toast.id);
                      }}
                      className="text-xs font-semibold text-bloc-blue hover:text-bloc-navy underline"
                    >
                      {act.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 text-zinc-400 hover:text-zinc-700 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* 3. MODAL ALERT (Success / Error / Warning) */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bloc-navy/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-bloc-blue/20 overflow-hidden">
            <div className="p-6 text-center">
              <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-2xl bg-zinc-50 border border-zinc-100 mb-4">
                {getStatusIcon(activeModal.status)}
              </div>
              <h3 className="text-lg font-bold text-bloc-navy mb-1">{activeModal.title}</h3>
              <p className="text-sm text-zinc-600 leading-relaxed mb-6">
                {activeModal.message}
              </p>

              <div className="flex items-center gap-3">
                {activeModal.actions && activeModal.actions.length > 0 ? (
                  activeModal.actions.map((act, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        act.onClick();
                        closeModal();
                      }}
                      className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-sm transition-colors ${
                        act.variant === "primary"
                          ? "bg-bloc-blue hover:bg-[#6b71c2] text-white shadow-sm"
                          : act.variant === "danger"
                          ? "bg-bloc-red hover:bg-red-800 text-white"
                          : "border border-zinc-300 hover:bg-zinc-50 text-zinc-700"
                      }`}
                    >
                      {act.label}
                    </button>
                  ))
                ) : (
                  <button
                    onClick={closeModal}
                    className="w-full py-2.5 px-4 rounded-xl bg-bloc-blue hover:bg-[#6b71c2] text-white font-medium text-sm transition-colors shadow-sm"
                  >
                    Tutup
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
