"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { SectorSummary } from "../types/portfolio.types";
import { cn } from "@/lib/utils";

interface SectorBarChartProps {
  sectors: SectorSummary[];
}

// Vibrant palette per sector — cycles if more sectors than colors
const SECTOR_COLORS = [
  "#B0F028", // Lime (brand accent)
  "#9B8AFB", // Purple
  "#93C5FD", // Pastel Blue
  "#FDE68A", // Yellow
  "#F4B6BA", // Soft Pink
  "#FB923C", // Orange
  "#C4B5FD", // Lavender
  "#6EE7B7", // Mint/Teal
];

function formatCrore(value: number): string {
  if (value >= 1e7) return `₹${(value / 1e7).toFixed(1)}Cr`;
  if (value >= 1e5) return `₹${(value / 1e5).toFixed(1)}L`;
  return `₹${(value / 1000).toFixed(0)}K`;
}

interface TooltipPayload {
  dataKey: string;
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  const inv = payload.find((p) => p.dataKey === "investment");
  const pv = payload.find((p) => p.dataKey === "presentValue");
  const gl = pv && inv ? pv.value - inv.value : 0;
  const isGain = gl >= 0;

  return (
    <div className="rounded-xl border border-border bg-bg-surface shadow-lg p-3 text-xs min-w-[160px]">
      <p className="font-semibold text-text-primary mb-2">{label}</p>
      {inv && (
        <div className="flex justify-between gap-6 text-text-secondary">
          <span>Invested</span>
          <span className="tabular-nums font-medium text-text-primary">
            {formatCrore(inv.value)}
          </span>
        </div>
      )}
      {pv && (
        <div className="flex justify-between gap-6 text-text-secondary">
          <span>Present</span>
          <span className="tabular-nums font-medium text-text-primary">
            {formatCrore(pv.value)}
          </span>
        </div>
      )}
      <div
        className={cn(
          "flex justify-between gap-6 mt-1.5 pt-1.5 border-t border-border font-semibold tabular-nums",
          isGain ? "text-positive" : "text-negative"
        )}
      >
        <span>G/L</span>
        <span>
          {isGain ? "+" : ""}
          {formatCrore(gl)}
        </span>
      </div>
    </div>
  );
}

export function SectorBarChart({ sectors }: SectorBarChartProps) {
  const data = sectors.map((s, i) => ({
    sector: s.sector.length > 12 ? s.sector.slice(0, 12) + "…" : s.sector,
    fullSector: s.sector,
    investment: s.totalInvestment,
    presentValue: s.totalPresentValue,
    colorIndex: i % SECTOR_COLORS.length,
  }));

  return (
    <div className="p-5 rounded-xl border border-border bg-bg-surface flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-text-primary tracking-tight">
            Invested vs Present Value
          </h3>
          <p className="text-xs text-text-muted mt-0.5">By sector</p>
        </div>
        {/* Custom legend — opaque = Present Value, faded = Invested */}
        <div className="flex items-center gap-3 text-[11px] text-text-muted shrink-0">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-text-muted opacity-50" />
            Invested
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-text-primary" />
            Present Value
          </span>
        </div>
      </div>

      <div className="flex-1 min-h-[220px]">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={data}
            margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
            barCategoryGap="30%"
            barGap={3}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--color-border)"
              strokeOpacity={0.5}
            />
            <XAxis
              dataKey="sector"
              tick={{ fontSize: 10, fill: "var(--color-text-muted)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatCrore}
              tick={{ fontSize: 10, fill: "var(--color-text-muted)" }}
              axisLine={false}
              tickLine={false}
              width={56}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--color-bg-surface-2)", opacity: 0.5 }} />

            {/* Investment bar — per-sector color, slightly transparent */}
            <Bar dataKey="investment" name="investment" radius={[3, 3, 0, 0]} maxBarSize={32}>
              {data.map((entry) => (
                <Cell
                  key={entry.fullSector}
                  fill={SECTOR_COLORS[entry.colorIndex]}
                  fillOpacity={0.45}
                />
              ))}
            </Bar>

            {/* Present Value bar — same sector color, full opacity */}
            <Bar dataKey="presentValue" name="presentValue" radius={[3, 3, 0, 0]} maxBarSize={32}>
              {data.map((entry) => (
                <Cell
                  key={entry.fullSector}
                  fill={SECTOR_COLORS[entry.colorIndex]}
                  fillOpacity={1}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
