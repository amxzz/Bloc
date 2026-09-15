"use client";

import React from "react";
import { HoldOrder } from "@/types/cashier";
import { formatRupiah } from "@/lib/utils/formatters";
import { RotateCcw, Trash2, X } from "lucide-react";

interface HoldSectionProps {
  isOpen: boolean;
  onClose: () => void;
  holdOrders: HoldOrder[];
  onResumeHold: (order: HoldOrder) => void;
  onRemoveHold: (id: string) => void;
}

export default function HoldSection({
  isOpen,
  onClose,
  holdOrders,
  onResumeHold,
  onRemoveHold,
}: HoldSectionProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in select-none">
      <div className="w-full max-w-md bg-white rounded-[32px] p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-lg text-[#2D3D6E]">Held Orders Queue</h3>
            <p className="text-xs text-slate-400 font-mono">Active queue: {holdOrders.length}/3 slots</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
          {holdOrders.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs font-medium">
              No orders currently held in queue.
            </div>
          ) : (
            holdOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-2xl border border-slate-100 bg-[#F6F8FC] flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-[#2D3D6E]">{order.orderNumber}</span>
                    <span className="text-xs font-bold text-slate-900">{order.customerName}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {order.items.length} items • {formatRupiah(order.totalAmount)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onResumeHold(order)}
                    className="bg-[#2D3D6E] hover:bg-[#1E293B] text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm transition-all active:scale-[0.98]"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#F0E79D]" />
                    <span>Resume</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveHold(order.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
