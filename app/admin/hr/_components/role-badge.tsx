"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Stethoscope, Syringe, UserCheck, ShieldCheck } from "lucide-react";

type EmployeeRole = "DOCTOR" | "NURSE" | "RECEPTIONIST" | "ADMIN";

interface RoleBadgeProps {
  role: EmployeeRole;
  showIcon?: boolean;
}

const roleConfig: Record<
  EmployeeRole,
  {
    label: string;
    className: string;
    icon: React.ElementType;
  }
> = {
  DOCTOR: {
    label: "Doctor",
    className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    icon: Stethoscope,
  },
  NURSE: {
    label: "Nurse",
    className: "bg-green-100 text-green-800 hover:bg-green-100",
    icon: Syringe,
  },
  RECEPTIONIST: {
    label: "Receptionist",
    className: "bg-purple-100 text-purple-800 hover:bg-purple-100",
    icon: UserCheck,
  },
  ADMIN: {
    label: "Admin",
    className: "bg-red-100 text-red-800 hover:bg-red-100",
    icon: ShieldCheck,
  },
};

export function RoleBadge({ role, showIcon = true }: RoleBadgeProps) {
  const config = roleConfig[role];
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
