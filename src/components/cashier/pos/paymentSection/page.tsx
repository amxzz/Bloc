"use client";

import React from "react";
import Image from "next/image";
import { PaymentMethod, Transaction, CartItem } from "@/types/cashier";
import { formatRupiah } from "@/lib/utils/formatters";
import {
  CreditCard,
  QrCode,
  Banknote,
  CheckCircle,
  Printer,
  X,
} from "lucide-react";

interface PaymentSectionProps {
  isPaymentModalOpen: boolean;
  setIsPaymentModalOpen: (open: boolean) => void;
  completedTrx: Transaction | null;
  setCompletedTrx: (trx: Transaction | null) => void;
  items: CartItem[];
  getTotal: () => number;
  getChange: () => number;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (m: PaymentMethod) => void;
  cashTendered: number;
  setCashTendered: (amount: number) => void;
  handleCheckoutSubmit: () => void;
}

export default function PaymentSection({
  isPaymentModalOpen,
  setIsPaymentModalOpen,
  completedTrx,
  setCompletedTrx,
  items,
  getTotal,
  getChange,
  paymentMethod,
  setPaymentMethod,
  cashTendered,
  setCashTendered,
  handleCheckoutSubmit,
}: PaymentSectionProps) {
  return (
    <>
      {/* 1. PAYMENT CHECKOUT MODAL */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in select-none">
          <div className="w-full max-w-lg bg-white rounded-[32px] p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-lg text-[#2D3D6E]">Payment Checkout</h3>
                <p className="text-xs text-slate-500 font-medium">Select payment method & finalize order</p>
              </div>
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Total Payable Summary */}
            <div className="p-5 rounded-2xl bg-[#2D3D6E] text-white flex items-center justify-between shadow-md">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#F0E79D] font-bold">
                  Total Payable
                </span>
                <p className="text-2xl font-mono font-extrabold text-white">{formatRupiah(getTotal())}</p>
              </div>
              <div className="text-right text-[11px] font-mono text-slate-300">
                <p>{items.length} Order Item(s)</p>
                <p>Tax Included</p>
              </div>
            </div>

            {/* Order Items Detail Breakdown (Flavors, Toppings, Sauces) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2D3D6E] font-mono">
                  Order Items ({items.reduce((s, it) => s + it.quantity, 0)} Units)
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Flavors & Add-ons</span>
              </div>

              <div className="max-h-36 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-[#F6F8FC] p-3.5">
                {items.map((item, idx) => (
                  <div key={item.id || idx} className={`${idx > 0 ? "pt-2.5" : ""} space-y-1`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-[#2D3D6E]">
                          {item.packaging.name} ({item.packaging.category})
                        </span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200">
                          × {item.quantity}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-xs text-[#2D3D6E]">
                        {formatRupiah(item.totalPrice)}
                      </span>
                    </div>

                    {/* Flavors */}
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="text-[10px] font-mono text-slate-500 font-semibold">Flavors:</span>
                      {item.selectedFlavors.map((f, fIdx) => (
                        <span
                          key={fIdx}
                          className="px-2 py-0.5 rounded-full bg-[#2D3D6E]/10 text-[#2D3D6E] font-semibold text-[10px]"
                        >
                          {f.flavorName}
                        </span>
                      ))}
                    </div>

                    {/* Toppings & Sauces */}
                    {(item.selectedToppings.length > 0 || item.selectedSauces.length > 0) && (
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                        {item.selectedToppings.length > 0 && (
                          <div className="flex items-center gap-1">
                            <span className="font-mono font-semibold text-amber-700">Topping:</span>
                            <span className="text-slate-600">
                              {item.selectedToppings.map((t) => t.name).join(", ")}
                            </span>
                          </div>
                        )}
                        {item.selectedToppings.length > 0 && item.selectedSauces.length > 0 && (
                          <span className="text-slate-300">•</span>
                        )}
                        {item.selectedSauces.length > 0 && (
                          <div className="flex items-center gap-1">
                            <span className="font-mono font-semibold text-rose-700">Sauce:</span>
                            <span className="text-slate-600">
                              {item.selectedSauces.map((s) => s.name).join(", ")}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-2.5">
              {(["qris", "cash", "edc"] as PaymentMethod[]).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`p-3.5 rounded-2xl border text-center font-bold text-xs transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                    paymentMethod === method
                      ? "border-[#2D3D6E] bg-[#2D3D6E] text-white shadow-md shadow-[#2D3D6E]/20"
                      : "border-slate-200 bg-[#F6F8FC] text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {method === "qris" && <QrCode className="w-4 h-4" />}
                  {method === "cash" && <Banknote className="w-4 h-4" />}
                  {method === "edc" && <CreditCard className="w-4 h-4" />}
                  <span className="uppercase font-mono tracking-wider">{method}</span>
                </button>
              ))}
            </div>

            {/* Cash Tendered Input & Presets */}
            {paymentMethod === "cash" && (
              <div className="space-y-3 p-4 rounded-2xl bg-[#F6F8FC] border border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#2D3D6E]">Cash Received (IDR)</label>
                  <input
                    type="number"
                    value={cashTendered || ""}
                    onChange={(e) => setCashTendered(Number(e.target.value))}
                    className="w-36 px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs font-bold text-right text-[#2D3D6E] bg-white focus:ring-2 focus:ring-[#2D3D6E]/20 focus:outline-hidden"
                  />
                </div>

                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {[50000, 100000, 150000, 200000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setCashTendered(preset)}
                      className="px-3 py-1.5 rounded-full bg-white border border-slate-200 font-mono text-[11px] font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      {formatRupiah(preset)}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCashTendered(getTotal())}
                    className="px-3 py-1.5 rounded-full bg-[#2D3D6E]/10 border border-[#2D3D6E]/20 font-mono text-[11px] font-bold text-[#2D3D6E] cursor-pointer"
                  >
                    Exact
                  </button>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-200/60 text-xs font-mono">
                  <span className="font-bold text-slate-600">Change Due:</span>
                  <span className="font-extrabold text-sm text-emerald-700">{formatRupiah(getChange())}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="py-3 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCheckoutSubmit}
                className="py-3 rounded-full bg-[#2D3D6E] hover:bg-[#1E293B] text-white text-xs font-bold shadow-lg shadow-[#2D3D6E]/20 flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
              >
                <CheckCircle className="w-4 h-4 text-[#F0E79D]" />
                <span>Confirm Payment</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. AUTHENTIC THERMAL RECEIPT MODAL */}
      {completedTrx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in select-none">
          <div className="w-full max-w-sm bg-white rounded-[32px] p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
            {/* Inner Receipt White Card */}
            <div className="flex-1 overflow-y-auto max-h-[65vh] rounded-2xl border border-slate-200 p-4 bg-white font-mono text-xs text-slate-800 space-y-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {/* Header */}
              <div className="text-center space-y-1">
                <div className="flex justify-center pb-1">
                  <Image
                    src="/assets/Secondary logo.svg"
                    alt="Bloc. Logo"
                    width={40}
                    height={28}
                    className="h-7 w-auto object-contain brightness-0"
                    priority
                  />
                </div>
                <h2 className="font-bold text-sm text-[#2D3D6E] tracking-wider">BLOC. GELATO</h2>
                <p className="text-[11px] text-slate-500">Italian Gelato</p>
              </div>

              {/* Receipt Metadata */}
              <div className="pt-2">
                <div className="flex justify-between items-center text-[10px] text-slate-500 pb-2">
                  <span>Receipt #{completedTrx.receiptNumber}</span>
                  <span>{completedTrx.createdAt}</span>
                </div>
                <div className="border-b border-dotted border-slate-300" />
              </div>

              {/* Items List */}
              <div className="space-y-2 py-1">
                {completedTrx.items.map((item, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-900">
                      <span>
                        {item.packaging.name} × {item.quantity}
                      </span>
                      <span>IDR {item.totalPrice.toLocaleString("id-ID")}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-sans leading-tight">
                      {item.selectedFlavors.map((f) => f.flavorName).join(", ")}
                    </p>
                    {item.selectedToppings && item.selectedToppings.length > 0 && (
                      <p className="text-[9px] text-slate-400 font-sans italic">
                        + Topping: {item.selectedToppings.map((t) => t.name).join(", ")}
                      </p>
                    )}
                    {item.selectedSauces && item.selectedSauces.length > 0 && (
                      <p className="text-[9px] text-slate-400 font-sans italic">
                        + Sauce: {item.selectedSauces.map((s) => s.name).join(", ")}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Totals Section */}
              <div>
                <div className="border-b border-dotted border-slate-300 mb-2.5" />
                <div className="space-y-1.5 text-xs text-slate-700">
                  <div className="flex justify-between items-center">
                    <span>Subtotal</span>
                    <span>IDR {completedTrx.subtotalAmount.toLocaleString("id-ID")}</span>
                  </div>
                  {completedTrx.discountAmount > 0 && (
                    <div className="flex justify-between items-center text-emerald-700">
                      <span>Discount</span>
                      <span>-IDR {completedTrx.discountAmount.toLocaleString("id-ID")}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span>Tax (10%)</span>
                    <span>IDR {completedTrx.taxAmount.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between items-center font-bold text-sm text-slate-900 pt-1.5">
                    <span>Total Paid</span>
                    <span>IDR {completedTrx.totalAmount.toLocaleString("id-ID")}</span>
                  </div>
                </div>
              </div>

              {/* Payment & Cashier Info */}
              <div>
                <div className="border-b border-dotted border-slate-300 mb-2" />
                <div className="space-y-1 text-[10px] text-slate-600">
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span className="font-bold uppercase">{completedTrx.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cashier:</span>
                    <span className="font-bold">@{completedTrx.cashierUsername}</span>
                  </div>
                </div>
              </div>

              {/* Footer Notice */}
              <div>
                <div className="border-b border-dotted border-slate-300 mb-2.5" />
                <p className="text-center text-[10px] text-slate-500 pt-0.5">
                  Thank you for visiting Bloc. Gelato!
                </p>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="grid grid-cols-2 gap-3 pt-4 shrink-0">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="py-3 px-3 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <Printer className="w-4 h-4 text-slate-700" />
                <span>Print Receipt</span>
              </button>
              <button
                type="button"
                onClick={() => setCompletedTrx(null)}
                className="py-3 px-3 rounded-full bg-[#2D3D6E] hover:bg-[#1E293B] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-[#2D3D6E]/20 transition-all active:scale-[0.98]"
              >
                <span>New Order</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
