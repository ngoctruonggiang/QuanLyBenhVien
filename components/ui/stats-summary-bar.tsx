"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatItem {
  label: string;
  value: string | number;
  icon?: ReactNode;
  /** Color theme for the icon background */
  color?: "sky" | "violet" | "teal" | "emerald" | "rose" | "amber" | "slate";
  /** Optional trend indicator */
  trend?: "up" | "down" | "neutral";
}

interface StatsSummaryBarProps {
  stats: StatItem[];
  className?: string;
}

const colorStyles = {
  sky: "bg-sky-100 text-sky-600",
  violet: "bg-violet-100 text-violet-600",
  teal: "bg-teal-100 text-teal-600",
  emerald: "bg-emerald-100 text-emerald-600",
  rose: "bg-rose-100 text-rose-600",
  amber: "bg-amber-100 text-amber-600",
  slate: "bg-slate-100 text-slate-600",
};

export function StatsSummaryBar({ stats, className }: StatsSummaryBarProps) {
  return (
    <div
      className={cn(
        "grid gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm",
        `grid-cols-2 sm:grid-cols-${Math.min(stats.length, 4)} lg:grid-cols-${stats.length}`,
        className
      )}
      style={{
        gridTemplateColumns: `repeat(${Math.min(stats.length, 4)}, minmax(0, 1fr))`,
      }}
    >
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-slate-50",
            idx !== stats.length - 1 && "border-r border-slate-100 lg:border-r"
          )}
        >
          {stat.icon && (
            <div
              className={cn(
                "p-2.5 rounded-lg shrink-0",
                colorStyles[stat.color || "slate"]
              )}
            >
              {stat.icon}
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-slate-900">
              {stat.value}
            </span>
            <span className="text-xs text-slate-500 uppercase tracking-wide font-medium">
              {stat.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
