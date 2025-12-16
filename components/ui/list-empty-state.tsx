"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Package,
  Users,
  Calendar,
  Receipt,
  Pill,
  FileText,
  Search,
  Plus,
} from "lucide-react";
import Link from "next/link";

interface ListEmptyStateProps {
  /** Type of entity for default icon/messages */
  type?: "patients" | "appointments" | "medicines" | "invoices" | "employees" | "exams" | "generic";
  /** Custom icon (overrides type default) */
  icon?: ReactNode;
  /** Main title */
  title?: string;
  /** Description text */
  description?: string;
  /** Primary action */
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  /** Whether this is a search empty state */
  isSearchResult?: boolean;
  /** Search query that produced no results */
  searchQuery?: string;
  className?: string;
}

const typeDefaults: Record<string, { icon: ReactNode; title: string; description: string; actionLabel: string }> = {
  patients: {
    icon: <Users className="h-12 w-12" />,
    title: "No patients found",
    description: "Get started by adding your first patient to the system.",
    actionLabel: "Add Patient",
  },
  appointments: {
    icon: <Calendar className="h-12 w-12" />,
    title: "No appointments scheduled",
    description: "Schedule an appointment to get started.",
    actionLabel: "New Appointment",
  },
  medicines: {
    icon: <Pill className="h-12 w-12" />,
    title: "No medicines in inventory",
    description: "Add medicines to your inventory to track stock.",
    actionLabel: "Add Medicine",
  },
  invoices: {
    icon: <Receipt className="h-12 w-12" />,
    title: "No invoices yet",
    description: "Invoices will appear here after medical exams are completed.",
    actionLabel: "View Appointments",
  },
  employees: {
    icon: <Users className="h-12 w-12" />,
    title: "No employees found",
    description: "Add employees to manage your hospital staff.",
    actionLabel: "Add Employee",
  },
  exams: {
    icon: <FileText className="h-12 w-12" />,
    title: "No medical exams",
    description: "Medical exams will appear after appointments are completed.",
    actionLabel: "View Appointments",
  },
  generic: {
    icon: <Package className="h-12 w-12" />,
    title: "No data found",
    description: "There's nothing here yet.",
    actionLabel: "Add New",
  },
};

export function ListEmptyState({
  type = "generic",
  icon,
  title,
  description,
  action,
  isSearchResult = false,
  searchQuery,
  className,
}: ListEmptyStateProps) {
  const defaults = typeDefaults[type];

  if (isSearchResult) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-16 px-4", className)}>
        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <Search className="h-10 w-10 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-1">
          No results found
        </h3>
        <p className="text-slate-500 text-center max-w-md">
          {searchQuery ? (
            <>
              No matches for "<span className="font-medium text-slate-700">{searchQuery}</span>". 
              Try adjusting your search or filters.
            </>
          ) : (
            "Try adjusting your search or filters to find what you're looking for."
          )}
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-4", className)}>
      {/* Illustration circle */}
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
          <div className="text-slate-400">
            {icon || defaults.icon}
          </div>
        </div>
        {/* Decorative dots */}
        <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-sky-200" />
        <div className="absolute -bottom-1 -left-3 w-3 h-3 rounded-full bg-violet-200" />
        <div className="absolute top-1/2 -right-4 w-2 h-2 rounded-full bg-emerald-200" />
      </div>

      <h3 className="text-xl font-semibold text-slate-900 mb-2">
        {title || defaults.title}
      </h3>
      <p className="text-slate-500 text-center max-w-md mb-6">
        {description || defaults.description}
      </p>

      {action && (
        action.href ? (
          <Button asChild>
            <Link href={action.href}>
              <Plus className="h-4 w-4 mr-2" />
              {action.label}
            </Link>
          </Button>
        ) : (
          <Button onClick={action.onClick}>
            <Plus className="h-4 w-4 mr-2" />
            {action.label}
          </Button>
        )
      )}
    </div>
  );
}
