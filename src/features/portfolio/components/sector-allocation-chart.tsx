"use client";

import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { SectorSummary } from "../types/portfolio.types";
import { formatINR, formatPercent } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface SectorAllocationChartProps {
  sectors: SectorSummary[];
  compact?: boolean;
}

// Strictly vibrant, distinct hues — no grey shades
const SECTOR_PALETTE = [
  { hex: "#B0F028", bgClass: "bg-[#B0F028]" }, // Lime
  { hex: "#8257FF", bgClass: "bg-[#8257FF]" }, // Purple
  { hex: "#B0D7FF", bgClass: "bg-[#B0D7FF]" }, // Pastel Blue
  { hex: "#FFDE49", bgClass: "bg-[#FFDE49]" }, // Yellow
  { hex: "#F4B6BA", bgClass: "bg-[#F4B6BA]" }, // Soft Pink
  { hex: "#FF8A48", bgClass: "bg-[#FF8A48]" }, // Orange
  { hex: "#A78BFA", bgClass: "bg-[#A78BFA]" }, // Lavender
  { hex: "#2DD4BF", bgClass: "bg-[#2DD4BF]" }, // Mint / Teal
];

export function SectorAllocationChart({ sectors, compact = false }: SectorAllocationChartProps) {
  const chartData = sectors.map((s, index) => {
    const paletteItem = SECTOR_PALETTE[index % SECTOR_PALETTE.length];
    return {
      name: s.sector,
      value: s.totalPresentValue,
      weight: s.portfolioWeight,
      color: paletteItem.hex,
      bgClass: paletteItem.bgClass,
    };
  });

  return (
    <div className={cn(compact ? "p-4" : "p-5", "rounded-xl border border-border bg-bg-surface flex flex-col h-full")}>
      <div className={cn("flex items-center justify-between", compact ? "mb-2.5" : "mb-4")}>
        <div>
          <h3 className="text-sm font-semibold text-text-primary tracking-tight">
            Sector Allocation
          </h3>
          <p className="text-xs text-text-muted mt-0.5">Valuation distribution across sectors</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center flex-1">
        <div className={cn(compact ? "h-44" : "h-52", "w-full")}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={compact ? 44 : 55}
                outerRadius={compact ? 66 : 80}
                paddingAngle={3}
                dataKey="value"
                stroke="var(--bg-surface)"
                strokeWidth={2}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border border-border bg-bg-surface p-2.5 shadow-md text-xs">
                        <div className="font-semibold text-text-primary">{data.name}</div>
                        <div className="text-text-secondary mt-1">
                          Value: <span className="font-medium text-text-primary tabular-nums">{formatINR(data.value)}</span>
                        </div>
                        <div className="text-text-muted">
                          Weight: <span className="font-medium tabular-nums">{formatPercent(data.weight, { showSign: false })}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend list */}
        <div className={cn(compact ? "flex flex-col gap-1 justify-center text-[11px]" : "flex flex-col gap-2 justify-center")}>
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className={cn("w-2.5 h-2.5 rounded-xs shrink-0", item.bgClass)}
                />
                <span className={cn("font-medium text-text-secondary truncate", compact ? "max-w-[105px]" : "max-w-[140px]")}>
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-right shrink-0">
                <span className="text-text-muted tabular-nums">
                  {formatPercent(item.weight, { showSign: false })}
                </span>
                <span className="font-semibold text-text-primary tabular-nums">
                  {formatINR(item.value)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
