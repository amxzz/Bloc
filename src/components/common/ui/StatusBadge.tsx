"use client";

import React from "react";
import { TubStatus } from "@/types/kitchen";

interface TubStatusBadgeProps {
  status: TubStatus;
  size?: "sm" | "md";
}

export function TubStatusBadge({ status, size = "md" }: TubStatusBadgeProps) {
  const isSm = size === "sm";

  const config = {
    NORMAL: {
      label: "NORMAL",
      classes: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
      dot: "bg-emerald-500",
    },
    LOW: {
      label: "LOW",
      classes: "bg-amber-50 text-amber-800 border-amber-200/80",
      dot: "bg-amber-500",
    },
    CRITICAL: {
      label: "CRITICAL",
      classes: "bg-rose-50 text-rose-700 border-rose-200/80 animate-pulse",
      dot: "bg-rose-500",
    },
    EMPTY: {
      label: "EMPTY",
      classes: "bg-slate-100 text-slate-500 border-slate-200",
      dot: "bg-slate-400",
    },
    EXPIRED: {
      label: "EXPIRED",
      classes: "bg-purple-50 text-purple-700 border-purple-200",
      dot: "bg-purple-500",
    },
  }[status] || {
    label: status,
    classes: "bg-slate-100 text-slate-600 border-slate-200",
    dot: "bg-slate-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-bold uppercase tracking-wider rounded-full border ${
        config.classes
      } ${isSm ? "px-2 py-0.5 text-[9px]" : "px-2.5 py-1 text-[10px]"}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
}
