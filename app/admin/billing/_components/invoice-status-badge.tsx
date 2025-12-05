"use client";

import { Badge } from "@/components/ui/badge";
import { InvoiceStatus } from "@/interfaces/billing";
import { cn } from "@/lib/utils";
import {
  Circle,
  CheckCircle,
  AlertCircle,
  XCircle,
  CircleDashed,
} from "lucide-react";

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
}

const statusConfig: Record<
  InvoiceStatus,
  {
    label: string;
    className: string;
    icon: React.ElementType;
  }
> = {
  UNPAID: {
    label: "Unpaid",
    className: "bg-red-100 text-red-800 hover:bg-red-100",
    icon: Circle,
  },
  PARTIALLY_PAID: {
    label: "Partially Paid",
    className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    icon: CircleDashed,
  },
  PAID: {
    label: "Paid",
    className: "bg-green-100 text-green-800 hover:bg-green-100",
    icon: CheckCircle,
  },
  OVERDUE: {
    label: "Overdue",
    className: "bg-orange-100 text-orange-800 hover:bg-orange-100",
    icon: AlertCircle,
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
    icon: XCircle,
  },
};

export function InvoiceStatusBadge({
  status,
  showIcon = true,
  size = "md",
}: InvoiceStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-0.5",
    lg: "text-base px-4 py-1",
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
      {showIcon && <Icon className="mr-1 h-3 w-3" />}
      {config.label}
    </Badge>
  );
}
