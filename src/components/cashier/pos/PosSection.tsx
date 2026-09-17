"use client";

import React, { useState } from "react";
import { useCartStore } from "@/store/useCartStore";
import { useFreezerStore } from "@/store/useFreezerStore";
import { useHoldStore } from "@/store/useHoldStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useShiftStore } from "@/store/useShiftStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { PackagingOption, ToppingOption, SauceOption, Transaction, CartItemFlavor } from "@/types/cashier";
import { ShowcaseSlot, GelatoFlavor } from "@/types/kitchen";
import CatalogSection from "./catalogSection/page";
import OrderSection from "./orderSection/page";
import HoldSection from "./holdSection/page";
import PaymentSection from "./paymentSection/page";
import OrderConfigModal from "./OrderConfigModal";
import { X, UserCheck, Clock, ArrowRight } from "lucide-react";

export default function PosSection() {
  const { currentUser } = useAuthStore();
  const { activeShift, openShift } = useShiftStore();
  const { slots } = useFreezerStore();
  const { holdOrders, addHoldOrder, removeHoldOrder } = useHoldStore();
  const { showToast } = useNotificationStore();
  const {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getSubtotal,
    getDiscountAmount,
    getTaxableBase,
    getTax,
    getTotal,
    getChange,
    paymentMethod,
    setPaymentMethod,
    cashTendered,
    setCashTendered,
    processCheckout,
    selectedMember,
    setSelectedMember,
    members,
    registerMember,
  } = useCartStore();

  // Blocking Open-Shift Modal State
  const [openShiftNumber, setOpenShiftNumber] = useState<1 | 2>(1);
  const [openingFloat, setOpeningFloat] = useState<number>(500000);

  // Configurator Modal State
  const [isConfiguratorOpen, setIsConfiguratorOpen] = useState(false);
  const [selectedFlavorForConfig, setSelectedFlavorForConfig] = useState<ShowcaseSlot | GelatoFlavor | null>(null);

  // Drawers & Modals
  const [isHoldDrawerOpen, setIsHoldDrawerOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [completedTrx, setCompletedTrx] = useState<Transaction | null>(null);
  const [customerNameInput, setCustomerNameInput] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberPhone, setNewMemberPhone] = useState("");
  const [memberSearch, setMemberSearch] = useState("");

  const activeShowcaseFlavors = slots.filter((slot) => slot.flavorId && slot.flavorName);

  const handleOpenConfigurator = (flavor?: ShowcaseSlot | GelatoFlavor) => {
    if (!activeShift || activeShift.status !== "open") {
      showToast(
        "Shift Inactive",
        "Please open a cashier shift register before processing orders.",
        "WARNING"
      );
      return;
    }
    setSelectedFlavorForConfig(flavor || null);
    setIsConfiguratorOpen(true);
  };

  const handleAddToCartFromModal = (
    packaging: PackagingOption,
    flavors: CartItemFlavor[],
    toppings: ToppingOption[],
    sauces: SauceOption[]
  ) => {
    if (!activeShift || activeShift.status !== "open") {
      showToast("Shift Inactive", "Please open a cashier shift register first.", "WARNING");
      return;
    }

    const toppingsTotal = toppings.reduce((sum, t) => sum + t.price, 0);
    const saucesTotal = sauces.reduce((sum, s) => sum + s.price, 0);
    const unitPrice = packaging.price + toppingsTotal + saucesTotal;

    addItem({
      packaging,
      selectedFlavors: flavors,
      selectedToppings: toppings,
      selectedSauces: sauces,
      quantity: 1,
      unitPrice,
    });
  };

  const handleHoldOrder = () => {
    if (items.length === 0) return;
    const res = addHoldOrder(items, customerNameInput || "Guest Order", currentUser?.username, selectedMember);
    if (res.success) {
      clearCart();
      setCustomerNameInput("");
      setIsHoldDrawerOpen(false);
      showToast("Order Held", res.message, "SUCCESS");
    } else {
      showToast("Hold Limit Exceeded", res.message, "WARNING");
    }
  };

  const handleResumeHold = (order: (typeof holdOrders)[0]) => {
    clearCart();
    order.items.forEach((it) => {
      addItem({
        packaging: it.packaging,
        selectedFlavors: it.selectedFlavors,
        selectedToppings: it.selectedToppings,
        selectedSauces: it.selectedSauces,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
      });
    });
    setCustomerNameInput(order.customerName);
    if (order.member) {
      setSelectedMember(order.member);
    }
    removeHoldOrder(order.id, currentUser?.username);
    setIsHoldDrawerOpen(false);
    showToast("Order Restored", `Order for "${order.customerName}" loaded into active cart.`, "INFO");
  };

  const handleCheckoutSubmit = () => {
    if (!activeShift || activeShift.status !== "open") {
      showToast("Shift Inactive", "Please open a shift register to process payments.", "WARNING");
      return;
    }
    const res = processCheckout(currentUser?.username || "csh_sarah", activeShift.id);
    if (res.success && res.transaction) {
      setCompletedTrx(res.transaction);
      setIsPaymentModalOpen(false);
      showToast("Payment Success", `Receipt ${res.transaction.receiptNumber} processed successfully.`, "SUCCESS");
    } else {
      showToast("Payment Error", res.error || "Failed to process transaction.", "ERROR");
    }
  };

  const handleOpenShiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    openShift(
      openShiftNumber,
      currentUser?.username || "csh_sarah",
      currentUser?.fullName || "Sarah Jenkins",
      openingFloat
    );
    showToast(
      "Shift Opened",
      `Shift ${openShiftNumber} active with initial float of Rp ${openingFloat.toLocaleString("id-ID")}.`,
      "SUCCESS"
    );
  };

  const isShiftClosed = !activeShift || activeShift.status !== "open";

  const filteredMembers = members.filter(
    (m) =>
      m.fullName.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.phoneNumber.includes(memberSearch) ||
      m.memberCode.toLowerCase().includes(memberSearch.toLowerCase())
  );

  return (
    <div className="relative">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 max-w-7xl select-none">
        {/* Left 2 Cols: Gelato Flavor Catalog */}
        <div className="md:col-span-7 lg:col-span-8 space-y-4">
          <CatalogSection
            activeShowcaseFlavors={slots}
            onOpenConfigurator={handleOpenConfigurator}
          />
        </div>

        {/* Right 1 Col: Active Order & Cart */}
        <div className="md:col-span-5 lg:col-span-4 space-y-4">
          <OrderSection
            items={items}
            holdOrdersCount={holdOrders.length}
            selectedMember={selectedMember}
            setSelectedMember={setSelectedMember}
            setIsMemberModalOpen={setIsMemberModalOpen}
            setIsHoldDrawerOpen={setIsHoldDrawerOpen}
            setIsPaymentModalOpen={setIsPaymentModalOpen}
            removeItem={removeItem}
            updateQuantity={updateQuantity}
            getSubtotal={getSubtotal}
            getDiscountAmount={getDiscountAmount}
            getTaxableBase={getTaxableBase}
            getTax={getTax}
            getTotal={getTotal}
            handleHoldOrder={handleHoldOrder}
          />
        </div>
      </div>

      {/* MODAL 1: FLAVOR / ITEM CONFIGURATOR */}
      <OrderConfigModal
        isOpen={isConfiguratorOpen}
        onClose={() => setIsConfiguratorOpen(false)}
        initialFlavor={selectedFlavorForConfig}
        activeShowcaseSlots={slots}
        onAddToCart={handleAddToCartFromModal}
      />

      {/* MODAL 2: HOLD ORDERS DRAWER */}
      <HoldSection
        isOpen={isHoldDrawerOpen}
        onClose={() => setIsHoldDrawerOpen(false)}
        holdOrders={holdOrders}
        onResumeHold={handleResumeHold}
        onRemoveHold={(id: string) => removeHoldOrder(id, currentUser?.username)}
      />

      {/* MODAL 3: PAYMENT CHECKOUT */}
      <PaymentSection
        isPaymentModalOpen={isPaymentModalOpen}
        setIsPaymentModalOpen={setIsPaymentModalOpen}
        completedTrx={completedTrx}
        setCompletedTrx={setCompletedTrx}
        items={items}
        getTotal={getTotal}
        getChange={getChange}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        cashTendered={cashTendered}
        setCashTendered={setCashTendered}
        handleCheckoutSubmit={handleCheckoutSubmit}
      />

      {/* MODAL 4: MEMBER SELECTION & REGISTRATION */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in select-none">
          <div className="w-full max-w-md bg-white rounded-[32px] p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#2D3D6E]" />
                <h3 className="font-bold text-sm text-[#2D3D6E]">Select Loyalty Member</h3>
              </div>
              <button
                onClick={() => setIsMemberModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <input
              type="text"
              placeholder="Search by name, phone, or member code..."
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-full border border-slate-200 text-xs font-semibold focus:outline-hidden focus:border-[#2D3D6E]"
            />

            {/* Existing Members */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {filteredMembers.map((m) => (
                <div
                  key={m.id}
                  onClick={() => {
                    setSelectedMember(m);
                    setIsMemberModalOpen(false);
                    showToast("Member Applied", `Loyalty discount for ${m.fullName} active.`, "SUCCESS");
                  }}
                  className="p-3 rounded-2xl border border-slate-200/80 hover:border-[#2D3D6E] hover:bg-slate-50 flex items-center justify-between cursor-pointer transition-all"
                >
                  <div>
                    <span className="font-bold text-xs text-[#2D3D6E] block">{m.fullName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{m.phoneNumber} • {m.memberCode}</span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    m.tier === "Gold" ? "bg-[#F0E79D] text-[#2D3D6E]" : "bg-slate-100 text-slate-700"
                  }`}>
                    {m.tier} ({m.tier === "Gold" ? "10%" : "5%"})
                  </span>
                </div>
              ))}
            </div>

            {/* Quick Register Form */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <p className="text-xs font-bold text-[#2D3D6E]">Quick Member Registration</p>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="px-3.5 py-2 rounded-full border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-[#2D3D6E]"
                />
                <input
                  type="text"
                  placeholder="Phone (08...)"
                  value={newMemberPhone}
                  onChange={(e) => setNewMemberPhone(e.target.value)}
                  className="px-3.5 py-2 rounded-full border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-[#2D3D6E]"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (newMemberName && newMemberPhone) {
                    registerMember(newMemberName, newMemberPhone);
                    setIsMemberModalOpen(false);
                    setNewMemberName("");
                    setNewMemberPhone("");
                  }
                }}
                className="w-full py-2.5 bg-[#2D3D6E] hover:bg-[#1C2646] text-white text-xs font-bold rounded-full shadow-sm transition-all"
              >
                Register & Select Silver Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NON-DISMISSIBLE BLOCKING MODAL: OPEN SHIFT CASHIER (EXACT LOGIN PAGE STYLING) */}
      {isShiftClosed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 sm:p-6 animate-in fade-in select-none">
          <div className="w-full max-w-md sm:max-w-lg md:max-w-xl bg-white rounded-[32px] p-6 sm:p-8 md:p-10 shadow-[0_24px_70px_rgba(45,61,110,0.15)] border border-slate-100 space-y-6 animate-in zoom-in-95">
            <div className="text-center space-y-1.5 pb-2">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#2D3D6E] tracking-tight">
                Open Register Shift
              </h3>
              <p className="text-xs sm:text-sm text-[#2D3D6E]/70 font-medium">
                Enter initial cash float to activate the POS workstation terminal
              </p>
            </div>

            <form onSubmit={handleOpenShiftSubmit} className="space-y-4 sm:space-y-5">
              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-bold text-[#2D3D6E] px-1">
                  Staff On Duty
                </label>
                <div className="px-4 py-3 sm:py-3.5 bg-slate-50 rounded-full border border-slate-200 text-xs sm:text-sm font-mono font-bold text-[#2D3D6E] flex items-center justify-between">
                  <span>{currentUser?.fullName || "Sarah Jenkins"}</span>
                  <span className="text-[10px] sm:text-xs text-[#2D3D6E]/50">@{currentUser?.username || "csh_sarah"}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-bold text-[#2D3D6E] px-1">
                  Shift Schedule
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setOpenShiftNumber(1)}
                    className={`py-3 px-4 rounded-full border text-xs sm:text-sm font-bold transition-all ${
                      openShiftNumber === 1
                        ? "bg-[#2D3D6E] border-[#2D3D6E] text-white shadow-xs"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Shift 1 (Morning)
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpenShiftNumber(2)}
                    className={`py-2.5 sm:py-3 px-4 rounded-full border text-xs sm:text-sm font-bold transition-all ${
                      openShiftNumber === 2
                        ? "bg-[#2D3D6E] border-[#2D3D6E] text-white shadow-xs"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Shift 2 (Evening)
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between px-1">
                  <label className="text-xs sm:text-sm font-bold text-[#2D3D6E]">
                    Opening Cash Float (IDR)
                  </label>
                  <span className="text-[10px] sm:text-xs font-mono text-[#2D3D6E]/50">Drawer Balance</span>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs sm:text-sm font-mono font-bold text-[#2D3D6E]/50">
                    Rp
                  </span>
                  <input
                    type="number"
                    min={0}
                    step={10000}
                    value={openingFloat}
                    onChange={(e) => setOpeningFloat(Number(e.target.value) || 0)}
                    className="w-full pl-11 pr-4 py-3 sm:py-3.5 rounded-full border border-slate-200 font-mono text-xs sm:text-sm font-bold text-[#2D3D6E] focus:ring-4 focus:ring-[#2D3D6E]/10 focus:border-[#2D3D6E] focus:outline-hidden"
                    required
                  />
                </div>

                {/* Quick Float Preset Buttons */}
                <div className="flex items-center gap-2 pt-1 px-1">
                  <span className="text-[10px] sm:text-xs text-[#2D3D6E]/60 font-semibold">Preset:</span>
                  {[
                    { value: 200000, label: "200k" },
                    { value: 500000, label: "500k" },
                    { value: 1000000, label: "1.000k" },
                  ].map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setOpeningFloat(preset.value)}
                      className={`text-[10px] sm:text-xs font-mono font-bold px-3 py-1 sm:py-1.5 rounded-full border transition-all ${
                        openingFloat === preset.value
                          ? "bg-[#F0E79D] text-[#2D3D6E] border-[#2D3D6E]/30 font-extrabold"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 sm:py-4 px-6 bg-[#2D3D6E] hover:bg-[#1C2646] active:scale-[0.99] text-white text-xs sm:text-sm font-bold rounded-full shadow-lg shadow-[#2D3D6E]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Open Shift & Access Terminal</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
