"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface InfoItemProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  /** Color theme for icon background */
  color?: "sky" | "violet" | "teal" | "emerald" | "rose" | "amber" | "slate";
  /** If true, shows empty state styling when no value */
  showEmpty?: boolean;
  emptyText?: string;
  className?: string;
}

const colorStyles = {
  sky: "bg-sky-50 text-sky-600",
  violet: "bg-violet-50 text-violet-600",
  teal: "bg-teal-50 text-teal-600",
  emerald: "bg-emerald-50 text-emerald-600",
  rose: "bg-rose-50 text-rose-600",
  amber: "bg-amber-50 text-amber-600",
  slate: "bg-slate-50 text-slate-600",
};

export function InfoItem({
  icon,
  label,
  value,
  color = "slate",
  showEmpty = true,
  emptyText = "Not provided",
  className,
}: InfoItemProps) {
  const isEmpty = !value || value === "N/A" || value === "";
  const displayValue = isEmpty && showEmpty ? emptyText : value;

  return (
    <div className={cn("flex items-start gap-3", className)}>
      <div className={cn("p-2 rounded-lg shrink-0", colorStyles[color])}>
        {icon}
      </div>
      <div className="flex flex-col min-w-0">
        <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">
          {label}
        </p>
        <p
          className={cn(
            "font-medium text-slate-900 truncate",
            isEmpty && "text-slate-400 italic font-normal"
          )}
        >
          {displayValue}
        </p>
      </div>
    </div>
  );
}

interface InfoGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function InfoGrid({ children, columns = 2, className }: InfoGridProps) {
  const columnClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-4", columnClasses[columns], className)}>
      {children}
    </div>
  );
}
