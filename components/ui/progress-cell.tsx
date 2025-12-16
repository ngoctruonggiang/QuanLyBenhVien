"use client";

import { cn } from "@/lib/utils";

interface ProgressCellProps {
  /** Current value */
  value: number;
  /** Maximum value */
  max: number;
  /** Show percentage or fraction */
  display?: "percent" | "fraction" | "value" | "none";
  /** Color theme based on percentage thresholds */
  colorMode?: "static" | "threshold";
  /** Static color */
  color?: "sky" | "teal" | "emerald" | "amber" | "rose" | "violet";
  /** Low threshold (shows warning color below this) */
  lowThreshold?: number;
  /** Critical threshold (shows danger color below this) */
  criticalThreshold?: number;
  /** Width of the progress bar container */
  width?: string;
  className?: string;
}

const colorStyles = {
  sky: "bg-sky-500",
  teal: "bg-teal-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  violet: "bg-violet-500",
};

export function ProgressCell({
  value,
  max,
  display = "fraction",
  colorMode = "threshold",
  color = "emerald",
  lowThreshold = 30,
  criticalThreshold = 10,
  width = "w-20",
  className,
}: ProgressCellProps) {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  
  // Determine color based on mode
  let barColor = colorStyles[color];
  if (colorMode === "threshold") {
    if (percentage <= criticalThreshold) {
      barColor = "bg-rose-500";
    } else if (percentage <= lowThreshold) {
      barColor = "bg-amber-500";
    } else {
      barColor = "bg-emerald-500";
    }
  }

  // Format display text
  let displayText = "";
  switch (display) {
    case "percent":
      displayText = `${Math.round(percentage)}%`;
      break;
    case "fraction":
      displayText = `${value}/${max}`;
      break;
    case "value":
      displayText = `${value}`;
      break;
    case "none":
      break;
  }

  return (
    <div className={cn("flex flex-col gap-1", width, className)}>
      {/* Progress bar */}
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-300", barColor)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {/* Display text */}
      {display !== "none" && (
        <span className="text-xs text-slate-500 text-center">{displayText}</span>
      )}
    </div>
  );
}
