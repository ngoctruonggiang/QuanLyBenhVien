"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
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
    className: string;
    icon: React.ElementType;
  }
> = {
  ACTIVE: {
    label: "Active",
    className: "bg-green-100 text-green-800 hover:bg-green-100",
    icon: CheckCircle,
  },
  ON_LEAVE: {
    label: "On Leave",
    className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    icon: Clock,
  },
  RESIGNED: {
    label: "Resigned",
    className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
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
    <Badge
      variant="outline"
      className={cn("border-0 font-medium text-xs", config.className)}
    >
      {showIcon && <Icon className="mr-1 h-3 w-3" />}
      {config.label}
    </Badge>
  );
}
