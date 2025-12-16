"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface FilterPill {
  id: string;
  label: string;
  count?: number;
  icon?: ReactNode;
  /** Color for count badge */
  countColor?: "default" | "success" | "warning" | "danger";
}

interface FilterPillsProps {
  filters: FilterPill[];
  activeFilter: string;
  onFilterChange: (filterId: string) => void;
  className?: string;
}

const countColorStyles = {
  default: "bg-slate-200 text-slate-700",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-700",
};

export function FilterPills({
  filters,
  activeFilter,
  onFilterChange,
  className,
}: FilterPillsProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {filters.map((filter) => {
        const isActive = activeFilter === filter.id;
        return (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
              "border shadow-sm",
              isActive
                ? "bg-slate-900 text-white border-slate-900 shadow-md"
                : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
            )}
          >
            {filter.icon && <span className="opacity-70">{filter.icon}</span>}
            {filter.label}
            {filter.count !== undefined && (
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-semibold",
                  isActive
                    ? "bg-white/20 text-white"
                    : countColorStyles[filter.countColor || "default"]
                )}
              >
                {filter.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
