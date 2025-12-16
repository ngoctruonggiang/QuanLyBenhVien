"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description?: string;
  icon: ReactNode;
  /** Color for the timeline dot */
  color?: "sky" | "violet" | "teal" | "emerald" | "rose" | "amber" | "slate";
  /** Additional metadata badges/tags */
  badges?: ReactNode;
  /** Action element (e.g., "View" button) */
  action?: ReactNode;
}

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
  /** Show connecting line between events */
  showLine?: boolean;
}

const dotColorStyles = {
  sky: "bg-sky-500",
  violet: "bg-violet-500",
  teal: "bg-teal-500",
  emerald: "bg-emerald-500",
  rose: "bg-rose-500",
  amber: "bg-amber-500",
  slate: "bg-slate-400",
};

const iconBgStyles = {
  sky: "bg-sky-100 text-sky-600",
  violet: "bg-violet-100 text-violet-600",
  teal: "bg-teal-100 text-teal-600",
  emerald: "bg-emerald-100 text-emerald-600",
  rose: "bg-rose-100 text-rose-600",
  amber: "bg-amber-100 text-amber-600",
  slate: "bg-slate-100 text-slate-600",
};

export function Timeline({
  events,
  className,
  showLine = true,
}: TimelineProps) {
  if (events.length === 0) return null;

  return (
    <div className={cn("relative", className)}>
      {/* Vertical line */}
      {showLine && events.length > 1 && (
        <div className="absolute left-5 top-10 bottom-6 w-0.5 bg-slate-200" />
      )}

      <div className="space-y-6">
        {events.map((event, idx) => (
          <div key={event.id} className="relative flex gap-4">
            {/* Icon with dot */}
            <div className="relative shrink-0">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  iconBgStyles[event.color || "slate"]
                )}
              >
                {event.icon}
              </div>
              {/* Dot indicator on line */}
              {showLine && idx !== events.length - 1 && (
                <div
                  className={cn(
                    "absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full ring-2 ring-white",
                    dotColorStyles[event.color || "slate"]
                  )}
                />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pb-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs text-slate-500 font-medium mb-1">
                    {event.date}
                  </p>
                  <h4 className="font-semibold text-slate-900 truncate">
                    {event.title}
                  </h4>
                  {event.description && (
                    <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                      {event.description}
                    </p>
                  )}
                  {event.badges && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {event.badges}
                    </div>
                  )}
                </div>
                {event.action && (
                  <div className="shrink-0">{event.action}</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
