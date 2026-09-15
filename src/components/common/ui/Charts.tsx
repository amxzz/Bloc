"use client";

import React, { useState } from "react";

// --- HELPER: Cubic Bezier Spline Generator ---
function getSplinePath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  if (points.length === 2) return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

// --- 1. REFINED SPLINE AREA CHART (Executive Multi-Metric) ---
export interface SplineDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
}

interface SplineAreaChartProps {
  data: SplineDataPoint[];
  height?: number;
  valueFormatter?: (val: number) => string;
  title?: string;
  subtitle?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
}

export function SplineAreaChart({
  data,
  height = 240,
  valueFormatter = (v) => String(v),
  title,
  subtitle,
  primaryLabel = "Gross Revenue",
  secondaryLabel = "Net Profit",
}: SplineAreaChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const padding = { top: 20, right: 24, bottom: 32, left: 48 };
  const width = 600;
  const chartHeight = 200;

  const maxVal = Math.max(...data.map((d) => Math.max(d.value, d.secondaryValue || 0))) * 1.15 || 1;

  // Coordinate mapping
  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1)) * (width - padding.left - padding.right);
    const y = padding.top + (1 - d.value / maxVal) * (chartHeight - padding.top - padding.bottom);
    return { x, y, val: d.value, label: d.label };
  });

  const secPoints = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1)) * (width - padding.left - padding.right);
    const y =
      padding.top + (1 - (d.secondaryValue || 0) / maxVal) * (chartHeight - padding.top - padding.bottom);
    return { x, y, val: d.secondaryValue || 0, label: d.label };
  });

  const lineD = getSplinePath(points);
  const secLineD = getSplinePath(secPoints);

  const zeroY = chartHeight - padding.bottom;
  const areaD = `${lineD} L ${points[points.length - 1].x} ${zeroY} L ${points[0].x} ${zeroY} Z`;

  // Y-axis grid markers
  const yTicks = [0, 0.33, 0.66, 1].map((pct) => {
    const val = maxVal * pct;
    const y = padding.top + (1 - pct) * (chartHeight - padding.top - padding.bottom);
    return { val, y };
  });

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4 select-none">
      {(title || subtitle) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            {title && <h3 className="font-bold text-slate-900 text-sm tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2D3D6E]" />
              <span className="text-slate-700 text-xs font-semibold">{primaryLabel}</span>
            </div>
            {data.some((d) => d.secondaryValue !== undefined) && (
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#7F85D1]" />
                <span className="text-slate-700 text-xs font-semibold">{secondaryLabel}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SVG Container with true aspect ratio */}
      <div className="relative w-full" style={{ height: `${height}px` }}>
        <svg
          viewBox={`0 0 ${width} ${chartHeight}`}
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id="splineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2D3D6E" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#2D3D6E" stopOpacity="0.01" />
            </linearGradient>
            <filter id="dotShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#2D3D6E" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Horizontal Grid Lines */}
          {yTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={padding.left}
                y1={tick.y}
                x2={width - padding.right}
                y2={tick.y}
                stroke="#E2E8F0"
                strokeDasharray={i === 0 ? "0" : "3 3"}
                strokeWidth="1"
              />
              <text
                x={padding.left - 8}
                y={tick.y + 3}
                fill="#94A3B8"
                fontSize="9"
                fontFamily="inherit"
                fontWeight="600"
                textAnchor="end"
              >
                {valueFormatter(tick.val)}
              </text>
            </g>
          ))}

          {/* Shaded Area */}
          <path d={areaD} fill="url(#splineGradient)" />

          {/* Secondary Line (Dashed) */}
          {data.some((d) => d.secondaryValue !== undefined) && (
            <path
              d={secLineD}
              fill="none"
              stroke="#7F85D1"
              strokeWidth="2"
              strokeDasharray="4 4"
              strokeLinecap="round"
            />
          )}

          {/* Primary Line (Solid) */}
          <path
            d={lineD}
            fill="none"
            stroke="#2D3D6E"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Hover Vertical Guide */}
          {hoveredIdx !== null && (
            <line
              x1={points[hoveredIdx].x}
              y1={padding.top}
              x2={points[hoveredIdx].x}
              y2={zeroY}
              stroke="#CBD5E1"
              strokeDasharray="2 2"
              strokeWidth="1.5"
            />
          )}

          {/* X Axis Labels & Interactive Circles */}
          {points.map((p, idx) => (
            <g key={idx} className="cursor-pointer">
              {/* Secondary Point Dot */}
              {secPoints[idx] && (
                <circle
                  cx={secPoints[idx].x}
                  cy={secPoints[idx].y}
                  r={hoveredIdx === idx ? 4 : 2.5}
                  fill="#FFFFFF"
                  stroke="#7F85D1"
                  strokeWidth="2"
                />
              )}

              {/* Primary Point Dot */}
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIdx === idx ? 5.5 : 3.5}
                fill="#FFFFFF"
                stroke="#2D3D6E"
                strokeWidth="2.5"
                filter={hoveredIdx === idx ? "url(#dotShadow)" : undefined}
                className="transition-all duration-150"
              />

              {/* X-axis Label */}
              <text
                x={p.x}
                y={chartHeight - 8}
                fill={hoveredIdx === idx ? "#2D3D6E" : "#64748B"}
                fontSize="10"
                fontFamily="inherit"
                fontWeight={hoveredIdx === idx ? "700" : "500"}
                textAnchor="middle"
              >
                {p.label}
              </text>

              {/* Transparent hit area */}
              <rect
                x={p.x - 20}
                y={padding.top}
                width="40"
                height={chartHeight - padding.top - padding.bottom}
                fill="transparent"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            </g>
          ))}
        </svg>

        {/* Floating Tooltip Card */}
        {hoveredIdx !== null && (
          <div
            className="absolute z-20 pointer-events-none bg-slate-900 text-white rounded-xl py-2 px-3 shadow-xl text-xs space-y-1 transform -translate-x-1/2 -translate-y-full animate-in fade-in duration-150"
            style={{
              left: `${(points[hoveredIdx].x / width) * 100}%`,
              top: `${Math.min(points[hoveredIdx].y - 12, 100)}px`,
            }}
          >
            <p className="font-bold text-[11px] text-slate-300 border-b border-white/10 pb-1">
              {data[hoveredIdx].label}
            </p>
            <div className="flex items-center justify-between gap-3 text-[11px]">
              <span className="text-slate-400">{primaryLabel}:</span>
              <span className="font-mono font-bold text-[#F0E79D]">
                {valueFormatter(data[hoveredIdx].value)}
              </span>
            </div>
            {data[hoveredIdx].secondaryValue !== undefined && (
              <div className="flex items-center justify-between gap-3 text-[11px]">
                <span className="text-slate-400">{secondaryLabel}:</span>
                <span className="font-mono font-bold text-[#7F85D1]">
                  {valueFormatter(data[hoveredIdx].secondaryValue || 0)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// --- 2. MANAGER OPERATIONS EFFICIENCY CHART ---
export interface BatchVolumePoint {
  day: string;
  producedLiter: number;
  consumedLiter: number;
  wasteLiter?: number;
}

interface OperationsEfficiencyChartProps {
  data: BatchVolumePoint[];
  title?: string;
  subtitle?: string;
}

export function OperationsEfficiencyChart({
  data,
  title = "Batch Production vs Sales Consumption (7-Day)",
  subtitle = "Daily liters produced in Kitchen vs dispensed at Cashier Orders",
}: OperationsEfficiencyChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxVal = Math.max(...data.map((d) => Math.max(d.producedLiter, d.consumedLiter))) * 1.2 || 1;

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <h3 className="font-bold text-slate-900 text-sm tracking-tight">{title}</h3>
          <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#2D3D6E]" />
            <span className="text-slate-700 font-semibold text-[11px]">Produced (L)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#7F85D1]" />
            <span className="text-slate-700 font-semibold text-[11px]">Sold (L)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 pt-2 h-44 items-end">
        {data.map((item, idx) => {
          const prodHeight = (item.producedLiter / maxVal) * 100;
          const soldHeight = (item.consumedLiter / maxVal) * 100;
          const isHovered = hoveredIdx === idx;

          return (
            <div
              key={idx}
              className="flex flex-col items-center justify-end h-full relative cursor-pointer group"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {isHovered && (
                <div className="absolute -top-12 z-20 bg-slate-900 text-white text-[10px] font-medium py-1 px-2.5 rounded-lg shadow-md whitespace-nowrap animate-in fade-in">
                  <p className="font-bold">{item.day}</p>
                  <p className="text-blue-200">Produced: {item.producedLiter} L</p>
                  <p className="text-[#7F85D1]">Sold: {item.consumedLiter} L</p>
                </div>
              )}

              <div className="w-full flex items-end justify-center gap-1 h-full pb-1">
                <div
                  className="w-3.5 bg-[#2D3D6E] rounded-t-sm transition-all duration-300 group-hover:brightness-110"
                  style={{ height: `${Math.max(6, prodHeight)}%` }}
                />
                <div
                  className="w-3.5 bg-[#7F85D1] rounded-t-sm transition-all duration-300 group-hover:brightness-110"
                  style={{ height: `${Math.max(6, soldHeight)}%` }}
                />
              </div>

              <span className="text-[10px] font-semibold text-slate-500 mt-1">{item.day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- 3. DUAL-TONE BAR CHART ---
export function BarChart({
  data,
  height = 200,
  valueFormatter = (v) => String(v),
  title,
  subtitle,
}: SplineAreaChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const maxValue = Math.max(...data.map((d) => Math.max(d.value, d.secondaryValue || 0))) || 1;

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4 select-none">
      {(title || subtitle) && (
        <div className="flex justify-between items-start pb-3 border-b border-slate-100">
          <div>
            {title && <h3 className="font-bold text-slate-900 text-sm tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2D3D6E]" />
              <span className="text-slate-600 text-xs font-semibold">Expected</span>
            </div>
            {data.some((d) => d.secondaryValue !== undefined) && (
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#7F85D1]" />
                <span className="text-slate-600 text-xs font-semibold">Actual</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="relative" style={{ height: `${height}px` }}>
        <div className="absolute inset-0 flex items-end justify-between gap-3 pt-6 z-10">
          {data.map((item, idx) => {
            const barHeightPct = (item.value / maxValue) * 100;
            const secBarHeightPct = item.secondaryValue ? (item.secondaryValue / maxValue) * 100 : 0;
            const isHovered = hoveredIdx === idx;

            return (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center justify-end h-full relative group cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {isHovered && (
                  <div className="absolute -top-10 z-20 bg-slate-900 text-white text-[11px] font-medium py-1 px-2.5 rounded-md shadow-md whitespace-nowrap pointer-events-none animate-in fade-in">
                    <span>{item.label}: </span>
                    <span className="font-mono text-[#7F85D1] font-bold">{valueFormatter(item.value)}</span>
                  </div>
                )}

                <div className="w-full flex items-end justify-center gap-1.5 h-full">
                  <div
                    className="w-full max-w-[14px] bg-[#2D3D6E] rounded-full transition-all duration-300 group-hover:brightness-125"
                    style={{ height: `${Math.max(8, barHeightPct)}%` }}
                  />
                  {item.secondaryValue !== undefined && (
                    <div
                      className="w-full max-w-[14px] bg-[#7F85D1] rounded-full transition-all duration-300 group-hover:brightness-125"
                      style={{ height: `${Math.max(8, secBarHeightPct)}%` }}
                    />
                  )}
                </div>

                <span className="text-[11px] text-slate-500 font-medium mt-2 truncate w-full text-center">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// --- 4. RING DONUT CHART ---
interface DonutSlice {
  label: string;
  value: number;
  color?: string;
}

interface DonutChartProps {
  data: DonutSlice[];
  title?: string;
  subtitle?: string;
  centerLabel?: string;
  centerValue?: string;
}

const BRAND_DONUT_PALETTE = ["#2D3D6E", "#7F85D1", "#1E293B", "#64748B", "#94A3B8", "#CBD5E1"];

export function DonutChart({
  data,
  title,
  subtitle,
  centerLabel = "Net Margin",
  centerValue = "34.2%",
}: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;

  let cumulativeAngle = 0;
  const slices = data.map((d, idx) => {
    const angle = (d.value / total) * 360;
    const startAngle = cumulativeAngle;
    cumulativeAngle += angle;
    return {
      ...d,
      startAngle,
      angle,
      color: d.color || BRAND_DONUT_PALETTE[idx % BRAND_DONUT_PALETTE.length],
      percentage: Math.round((d.value / total) * 100),
    };
  });

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4 select-none">
      {(title || subtitle) && (
        <div className="pb-3 border-b border-slate-100">
          {title && <h3 className="font-bold text-slate-900 text-sm tracking-tight">{title}</h3>}
          {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-1">
        <div className="relative w-36 h-36 shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
            {slices.map((slice, idx) => {
              const strokeDasharray = `${(slice.angle / 360) * 263} 263`;
              const strokeDashoffset = -((slice.startAngle / 360) * 263);

              return (
                <circle
                  key={idx}
                  cx="50"
                  cy="50"
                  r="42"
                  fill="transparent"
                  stroke={slice.color}
                  strokeWidth="8"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                />
              );
            })}
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            {centerValue && <span className="text-2xl font-bold text-slate-900 font-mono leading-none">{centerValue}</span>}
            {centerLabel && <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-1">{centerLabel}</span>}
          </div>
        </div>

        <div className="space-y-2 flex-1 w-full text-xs">
          {slices.map((slice, idx) => (
            <div key={idx} className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: slice.color }} />
                <span className="font-medium text-slate-700 text-xs">{slice.label}</span>
              </div>
              <span className="font-mono font-bold text-slate-900 text-xs">{slice.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- 5. HORIZONTAL PROGRESS BAR DIAGRAM ---
export interface HorizontalBarData {
  label: string;
  sublabel?: string;
  value: number;
  max: number;
  formattedValue: string;
}

interface HorizontalBarDiagramProps {
  data: HorizontalBarData[];
  title?: string;
  subtitle?: string;
}

export function HorizontalBarDiagram({ data, title, subtitle }: HorizontalBarDiagramProps) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4 select-none">
      {(title || subtitle) && (
        <div className="pb-3 border-b border-slate-100">
          {title && <h3 className="font-bold text-slate-900 text-sm tracking-tight">{title}</h3>}
          {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
        </div>
      )}

      <div className="space-y-3.5">
        {data.map((item, idx) => {
          const pct = Math.min(100, Math.max(4, (item.value / item.max) * 100));

          return (
            <div key={idx} className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold text-white bg-[#2D3D6E] px-1.5 py-0.5 rounded-md">
                    #{idx + 1}
                  </span>
                  <span className="font-bold text-slate-800">{item.label}</span>
                  {item.sublabel && <span className="text-[11px] text-slate-400 font-medium">({item.sublabel})</span>}
                </div>
                <span className="font-mono font-semibold text-slate-700 text-xs">{item.formattedValue}</span>
              </div>

              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 bg-[#2D3D6E]"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
