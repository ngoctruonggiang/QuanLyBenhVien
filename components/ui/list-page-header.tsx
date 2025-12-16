"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

interface StatItem {
  label: string;
  value: string | number;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

interface ListPageHeaderProps {
  /** Page title */
  title: string;
  /** Subtitle/description */
  description?: string;
  /** Theme color */
  theme?: "sky" | "violet" | "teal" | "emerald" | "rose" | "amber";
  /** Stats to display */
  stats?: StatItem[];
  /** Icon to display */
  icon?: ReactNode;
  /** Primary action button */
  primaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: ReactNode;
  };
  /** Secondary actions */
  secondaryActions?: ReactNode;
  className?: string;
}

const themeStyles = {
  sky: "from-sky-500 to-cyan-500",
  violet: "from-violet-500 to-purple-500",
  teal: "from-teal-500 to-emerald-500",
  emerald: "from-emerald-500 to-green-500",
  rose: "from-rose-500 to-pink-500",
  amber: "from-amber-500 to-orange-500",
};

export function ListPageHeader({
  title,
  description,
  theme = "sky",
  stats,
  icon,
  primaryAction,
  secondaryActions,
  className,
}: ListPageHeaderProps) {
  return (
    <div
      className={cn(
        "relative rounded-xl bg-gradient-to-r p-6 text-white overflow-hidden",
        themeStyles[theme],
        className
      )}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-white" />
      </div>

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            {icon && (
              <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                {icon}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
              {description && (
                <p className="text-white/80 text-sm mt-0.5">{description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {secondaryActions}
            {primaryAction && (
              primaryAction.href ? (
                <Button
                  asChild
                  className="bg-white text-slate-900 hover:bg-white/90 shadow-lg"
                >
                  <Link href={primaryAction.href}>
                    {primaryAction.icon || <Plus className="h-4 w-4 mr-2" />}
                    {primaryAction.label}
                  </Link>
                </Button>
              ) : (
                <Button
                  onClick={primaryAction.onClick}
                  className="bg-white text-slate-900 hover:bg-white/90 shadow-lg"
                >
                  {primaryAction.icon || <Plus className="h-4 w-4 mr-2" />}
                  {primaryAction.label}
                </Button>
              )
            )}
          </div>
        </div>

        {/* Stats */}
        {stats && stats.length > 0 && (
          <div className="flex flex-wrap gap-6 mt-5 pt-5 border-t border-white/20">
            {stats.map((stat, idx) => (
              <div key={idx} className="min-w-[80px]">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-white/70 uppercase tracking-wide">
                  {stat.label}
                </p>
                {stat.trendValue && (
                  <p className={cn(
                    "text-xs mt-0.5",
                    stat.trend === "up" && "text-emerald-200",
                    stat.trend === "down" && "text-red-200",
                    stat.trend === "neutral" && "text-white/60"
                  )}>
                    {stat.trend === "up" && "↑ "}
                    {stat.trend === "down" && "↓ "}
                    {stat.trendValue}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
