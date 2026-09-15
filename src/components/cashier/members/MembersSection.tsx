"use client";

import React, { useState } from "react";
import { useCartStore } from "@/store/useCartStore";
import { Member } from "@/types/cashier";
import { formatRupiah } from "@/lib/utils/formatters";
import DataTable, { Column } from "@/components/common/ui/DataTable";
import { Users, UserPlus, X } from "lucide-react";

export default function MembersSection() {
  const { members, registerMember } = useCartStore();
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    registerMember(name, phone);
    setName("");
    setPhone("");
    setIsRegisterOpen(false);
  };

  const columns: Column<Member>[] = [
    {
      header: "Member Code",
      accessorKey: "memberCode",
      cell: (row) => (
        <span className="font-mono font-bold text-xs text-[#2D3D6E]">
          {row.memberCode}
        </span>
      ),
    },
    {
      header: "Full Name",
      accessorKey: "fullName",
      cell: (row) => <span className="font-bold text-xs text-[#2D3D6E]">{row.fullName}</span>,
    },
    {
      header: "Tier Level",
      accessorKey: "tier",
      cell: (row) => (
        <span
          className={`font-mono font-bold text-[11px] px-3 py-1 rounded-full border inline-flex items-center gap-1 ${
            row.tier === "Gold"
              ? "bg-[#2D3D6E] text-[#F0E79D] border-[#2D3D6E]"
              : "bg-slate-100 text-slate-700 border-slate-200"
          }`}
        >
          <span>{row.tier} ({row.tier === "Gold" ? "10% OFF" : "5% OFF"})</span>
        </span>
      ),
    },
    {
      header: "Phone Number",
      accessorKey: "phoneNumber",
      cell: (row) => (
        <span className="font-mono text-xs text-slate-600">
          {row.phoneNumber}
        </span>
      ),
    },
    {
      header: "Loyalty Points",
      accessorKey: "loyaltyPoints",
      cell: (row) => (
        <div>
          <span className="font-mono font-bold text-xs text-[#2D3D6E]">
            {row.loyaltyPoints} <span className="text-[10px] text-slate-400 font-normal">pts</span>
          </span>
          <span className="text-[10px] font-mono text-slate-400 block">Valid for 1 year</span>
        </div>
      ),
    },
    {
      header: "Lifetime Spent",
      accessorKey: "totalSpent",
      cell: (row) => {
        const progressToGold = Math.min(100, Math.round((row.totalSpent / 1000000) * 100));
        return (
          <div className="space-y-1">
            <span className="font-mono font-bold text-xs text-[#2D3D6E] block">
              {formatRupiah(row.totalSpent)}
            </span>
            {row.tier === "Silver" ? (
              <div className="w-20 h-1 rounded-full bg-slate-100 overflow-hidden" title={`Gold Progress: ${progressToGold}%`}>
                <div className="h-full bg-slate-400 rounded-full" style={{ width: `${progressToGold}%` }} />
              </div>
            ) : (
              <span className="text-[9px] font-mono text-amber-700 font-bold">Gold Qualified</span>
            )}
          </div>
        );
      },
    },
    {
      header: "Registered Since",
      accessorKey: "registeredAt",
      cell: (row) => <span className="font-mono text-xs text-slate-500">{row.registeredAt}</span>,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl select-none">
      {/* Header with Tier Overview */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-[0_10px_30px_rgba(45,61,110,0.05)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#2D3D6E] tracking-tight">Bloc Loyalty Directory</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Member loyalty tiers, point balances, and instant POS checkout discounts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsRegisterOpen(true)}
          className="bg-[#2D3D6E] hover:bg-[#1C2646] text-white text-xs font-bold px-6 py-3 rounded-full flex items-center gap-2 shadow-lg shadow-[#2D3D6E]/20 transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register Member</span>
        </button>
      </div>

      {/* Tier Comparison Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 rounded-[32px] bg-white border border-slate-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#2D3D6E]">Silver Tier</h3>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
              5% Discount
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Complimentary signup. Earns 1 pt per IDR 10.000 spent and birthday scoop.
          </p>
        </div>

        <div className="p-6 rounded-[32px] bg-white border border-slate-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#2D3D6E]">Gold Tier</h3>
            <span className="text-xs font-mono font-extrabold px-3 py-1 rounded-full bg-[#F0E79D] text-[#2D3D6E]">
              10% Discount
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Qualifies at IDR 1.000.000 cumulative spend with double point multiplier.
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-[0_10px_30px_rgba(45,61,110,0.05)] space-y-4">
        <DataTable
          data={members}
          columns={columns}
          searchPlaceholder="Search by name, phone, or member code..."
          searchKey="fullName"
          pageSize={8}
        />
      </div>

      {/* REGISTRATION MODAL */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in select-none">
          <form
            onSubmit={handleRegister}
            className="w-full max-w-sm bg-white rounded-[32px] p-8 shadow-2xl border border-slate-100 space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-base text-[#2D3D6E]">New Member Registration</h3>
                <p className="text-xs text-slate-500 font-medium">Free signup + 10 welcome bonus points</p>
              </div>
              <button
                type="button"
                onClick={() => setIsRegisterOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2D3D6E] block px-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jessica Tan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-full border border-slate-200 text-xs font-medium text-[#2D3D6E] focus:ring-4 focus:ring-[#2D3D6E]/10 focus:border-[#2D3D6E] focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2D3D6E] block px-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 08123456789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-full border border-slate-200 text-xs font-medium text-[#2D3D6E] focus:ring-4 focus:ring-[#2D3D6E]/10 focus:border-[#2D3D6E] focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsRegisterOpen(false)}
                className="py-3 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-3 rounded-full bg-[#2D3D6E] hover:bg-[#1C2646] text-white text-xs font-bold shadow-md"
              >
                Register (Silver)
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
