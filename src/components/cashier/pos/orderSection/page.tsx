"use client";

import React from "react";
import { CartItem, Member } from "@/types/cashier";
import { formatRupiah } from "@/lib/utils/formatters";
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Clock,
  UserCheck,
  CreditCard,
} from "lucide-react";

interface OrderSectionProps {
  items: CartItem[];
  holdOrdersCount: number;
  selectedMember: Member | null;
  setSelectedMember: (member: Member | null) => void;
  setIsMemberModalOpen: (open: boolean) => void;
  setIsHoldDrawerOpen: (open: boolean) => void;
  setIsPaymentModalOpen: (open: boolean) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getTaxableBase: () => number;
  getTax: () => number;
  getTotal: () => number;
  handleHoldOrder: () => void;
}

export default function OrderSection({
  items,
  holdOrdersCount,
  selectedMember,
  setSelectedMember,
  setIsMemberModalOpen,
  setIsHoldDrawerOpen,
  setIsPaymentModalOpen,
  removeItem,
  updateQuantity,
  getSubtotal,
  getDiscountAmount,
  getTaxableBase,
  getTax,
  getTotal,
  handleHoldOrder,
}: OrderSectionProps) {
  const memberDiscountPercent = selectedMember?.tier === "Gold" ? 10 : selectedMember?.tier === "Silver" ? 5 : 0;

  return (
    <div className="bg-white p-6 sm:p-7 rounded-[32px] border border-slate-100 shadow-[0_10px_30px_rgba(45,61,110,0.05)] space-y-4 select-none">
      {/* Cart Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <h3 className="font-extrabold text-base text-[#2D3D6E]">Active Order</h3>
          <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#2D3D6E]/10 text-[#2D3D6E]">
            {items.length}
          </span>
        </div>

        {/* Hold Button (Max 3) */}
        <button
          type="button"
          onClick={() => setIsHoldDrawerOpen(true)}
          className="flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 px-3.5 py-1.5 rounded-full border border-amber-200 transition-colors"
        >
          <Clock className="w-3.5 h-3.5 text-amber-700" />
          <span>Hold ({holdOrdersCount}/3)</span>
        </button>
      </div>

      {/* Member Banner with Tier & Benefits */}
      <div className="p-3.5 rounded-2xl bg-[#F6F8FC] border border-slate-100">
        {selectedMember ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-[#2D3D6E]">{selectedMember.fullName}</span>
                <span className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full border ${
                  selectedMember.tier === "Gold"
                    ? "bg-[#F0E79D] text-[#2D3D6E] border-amber-300"
                    : "bg-slate-100 text-slate-700 border-slate-300"
                }`}>
                  {selectedMember.tier} ({memberDiscountPercent}% Off)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                className="text-[11px] text-rose-600 hover:underline font-bold"
              >
                Remove
              </button>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>Points: <strong>{selectedMember.loyaltyPoints}</strong></span>
              <span>Code: {selectedMember.memberCode}</span>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsMemberModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 text-xs font-bold text-[#2D3D6E] hover:text-[#1C2646] py-1 transition-colors"
          >
            <UserCheck className="w-4 h-4 text-[#7F85D1]" />
            <span>Apply Loyalty Member</span>
          </button>
        )}
      </div>

      {/* Cart Items List */}
      <div className="space-y-2.5 max-h-[290px] overflow-y-auto pr-1">
        {items.length === 0 ? (
          <div className="text-center py-12 text-slate-400 space-y-1.5">
            <ShoppingBag className="w-8 h-8 mx-auto stroke-1 text-slate-300" />
            <p className="text-xs font-medium text-slate-500">Cart is currently empty</p>
            <p className="text-[11px] text-slate-400">Click a flavor in catalog to configure order</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-2xl border border-slate-100 bg-[#F6F8FC] space-y-2"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-xs text-[#2D3D6E]">
                    {item.packaging.name} ({item.packaging.category})
                  </h4>
                  <p className="text-[11px] text-slate-600 font-medium">
                    {item.selectedFlavors.map((f) => f.flavorName).join(" • ")}
                  </p>
                  {(item.selectedToppings.length > 0 || item.selectedSauces.length > 0) && (
                    <p className="text-[10px] text-slate-400">
                      Add: {[...item.selectedToppings, ...item.selectedSauces].map((a) => a.name).join(", ")}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-6 h-6 rounded-full bg-white border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs hover:bg-slate-100 transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="font-mono font-bold text-xs px-2 text-[#2D3D6E]">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-6 h-6 rounded-full bg-white border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs hover:bg-slate-100 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <span className="font-mono font-bold text-xs text-[#2D3D6E]">
                  {formatRupiah(item.totalPrice)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pricing Calculations */}
      {items.length > 0 && (
        <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs font-mono">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal:</span>
            <span>{formatRupiah(getSubtotal())}</span>
          </div>
          {getDiscountAmount() > 0 && (
            <div className="flex justify-between text-emerald-700 font-bold">
              <span>{selectedMember?.tier} Discount ({memberDiscountPercent}%):</span>
              <span>-{formatRupiah(getDiscountAmount())}</span>
            </div>
          )}
          <div className="flex justify-between text-slate-500 text-[11px]">
            <span>Taxable Base:</span>
            <span>{formatRupiah(getTaxableBase())}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Tax (10%):</span>
            <span>{formatRupiah(getTax())}</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
            <span>Total Bill:</span>
            <span className="text-[#2D3D6E] font-extrabold text-base">
              {formatRupiah(getTotal())}
            </span>
          </div>
        </div>
      )}

      {/* Cart Actions */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <button
          type="button"
          disabled={items.length === 0}
          onClick={handleHoldOrder}
          className="py-3 px-4 rounded-full border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Hold Order
        </button>
        <button
          type="button"
          disabled={items.length === 0}
          onClick={() => setIsPaymentModalOpen(true)}
          className="py-3 px-4 rounded-full bg-[#2D3D6E] hover:bg-[#1E293B] text-white text-xs font-bold shadow-lg shadow-[#2D3D6E]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          <CreditCard className="w-4 h-4 text-[#F0E79D]" />
          <span>Checkout</span>
        </button>
      </div>
    </div>
  );
}
