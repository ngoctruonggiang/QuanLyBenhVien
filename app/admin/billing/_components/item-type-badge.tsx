"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Stethoscope, Pill, FlaskConical, FileText } from "lucide-react";

type ItemType = "CONSULTATION" | "MEDICINE" | "TEST" | "PROCEDURE" | "OTHER";

interface ItemTypeBadgeProps {
  type: ItemType;
  showIcon?: boolean;
}

const typeConfig: Record<
  ItemType,
  {
    label: string;
    className: string;
    icon: React.ElementType;
  }
> = {
  CONSULTATION: {
    label: "Consultation",
    className: "bg-purple-100 text-purple-800 hover:bg-purple-100",
    icon: Stethoscope,
  },
  MEDICINE: {
    label: "Medicine",
    className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    icon: Pill,
  },
  TEST: {
    label: "Test",
    className: "bg-cyan-100 text-cyan-800 hover:bg-cyan-100",
    icon: FlaskConical,
  },
  PROCEDURE: {
    label: "Procedure",
    className: "bg-indigo-100 text-indigo-800 hover:bg-indigo-100",
    icon: FileText,
  },
  OTHER: {
    label: "Other",
    className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
    icon: FileText,
  },
};

export function ItemTypeBadge({ type, showIcon = true }: ItemTypeBadgeProps) {
  const config = typeConfig[type];
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
