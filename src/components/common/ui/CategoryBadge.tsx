"use client";

import React from "react";

export type FlavorCategory =
  | "Milk"
  | "Chocolate"
  | "Fruit"
  | "Nuts"
  | "Peanut & Nuts"
  | "Dairy-Free"
  | "Dessert"
  | "Tea"
  | "Coffee"
  | "Specialty"
  | "Seasonal"
  | "Sorbet"
  | string;

interface CategoryBadgeProps {
  category: FlavorCategory;
  className?: string;
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  Milk: {
    bg: "bg-[#2D3D6E]/10",
    text: "text-[#2D3D6E]",
    border: "border-[#2D3D6E]/20",
    dot: "bg-[#2D3D6E]",
  },
  Chocolate: {
    bg: "bg-amber-950/10",
    text: "text-amber-950",
    border: "border-amber-950/20",
    dot: "bg-amber-900",
  },
  Fruit: {
    bg: "bg-[#A4231E]/10",
    text: "text-[#A4231E]",
    border: "border-[#A4231E]/20",
    dot: "bg-[#A4231E]",
  },
  Nuts: {
    bg: "bg-amber-900/10",
    text: "text-amber-900",
    border: "border-amber-900/20",
    dot: "bg-amber-800",
  },
  "Peanut & Nuts": {
    bg: "bg-amber-900/10",
    text: "text-amber-900",
    border: "border-amber-900/20",
    dot: "bg-amber-800",
  },
  "Dairy-Free": {
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-200",
    dot: "bg-emerald-600",
  },
  Dessert: {
    bg: "bg-indigo-50",
    text: "text-indigo-800",
    border: "border-indigo-200",
    dot: "bg-indigo-600",
  },
  Tea: {
    bg: "bg-teal-50",
    text: "text-teal-800",
    border: "border-teal-200",
    dot: "bg-teal-600",
  },
  Coffee: {
    bg: "bg-stone-100",
    text: "text-stone-800",
    border: "border-stone-300",
    dot: "bg-stone-700",
  },
  Specialty: {
    bg: "bg-[#7F85D1]/20",
    text: "text-[#2D3D6E]",
    border: "border-[#7F85D1]/40",
    dot: "bg-[#7F85D1]",
  },
  Seasonal: {
    bg: "bg-rose-50",
    text: "text-rose-800",
    border: "border-rose-200",
    dot: "bg-rose-600",
  },
  Sorbet: {
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-200",
    dot: "bg-emerald-600",
  },
};

export default function CategoryBadge({ category, className = "" }: CategoryBadgeProps) {
  const style = CATEGORY_STYLES[category] || {
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-200",
    dot: "bg-slate-500",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${style.bg} ${style.text} ${style.border} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {category}
    </span>
  );
}
