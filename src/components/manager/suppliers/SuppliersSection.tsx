"use client";

import React, { useState } from "react";
import { Supplier } from "@/types/manager";
import { useInventoryStore } from "@/store/useInventoryStore";
import DataTable, { Column } from "@/components/common/ui/DataTable";
import { Plus, Phone, Mail, X } from "lucide-react";

export default function SuppliersSection() {
  const { suppliers, addSupplier } = useInventoryStore();
  const [isNewSupplierOpen, setIsNewSupplierOpen] = useState(false);
  const [name, setName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState<Supplier["category"]>("Packaging");

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSup: Supplier = {
      id: `sup-${Date.now()}`,
      code: `SUP-${category.slice(0, 3).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`,
      name,
      contactPerson,
      phone,
      email,
      address: "Jakarta, Indonesia",
      category,
      isActive: true,
    };
    addSupplier(newSup);
    setIsNewSupplierOpen(false);
    setName("");
    setContactPerson("");
    setPhone("");
    setEmail("");
  };

  const columns: Column<Supplier>[] = [
    {
      header: "Code",
      accessorKey: "code",
      cell: (row) => (
        <span className="font-mono font-bold text-xs text-[#2D3D6E] block">{row.code}</span>
      ),
    },
    {
      header: "Supplier Name",
      accessorKey: "name",
      cell: (row) => (
        <div>
          <span className="font-bold text-xs text-[#2D3D6E] block">{row.name}</span>
          <span className="text-[10px] text-slate-400 font-medium">{row.contactPerson}</span>
        </div>
      ),
    },
    {
      header: "Category",
      accessorKey: "category",
      cell: (row) => (
        <span className="px-3 py-0.5 rounded-full bg-slate-100 font-mono text-[10px] font-bold text-slate-700">
          {row.category}
        </span>
      ),
    },
    {
      header: "Contact Details",
      cell: (row) => (
        <div className="space-y-0.5 text-xs text-slate-600 font-mono">
          <div className="flex items-center gap-1">
            <Phone className="w-3 h-3 text-slate-400" />
            <span>{row.phone}</span>
          </div>
          <div className="flex items-center gap-1">
            <Mail className="w-3 h-3 text-slate-400" />
            <span>{row.email}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "isActive",
      cell: (row) => (
        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          ACTIVE
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-[0_10px_30px_rgba(45,61,110,0.05)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#2D3D6E] tracking-tight">Supplier Directory</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Master supplier records for raw ingredients, flavor purees, and packaging.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNewSupplierOpen(true)}
          className="bg-[#2D3D6E] hover:bg-[#1E293B] text-white text-xs font-bold px-6 py-3 rounded-full flex items-center gap-2 shadow-lg shadow-[#2D3D6E]/20 transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Supplier</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-[0_10px_30px_rgba(45,61,110,0.05)] space-y-4">
        <DataTable
          data={suppliers}
          columns={columns}
          searchPlaceholder="Search vendor name, code, or contact..."
          searchKey="name"
          pageSize={6}
        />
      </div>

      {/* NEW SUPPLIER MODAL */}
      {isNewSupplierOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in select-none">
          <form
            onSubmit={handleAddSubmit}
            className="w-full max-w-md bg-white rounded-[32px] p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-lg text-[#2D3D6E]">Register New Supplier</h3>
              <button
                type="button"
                onClick={() => setIsNewSupplierOpen(false)}
                className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#2D3D6E] block mb-1.5">Company / Vendor Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PT Mitra Rasa Indonesia"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs font-semibold text-[#2D3D6E] focus:outline-hidden focus:ring-2 focus:ring-[#2D3D6E]/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#2D3D6E] block mb-1.5">Contact Person</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bpk. Hendra"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs font-semibold text-[#2D3D6E] focus:outline-hidden focus:ring-2 focus:ring-[#2D3D6E]/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#2D3D6E] block mb-1.5">Phone</label>
                  <input
                    type="tel"
                    required
                    placeholder="08..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs font-semibold text-[#2D3D6E] focus:outline-hidden focus:ring-2 focus:ring-[#2D3D6E]/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#2D3D6E] block mb-1.5">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Supplier["category"])}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs font-semibold text-[#2D3D6E] focus:outline-hidden focus:ring-2 focus:ring-[#2D3D6E]/20"
                  >
                    <option value="Packaging">Packaging</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Flavor & Puree">Flavor & Puree</option>
                    <option value="Equipment">Equipment</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsNewSupplierOpen(false)}
                className="py-3 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-3 rounded-full bg-[#2D3D6E] hover:bg-[#1E293B] text-white text-xs font-bold shadow-lg shadow-[#2D3D6E]/20 transition-all active:scale-[0.98]"
              >
                Save Supplier
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
