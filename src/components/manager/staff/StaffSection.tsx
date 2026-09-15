"use client";

import React, { useState } from "react";
import { UserRole } from "@/types/auth";
import { StaffUser } from "@/types/manager";
import DataTable, { Column } from "@/components/common/ui/DataTable";
import { useNotificationStore } from "@/store/useNotificationStore";
import { UserCheck, UserPlus, Shield, Lock, Phone, X, KeyRound, Power, Trash2, Edit3, AlertTriangle } from "lucide-react";

export const MOCK_STAFF: StaffUser[] = [
  {
    id: "stf-01",
    username: "csh_sarah",
    fullName: "Sarah Jenkins",
    role: "cashier",
    phoneNumber: "08123456701",
    pinCode: "123456",
    isActive: true,
    joinedDate: "2026-01-15",
  },
  {
    id: "stf-02",
    username: "ktc_budi",
    fullName: "Budi Santoso",
    role: "kitchen",
    phoneNumber: "08123456702",
    pinCode: "234567",
    isActive: true,
    joinedDate: "2026-02-01",
  },
  {
    id: "stf-03",
    username: "mgr_doni",
    fullName: "Doni Pratama",
    role: "manager",
    phoneNumber: "08123456703",
    pinCode: "888888",
    isActive: true,
    joinedDate: "2025-11-20",
  },
  {
    id: "stf-04",
    username: "own_hendra",
    fullName: "Hendra Wijaya",
    role: "owner",
    phoneNumber: "08123456704",
    pinCode: "999999",
    isActive: true,
    joinedDate: "2025-08-01",
  },
];

