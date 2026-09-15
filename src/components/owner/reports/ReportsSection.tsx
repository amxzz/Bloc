"use client";

import React, { useState } from "react";
import DataTable, { Column } from "@/components/common/ui/DataTable";
import { Download, CheckCircle, FileSpreadsheet, FileText } from "lucide-react";

interface ReportEntry {
  id: string;
  reportName: string;
  period: string;
  category: "Financial" | "Inventory" | "Audit" | "Sales";
  generatedDate: string;
  fileSize: string;
  status: "Ready" | "Generating";
}

export const MOCK_REPORTS: ReportEntry[] = [
  {
    id: "REP-2026-09-01",
    reportName: "Financial P&L Statement",
    period: "August 2026",
    category: "Financial",
    generatedDate: "2026-09-01 02:00",
    fileSize: "2.4 MB",
    status: "Ready",
  },
  {
    id: "REP-2026-09-02",
    reportName: "Wastage & Spoilage Report",
    period: "August 2026",
    category: "Inventory",
    generatedDate: "2026-09-01 02:05",
    fileSize: "850 KB",
    status: "Ready",
  },
  {
    id: "REP-2026-09-03",
    reportName: "PO Approvals & Audit Log",
    period: "August 2026",
    category: "Audit",
    generatedDate: "2026-09-01 02:10",
    fileSize: "1.2 MB",
    status: "Ready",
  },
  {
    id: "REP-2026-09-04",
    reportName: "Sales & Product Matrix",
    period: "August 2026",
    category: "Sales",
    generatedDate: "2026-09-01 02:15",
    fileSize: "1.8 MB",
    status: "Ready",
  },
];

export default function ReportsSection() {
  const [reports] = useState<ReportEntry[]>(MOCK_REPORTS);
  const [downloadAlert, setDownloadAlert] = useState<string | null>(null);

  const handleDownloadPDF = (rep: ReportEntry) => {
    setDownloadAlert(`Downloaded "${rep.reportName}" [PDF Format] (${rep.period})`);
    setTimeout(() => setDownloadAlert(null), 3500);
  };

  const handleDownloadExcel = (rep: ReportEntry) => {
    setDownloadAlert(`Exported "${rep.reportName}" [Excel .xlsx Format] (${rep.period})`);
    setTimeout(() => setDownloadAlert(null), 3500);
  };

  const columns: Column<ReportEntry>[] = [
    {
      header: "Report ID",
      accessorKey: "id",
      cell: (row) => (
        <span className="font-mono font-bold text-xs text-[#2D3D6E] block">{row.id}</span>
      ),
    },
    {
      header: "Report Title",
      accessorKey: "reportName",
      cell: (row) => (
        <div>
          <span className="font-bold text-xs text-[#2D3D6E] block">{row.reportName}</span>
          <span className="text-[10px] text-slate-400 font-mono">Period: {row.period}</span>
        </div>
      ),
    },
    {
      header: "Category",
      accessorKey: "category",
      cell: (row) => (
        <span className="px-3 py-1 rounded-full bg-slate-100 font-mono text-[10px] font-bold text-slate-700">
          {row.category}
        </span>
      ),
    },
    {
      header: "Generated Date",
      accessorKey: "generatedDate",
      cell: (row) => <span className="font-mono text-xs text-slate-500">{row.generatedDate}</span>,
    },
    {
      header: "File Size",
      accessorKey: "fileSize",
      cell: (row) => <span className="font-mono text-xs text-slate-600">{row.fileSize}</span>,
    },
    {
      header: "Export Actions",
      cell: (row) => (
        <div className="flex items-center gap-2">
          {/* Export PDF */}
          <button
            type="button"
            onClick={() => handleDownloadPDF(row)}
            className="px-3.5 py-1.5 rounded-full bg-[#2D3D6E] hover:bg-[#1E293B] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-[0.98] cursor-pointer"
            title="Export as PDF Document"
          >
            <FileText className="w-3.5 h-3.5 text-[#F0E79D]" />
            <span>Export PDF</span>
          </button>

          {/* Export Excel */}
          <button
            type="button"
            onClick={() => handleDownloadExcel(row)}
            className="px-3.5 py-1.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-[0.98] cursor-pointer"
            title="Export as Excel Spreadsheet (.xlsx)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-200" />
            <span>Export Excel</span>
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
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#2D3D6E] tracking-tight">Periodic Reports</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Downloadable P&amp;L financial statements, wastage logs, and sales performance reports in PDF or Excel.
          </p>
        </div>
      </div>

      {downloadAlert && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{downloadAlert}</span>
        </div>
      )}

      {/* Table */}
      <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-[0_10px_30px_rgba(45,61,110,0.05)] space-y-4">
        <DataTable
          data={reports}
          columns={columns}
          searchPlaceholder="Search report title or category..."
          searchKey="reportName"
          pageSize={6}
        />
      </div>
    </div>
  );
}
