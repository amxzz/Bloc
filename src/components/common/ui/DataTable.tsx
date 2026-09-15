"use client";

import React, { useState } from "react";
import { Search, ChevronLeft, ChevronRight, Inbox } from "lucide-react";

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchKey?: keyof T;
  filterTabs?: { label: string; value: string; filterFn: (item: T) => boolean }[];
  pageSize?: number;
  emptyMessage?: string;
}

export default function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchPlaceholder = "Search records...",
  searchKey,
  filterTabs,
  pageSize = 8,
  emptyMessage = "No items found",
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // 1. Filter by tabs
  let filteredData = data;
  if (filterTabs && filterTabs[activeTab]) {
    filteredData = filteredData.filter(filterTabs[activeTab].filterFn);
  }

  // 2. Filter by search term
  if (searchTerm.trim() !== "") {
    filteredData = filteredData.filter((item) => {
      if (searchKey) {
        const val = item[searchKey];
        return String(val ?? "").toLowerCase().includes(searchTerm.toLowerCase());
      }
      return Object.values(item).some((val) =>
        String(val ?? "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }

  // 3. Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="bg-white rounded-2xl border border-bloc-blue/15 p-5 shadow-xs space-y-4">
      {/* Top Bar: Search & Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {filterTabs && filterTabs.length > 0 ? (
          <div className="flex items-center gap-1.5 p-1 bg-zinc-100/80 rounded-xl border border-zinc-200/80 overflow-x-auto max-w-full">
            {filterTabs.map((tab, idx) => (
              <button
                key={tab.label}
                onClick={() => {
                  setActiveTab(idx);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === idx
                    ? "bg-bloc-navy text-white shadow-xs"
                    : "text-zinc-600 hover:text-bloc-navy hover:bg-white/50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        ) : (
          <div />
        )}

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-bloc-navy placeholder:text-zinc-400 focus:outline-none focus:border-bloc-blue"
          />
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-500 uppercase tracking-wider font-semibold text-[11px] bg-zinc-50/50">
              {columns.map((col, idx) => (
                <th key={idx} className={`py-3 px-4 ${col.className || ""}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-bloc-navy">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-zinc-50/60 transition-colors">
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className={`py-3 px-4 ${col.className || ""}`}>
                      {col.cell ? col.cell(row) : col.accessorKey ? String(row[col.accessorKey] ?? "") : ""}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-zinc-400">
                  <div className="flex flex-col items-center gap-2">
                    <Inbox className="w-8 h-8 text-zinc-300 stroke-[1.5]" />
                    <span className="font-medium">{emptyMessage}</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t border-zinc-100 text-xs text-zinc-500">
          <span>
            Showing <strong className="text-bloc-navy font-semibold">{(currentPage - 1) * pageSize + 1}</strong> to{" "}
            <strong className="text-bloc-navy font-semibold">
              {Math.min(currentPage * pageSize, filteredData.length)}
            </strong>{" "}
            of <strong className="text-bloc-navy font-semibold">{filteredData.length}</strong> entries
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-semibold text-bloc-navy">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
