"use client";

import { Badge } from "@/components/ui/badge";
import { AppointmentStatus } from "@/interfaces/appointment";
import { Clock, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

const statusConfig: Record<
  AppointmentStatus,
  { label: string; className: string; icon: React.ReactNode }
> = {
  SCHEDULED: {
    label: "Scheduled",
    className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    icon: <Clock className="h-3 w-3" />,
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-green-100 text-green-800 hover:bg-green-100",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-red-100 text-red-800 hover:bg-red-100",
    icon: <XCircle className="h-3 w-3" />,
  },
  NO_SHOW: {
    label: "No Show",
    className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
    icon: <AlertTriangle className="h-3 w-3" />,
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
