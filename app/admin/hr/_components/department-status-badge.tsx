"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle } from "lucide-react";

type DepartmentStatus = "ACTIVE" | "INACTIVE";

interface DepartmentStatusBadgeProps {
  status: DepartmentStatus;
  showIcon?: boolean;
}

const statusConfig: Record<
  DepartmentStatus,
  {
    label: string;
    className: string;
    icon: React.ElementType;
  }
> = {
  ACTIVE: {
    label: "Active",
    className: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
    icon: CheckCircle,
  },
  INACTIVE: {
    label: "Inactive",
    className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
    icon: XCircle,
  },
};

export function DepartmentStatusBadge({
  status,
  showIcon = true,
}: DepartmentStatusBadgeProps) {
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
