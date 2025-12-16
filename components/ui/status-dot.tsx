"use client";

import { cn } from "@/lib/utils";

interface StatusDotProps {
  /** Status determines the color */
  status: "active" | "inactive" | "warning" | "pending" | "success" | "error";
  /** Add pulse animation */
  pulse?: boolean;
  /** Size of the dot */
  size?: "sm" | "md" | "lg";
  /** Optional label to show next to the dot */
  label?: string;
  className?: string;
}

const statusColors = {
  active: "bg-emerald-500",
  inactive: "bg-slate-400",
  warning: "bg-amber-500",
  pending: "bg-sky-500",
  success: "bg-emerald-500",
  error: "bg-rose-500",
};

const sizeStyles = {
  sm: "w-2 h-2",
  md: "w-2.5 h-2.5",
  lg: "w-3 h-3",
};

export function StatusDot({
  status,
  pulse = false,
  size = "md",
  label,
  className,
}: StatusDotProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="relative flex">
        <span
          className={cn(
            "rounded-full",
            sizeStyles[size],
            statusColors[status],
            pulse && "animate-pulse"
          )}
        />
        {pulse && (
          <span
            className={cn(
              "absolute inset-0 rounded-full opacity-75 animate-ping",
              statusColors[status]
            )}
          />
        )}
      </span>
      {label && <span className="text-sm text-slate-700">{label}</span>}
    </span>
  );
}
