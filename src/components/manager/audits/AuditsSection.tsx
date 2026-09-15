"use client";

import React, { useState } from "react";
import { useAuditStore } from "@/store/useAuditStore";
import { AuditLogEntry } from "@/types/audit";
import DataTable, { Column } from "@/components/common/ui/DataTable";

export default function AuditsSection() {
  const { logs } = useAuditStore();
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const filteredLogs = logs.filter(
    (l) => roleFilter === "all" || l.role === roleFilter
  );

  const columns: Column<AuditLogEntry>[] = [
    {
      header: "Timestamp",
      accessorKey: "timestamp",
      cell: (row) => <span className="font-mono text-xs text-slate-500">{row.timestamp}</span>,
    },
    {
      header: "Action Type",
      accessorKey: "actionType",
      cell: (row) => (
        <span className="font-mono font-bold text-xs text-[#2D3D6E]">
          {row.actionType.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      header: "Actor / Role",
      accessorKey: "performedBy",
      cell: (row) => (
        <div>
          <span className="font-bold text-xs text-[#2D3D6E] block">@{row.performedBy}</span>
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">{row.role}</span>
        </div>
      ),
    },
    {
      header: "Target Entity",
      accessorKey: "targetEntity",
      cell: (row) => (
        <span className="font-mono font-semibold text-xs text-slate-700">{row.targetEntity}</span>
      ),
    },
    {
      header: "Activity Details",
      accessorKey: "details",
      cell: (row) => <span className="text-xs text-slate-600 font-medium">{row.details}</span>,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-[0_10px_30px_rgba(45,61,110,0.05)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#2D3D6E] tracking-tight">System Audit Trail</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Real-time activity log across transactions, shifts, batches, and approvals.
          </p>
        </div>

        {/* Role Filters */}
        <div className="flex items-center gap-1.5 bg-[#F6F8FC] p-1.5 rounded-full border border-slate-100">
          {(["all", "cashier", "kitchen", "manager", "owner"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRoleFilter(r)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                roleFilter === r
                  ? "bg-[#2D3D6E] text-white shadow-md shadow-[#2D3D6E]/20"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-[0_10px_30px_rgba(45,61,110,0.05)] space-y-4">
        <DataTable
          data={filteredLogs}
          columns={columns}
          searchPlaceholder="Search actor, target entity, or activity details..."
          searchKey="details"
          pageSize={10}
        />
      </div>
    </div>
  );
}
