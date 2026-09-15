"use client";

import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isUp?: boolean;
    isDown?: boolean;
  };
  icon?: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "navy";
}

export default function KpiCard({
  title,
  value,
  subtitle,
  trend,
  variant = "default",
}: KpiCardProps) {
  const isDanger = variant === "danger";
  const isWarning = variant === "warning";
  const isSuccess = variant === "success";

  return (
    <div
      className={`p-5 rounded-2xl border bg-white transition-all duration-200 shadow-2xs hover:shadow-sm select-none ${
        isDanger
          ? "border-rose-200/80 bg-rose-50/20"
          : isWarning
          ? "border-amber-200/80 bg-amber-50/20"
          : isSuccess
          ? "border-emerald-200/80 bg-emerald-50/20"
          : "border-slate-200/80 hover:border-slate-300"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">
          {title}
        </span>
        {trend && (
          <span
            className={`inline-flex items-center gap-1 font-mono font-bold px-2 py-0.5 rounded-full text-[10px] shrink-0 ${
              trend.isUp
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : trend.isDown
                ? "bg-rose-50 text-rose-700 border border-rose-200"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            {trend.isUp ? (
              <TrendingUp className="w-3 h-3 text-emerald-600" />
            ) : trend.isDown ? (
              <TrendingDown className="w-3 h-3 text-rose-600" />
            ) : (
              <Minus className="w-3 h-3 text-slate-500" />
            )}
            {trend.value}
          </span>
        )}
      </div>

      <div className="mt-3 space-y-0.5">
        <div
          className="text-2xl font-bold font-mono tracking-tight text-slate-900"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {value}
        </div>

        {subtitle && (
          <p className="text-xs text-slate-500 font-medium">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
