"use client";

import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, UserX } from "lucide-react";

type EmployeeStatus = "ACTIVE" | "ON_LEAVE" | "RESIGNED";

interface EmployeeStatusBadgeProps {
  status: EmployeeStatus;
  showIcon?: boolean;
}

const statusConfig: Record<
  EmployeeStatus,
  {
    label: string;
    variant: "success" | "warning" | "secondary";
    icon: React.ElementType;
  }
> = {
  ACTIVE: {
    label: "Active",
    variant: "success",
    icon: CheckCircle,
  },
  ON_LEAVE: {
    label: "On Leave",
    variant: "warning",
    icon: Clock,
  },
  RESIGNED: {
    label: "Resigned",
    variant: "secondary",
    icon: UserX,
  },
};

export function EmployeeStatusBadge({
  status,
  showIcon = true,
}: EmployeeStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant}>
      {showIcon && <Icon className="mr-1 h-3 w-3" />}
      {config.label}
    </Badge>
  );
}

