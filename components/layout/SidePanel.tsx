"use client";

import { ReactNode } from "react";
import { X, Calendar, Users, Clock, ArrowUpRight } from "lucide-react";

interface SidePanelProps {
  title?: string;
  onClose?: () => void;
  children?: ReactNode;
}

export function SidePanel({ title = "Quick View", onClose, children }: SidePanelProps) {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[hsl(var(--border))]">
        <h3 className="text-section">{title}</h3>
        {onClose && (
          <button onClick={onClose} className="btn-icon">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto py-4">
        {children}
      </div>
    </div>
  );
}

// Example: Conference List Component (from design spec)
interface ConferenceItem {
  id: string;
  date: string;
  time: string;
  title: string;
  attendees: number;
}

interface ConferenceListProps {
  items: ConferenceItem[];
}

export function ConferenceList({ items }: ConferenceListProps) {
  return (
    <div className="space-y-4">
      {/* Alert Banner */}
      <div className="alert-banner">
        <span className="text-[hsl(var(--warning))]">⚠</span>
        <div className="flex-1">
          <p className="text-sm">Conference starting soon</p>
        </div>
        <button className="btn-primary text-xs py-1.5 px-3">Remind</button>
      </div>

      {/* Conference Items */}
      {items.map((item) => (
        <div
          key={item.id}
          className="p-4 rounded-xl border border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] transition-colors cursor-pointer"
        >
          <div className="flex items-start justify-between mb-2">
            <p className="text-small">{item.date}</p>
            <button className="text-[hsl(var(--primary))]">
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2 text-small text-[hsl(var(--muted-foreground))] mb-2">
            <Clock className="w-3 h-3" />
            <span>{item.time}</span>
          </div>
          <p className="text-body font-medium mb-3">{item.title}</p>
          <div className="avatar-group">
            {Array.from({ length: Math.min(item.attendees, 4) }).map((_, i) => (
              <div key={i} className="avatar w-6 h-6 text-xs">
                {String.fromCharCode(65 + i)}
              </div>
            ))}
            {item.attendees > 4 && (
              <div className="avatar w-6 h-6 text-xs bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]">
                +{item.attendees - 4}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Add Button */}
      <button className="btn-outline-icon w-full justify-center">
        <span className="text-lg">+</span>
        Make Conference
      </button>
    </div>
  );
}

// Example: Quick Stats Panel
interface QuickStat {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

interface QuickStatsProps {
  stats: QuickStat[];
}

export function QuickStats({ stats }: QuickStatsProps) {
  return (
    <div className="space-y-3">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="p-3 rounded-lg bg-[hsl(var(--secondary))] flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-lg bg-[hsl(var(--primary))] text-white flex items-center justify-center">
            {stat.icon}
          </div>
          <div className="flex-1">
            <p className="text-small">{stat.label}</p>
            <p className="text-lg font-semibold">{stat.value}</p>
          </div>
          {stat.trendValue && (
            <span
              className={`text-xs font-medium ${
                stat.trend === "up"
                  ? "text-green-600"
                  : stat.trend === "down"
                  ? "text-red-600"
                  : "text-gray-500"
              }`}
            >
              {stat.trend === "up" && "↑"}
              {stat.trend === "down" && "↓"}
              {stat.trendValue}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

export default SidePanel;
