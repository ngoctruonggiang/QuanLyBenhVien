"use client";

import { Badge } from "@/components/ui/badge";
import { InvoiceStatus } from "@/interfaces/billing";
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
}

const statusConfig: Record<
  InvoiceStatus,
  {
    label: string;
    variant: "success" | "warning" | "error" | "secondary" | "info";
    icon: React.ElementType;
  }
> = {
  UNPAID: {
    label: "Unpaid",
    variant: "error",
    icon: Circle,
  },
  PARTIALLY_PAID: {
    label: "Partially Paid",
    variant: "warning",
    icon: CircleDashed,
  },
  PAID: {
    label: "Paid",
    variant: "success",
    icon: CheckCircle,
  },
  OVERDUE: {
    label: "Overdue",
    variant: "error",
    icon: AlertCircle,
  },
  CANCELLED: {
    label: "Cancelled",
    variant: "secondary",
    icon: XCircle,
  },
};

export function InvoiceStatusBadge({
  status,
  showIcon = true,
}: InvoiceStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant}>
      {showIcon && <Icon className="mr-1 h-3 w-3" />}
      {config.label}
    </Badge>
  );
}

