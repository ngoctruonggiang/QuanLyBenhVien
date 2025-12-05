"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle, Calendar, XCircle } from "lucide-react";

type ScheduleStatus = "AVAILABLE" | "BOOKED" | "CANCELLED";

interface ScheduleStatusBadgeProps {
  status: ScheduleStatus;
  showIcon?: boolean;
  size?: "sm" | "md";
}

const statusConfig: Record<
  ScheduleStatus,
  {
    label: string;
    className: string;
    icon: React.ElementType;
  }
> = {
  AVAILABLE: {
    label: "Available",
    className: "bg-green-100 text-green-800 hover:bg-green-100",
    icon: CheckCircle,
  },
  BOOKED: {
    label: "Booked",
    className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    icon: Calendar,
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
    icon: XCircle,
  },
};

export function ScheduleStatusBadge({
  status,
  showIcon = true,
  size = "md",
}: ScheduleStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  const sizeClasses = {
    sm: "text-[10px] px-1.5 py-0",
    md: "text-xs px-2 py-0.5",
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "border-0 font-medium",
        config.className,
        sizeClasses[size]
      )}
    >
      {showIcon && (
        <Icon
          className={cn("mr-1", size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3")}
        />
      )}
      {config.label}
    </Badge>
  );
}