export default function StaffSection() {
  const { showToast } = useNotificationStore();
  const [staffList, setStaffList] = useState<StaffUser[]>(MOCK_STAFF);

  // Add Staff Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<UserRole>("cashier");
  const [pinCode, setPinCode] = useState("");
  const [phone, setPhone] = useState("");

  // Edit PIN Modal State
  const [isEditPinOpen, setIsEditPinOpen] = useState(false);
  const [selectedStaffForPin, setSelectedStaffForPin] = useState<StaffUser | null>(null);
  const [editPinInput, setEditPinInput] = useState("");
  const [pinError, setPinError] = useState("");

  // Delete Staff Modal State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedStaffForDelete, setSelectedStaffForDelete] = useState<StaffUser | null>(null);

  // Add New Staff
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinCode.length !== 6 || !/^\d{6}$/.test(pinCode)) {
      showToast("Validation Error", "PIN code must be exactly 6 numeric digits.", "WARNING");
      return;
    }

    const newStaff: StaffUser = {
      id: `stf-${Date.now()}`,
      username: username.toLowerCase().trim(),
      fullName,
      role,
      phoneNumber: phone,
      pinCode,
      isActive: true,
      joinedDate: new Date().toISOString().split("T")[0],
    };
    setStaffList([...staffList, newStaff]);
    showToast("Staff Account Created", `Account for ${fullName} (@${username}) created successfully.`, "SUCCESS");
    setIsAddOpen(false);
    setFullName("");
    setUsername("");
    setPinCode("");
    setPhone("");
  };

  // Toggle Active / Inactive Status
  const handleToggleStatus = (staff: StaffUser) => {
    const updatedStatus = !staff.isActive;
    setStaffList((prev) =>
      prev.map((s) => (s.id === staff.id ? { ...s, isActive: updatedStatus } : s))
    );
    showToast(
      "Staff Status Updated",
      `Account @${staff.username} status set to ${updatedStatus ? "ACTIVE" : "INACTIVE"}.`,
      updatedStatus ? "SUCCESS" : "WARNING"
    );
  };

  // Open Edit PIN Modal
  const handleOpenEditPin = (staff: StaffUser) => {
    setSelectedStaffForPin(staff);
    setEditPinInput("");
    setPinError("");
    setIsEditPinOpen(true);
  };

  // Save New PIN
  const handleSavePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffForPin) return;

    if (editPinInput.length !== 6 || !/^\d{6}$/.test(editPinInput)) {
      setPinError("PIN must be exactly 6 numeric digits.");
      return;
    }

    setStaffList((prev) =>
      prev.map((s) => (s.id === selectedStaffForPin.id ? { ...s, pinCode: editPinInput } : s))
    );
    showToast("PIN Updated", `Security PIN for @${selectedStaffForPin.username} updated successfully.`, "SUCCESS");
    setIsEditPinOpen(false);
    setSelectedStaffForPin(null);
    setEditPinInput("");
    setPinError("");
  };

  // Open Delete Confirmation
  const handleOpenDelete = (staff: StaffUser) => {
    setSelectedStaffForDelete(staff);
    setIsDeleteOpen(true);
  };

  // Confirm Delete Staff Account
  const handleConfirmDelete = () => {
    if (!selectedStaffForDelete) return;
    setStaffList((prev) => prev.filter((s) => s.id !== selectedStaffForDelete.id));
    showToast("Account Removed", `Staff account @${selectedStaffForDelete.username} has been permanently deleted.`, "INFO");
    setIsDeleteOpen(false);
    setSelectedStaffForDelete(null);
  };

  const columns: Column<StaffUser>[] = [
    {
      header: "Staff Member",
      accessorKey: "fullName",
      cell: (row) => (
        <div>
          <span className="font-bold text-xs text-slate-900 block">{row.fullName}</span>
          <span className="text-[10px] font-mono text-slate-400">@{row.username}</span>
        </div>
      ),
    },
    {
      header: "Assigned Role",
      accessorKey: "role",
      cell: (row) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono tracking-wider ${
            row.role === "owner"
              ? "bg-purple-50 text-purple-700 border border-purple-200"
              : row.role === "manager"
              ? "bg-[#2D3D6E]/10 text-[#2D3D6E] border border-[#2D3D6E]/20"
              : row.role === "kitchen"
              ? "bg-amber-50 text-amber-800 border border-amber-200"
              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
          }`}
        >
          {row.role}
        </span>
      ),
    },
    {
      header: "Phone",
      accessorKey: "phoneNumber",
      cell: (row) => <span className="font-mono text-xs text-slate-600">{row.phoneNumber}</span>,
    },
    {
      header: "PIN Security",
      accessorKey: "pinCode",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-slate-500">
            •••• ({row.pinCode.length} digits)
          </span>
          <button
            type="button"
            onClick={() => handleOpenEditPin(row)}
            className="p-1 rounded-md text-slate-400 hover:text-[#2D3D6E] hover:bg-slate-100 transition-colors cursor-pointer"
            title="Edit 6-Digit PIN"
          >
            <KeyRound className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
    {
      header: "Joined Date",
      accessorKey: "joinedDate",
      cell: (row) => <span className="font-mono text-xs text-slate-500">{row.joinedDate}</span>,
    },
    {
      header: "Status",
      accessorKey: "isActive",
      cell: (row) => (
        <button
          type="button"
          onClick={() => handleToggleStatus(row)}
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
            row.isActive
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
              : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
          }`}
          title="Click to toggle Active / Inactive status"
        >
          {row.isActive ? "ACTIVE" : "INACTIVE"}
        </button>
      ),
    },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          {/* Edit PIN */}
          <button
            type="button"
            onClick={() => handleOpenEditPin(row)}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            title="Edit PIN"
          >
            <KeyRound className="w-3.5 h-3.5 text-[#2D3D6E]" />
          </button>

          {/* Toggle Active / Non Active */}
          <button
            type="button"
            onClick={() => handleToggleStatus(row)}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              row.isActive
                ? "border-amber-200 bg-amber-50/50 text-amber-700 hover:bg-amber-100"
                : "border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100"
            }`}
            title={row.isActive ? "Deactivate Account" : "Activate Account"}
          >
            <Power className="w-3.5 h-3.5" />
          </button>

          {/* Delete Account */}
          <button
            type="button"
            onClick={() => handleOpenDelete(row)}
            className="p-1.5 rounded-lg border border-rose-200 bg-rose-50/50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
            title="Delete Staff Account"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-[0_10px_30px_rgba(45,61,110,0.05)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#2D3D6E] tracking-tight">Staff &amp; Account Management</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Staff credentials, PIN security management, active status controls, and account administration.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="bg-[#2D3D6E] hover:bg-[#1E293B] text-white text-xs font-bold px-6 py-3 rounded-full flex items-center gap-2 shadow-lg shadow-[#2D3D6E]/20 transition-all active:scale-[0.98] cursor-pointer"
        >
          <UserPlus className="w-4 h-4 text-[#F0E79D]" />
          <span>Add Staff Account</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-[0_10px_30px_rgba(45,61,110,0.05)] space-y-4">
        <DataTable
          data={staffList}
          columns={columns}
          searchPlaceholder="Search staff name, username, or role..."
          searchKey="fullName"
          pageSize={6}
        />
      </div>

      {/* ADD STAFF MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in select-none">
          <form
            onSubmit={handleAddSubmit}
            className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Add Staff Account</h3>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya Indah"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#2D3D6E] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Username</label>
                  <input
                    type="text"
                    required
                    placeholder="csh_maya"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#2D3D6E] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#2D3D6E] focus:outline-hidden bg-white"
                  >
                    <option value="cashier">Cashier</option>
                    <option value="kitchen">Kitchen</option>
                    <option value="manager">Manager</option>
                    <option value="owner">Owner</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Phone</label>
                  <input
                    type="tel"
                    required
                    placeholder="08..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#2D3D6E] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">6-Digit PIN</label>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    placeholder="••••••"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-center font-mono text-xs font-bold focus:ring-2 focus:ring-[#2D3D6E] focus:outline-hidden tracking-widest"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#2D3D6E] hover:bg-[#1E293B] text-white text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                Save Account
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT STAFF PIN MODAL */}
      {isEditPinOpen && selectedStaffForPin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in select-none">
          <form
            onSubmit={handleSavePinSubmit}
            className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#2D3D6E]" />
                <h3 className="font-bold text-sm text-slate-900">Edit Staff Security PIN</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditPinOpen(false);
                  setSelectedStaffForPin(null);
                }}
                className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <p className="text-xs font-bold text-slate-800">{selectedStaffForPin.fullName}</p>
              <p className="text-[10px] font-mono text-slate-400">
                @{selectedStaffForPin.username} • Role: {selectedStaffForPin.role.toUpperCase()}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">New 6-Digit PIN</label>
              <input
                type="password"
                maxLength={6}
                required
                placeholder="••••••"
                value={editPinInput}
                onChange={(e) => {
                  setEditPinInput(e.target.value);
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

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsEditPinOpen(false);
                  setSelectedStaffForPin(null);
                }}
                className="py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={editPinInput.length !== 6}
                className="py-2.5 rounded-xl bg-[#2D3D6E] hover:bg-[#1E293B] text-white text-xs font-bold shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                Save New PIN
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteOpen && selectedStaffForDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in select-none">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Delete Staff Account</h3>
                <p className="text-xs text-slate-500">Are you sure you want to remove this account?</p>
              </div>
            </div>

            <div className="bg-rose-50/60 p-3.5 rounded-2xl border border-rose-100 space-y-0.5">
              <p className="text-xs font-bold text-rose-900">{selectedStaffForDelete.fullName}</p>
              <p className="text-[11px] font-mono text-rose-700">
                @{selectedStaffForDelete.username} ({selectedStaffForDelete.role})
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteOpen(false);
                  setSelectedStaffForDelete(null);
                }}
                className="py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
