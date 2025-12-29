"use client";

import { ReactNode } from "react";
import { ArrowUpRight, TrendingUp, TrendingDown, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: string;
    direction: "up" | "down" | "neutral";
  };
  subtitle?: string;
  filterOptions?: string[];
  className?: string;
}

export function StatCard({
  title,
  value,
  icon,
  trend,
  subtitle,
  filterOptions,
  className,
}: StatCardProps) {
  return (
    <div className={cn("stat-card group", className)}>
      {/* Header */}
      <div className="stat-card-header">
        <p className="text-card-title">{title}</p>
        <div className="stat-arrow-icon group-hover:scale-110 transition-transform">
          <ArrowUpRight className="w-5 h-5" />
        </div>
      </div>

      {/* Filter Dropdown (optional) */}
      {filterOptions && (
        <div className="mt-2 mb-4">
          <select className="dropdown">
            {filterOptions.map((opt) => (
              <option key={opt}>{opt}</option>
            ))}
          </select>
        </div>
      )}

      {/* Main Content */}
      <div className="mt-4">
        {subtitle && (
          <div className="flex items-center justify-between mb-2">
            <span className="text-small">{subtitle}</span>
            <button className="p-1 hover:bg-[hsl(var(--secondary))] rounded">
              <MoreHorizontal className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
            </button>
          </div>
        )}
        
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-10 h-10 rounded-lg bg-[hsl(var(--primary-light))] flex items-center justify-center text-[hsl(var(--primary))]">
              {icon}
            </div>
          )}
          <div>
            <p className="stat-number">{value}</p>
            {trend && (
              <div className={cn(
                "flex items-center gap-1 text-xs font-medium",
                trend.direction === "up" && "text-green-600",
                trend.direction === "down" && "text-red-600",
                trend.direction === "neutral" && "text-[hsl(var(--muted-foreground))]"
              )}>
                {trend.direction === "up" && <TrendingUp className="w-3 h-3" />}
                {trend.direction === "down" && <TrendingDown className="w-3 h-3" />}
                <span>{trend.value}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Mini Stat Card for summary rows
interface MiniStatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  color?: "teal" | "green" | "orange" | "red" | "blue";
}

export function MiniStatCard({ label, value, icon, color = "teal" }: MiniStatCardProps) {
  const colorClasses = {
    teal: "bg-[hsl(var(--primary-light))] text-[hsl(var(--primary))]",
    green: "bg-green-100 text-green-600",
    orange: "bg-orange-100 text-orange-600",
    red: "bg-red-100 text-red-600",
    blue: "bg-blue-100 text-blue-600",
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary))]/80 transition-colors">
      {icon && (
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", colorClasses[color])}>
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[hsl(var(--foreground))] truncate">{label}</p>
      </div>
      <p className="text-lg font-bold text-[hsl(var(--foreground))]">{value}</p>
    </div>
  );
}

export default StatCard;
