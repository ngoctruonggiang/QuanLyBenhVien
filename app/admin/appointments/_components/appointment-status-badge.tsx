"use client";

import { Badge } from "@/components/ui/badge";
import { STATUS_ICONS } from "@/config/icons";
import { AppointmentStatus } from "@/interfaces/appointment";

const statusConfig: Record<
  AppointmentStatus,
  { label: string; className: string; icon: React.ReactNode }
> = {
  SCHEDULED: {
    label: "Scheduled",
    className: "bg-blue-100 text-blue-800 border-blue-200",
    icon: <STATUS_ICONS.appointments.waiting className="h-3 w-3" />,
  },
  IN_PROGRESS: {
    label: "In Progress",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: <STATUS_ICONS.appointments.inProgress className="h-3 w-3" />,
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-green-100 text-green-800 border-green-200",
    icon: <STATUS_ICONS.appointments.completed className="h-3 w-3" />,
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-red-100 text-red-800 border-red-200",
    icon: <STATUS_ICONS.appointments.cancelled className="h-3 w-3" />,
  },
  NO_SHOW: {
    label: "No Show",
    className: "bg-gray-100 text-gray-800 border-gray-200",
    icon: <STATUS_ICONS.appointments.noShow className="h-3 w-3" />,
  },
};

// Fallback config for unknown statuses
const fallbackConfig = {
  label: "Unknown",
  className: "bg-gray-100 text-gray-600 border-gray-200",
  icon: null,
};

interface AppointmentStatusBadgeProps {
  status: AppointmentStatus;
}

export function AppointmentStatusBadge({
  status,
}: AppointmentStatusBadgeProps) {
  const config = statusConfig[status] || fallbackConfig;

  return (
    <Badge variant="outline" className={`gap-1 ${config.className}`}>
      {config.icon}
      {config.label}
    </Badge>
  );
}
