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
    className: "bg-primary/10 text-primary hover:bg-primary/15",
    icon: <STATUS_ICONS.appointments.waiting className="h-3 w-3" />,
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-primary/10 text-primary hover:bg-primary/15",
    icon: <STATUS_ICONS.appointments.completed className="h-3 w-3" />,
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-destructive/10 text-destructive hover:bg-destructive/15",
    icon: <STATUS_ICONS.appointments.cancelled className="h-3 w-3" />,
  },
  NO_SHOW: {
    label: "No Show",
    className: "bg-secondary text-foreground hover:bg-secondary/80",
    icon: <STATUS_ICONS.appointments.noShow className="h-3 w-3" />,
  },
};

interface AppointmentStatusBadgeProps {
  status: AppointmentStatus;
}

export function AppointmentStatusBadge({
  status,
}: AppointmentStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant="secondary" className={`gap-1 ${config.className}`}>
      {config.icon}
      {config.label}
    </Badge>
  );
}
