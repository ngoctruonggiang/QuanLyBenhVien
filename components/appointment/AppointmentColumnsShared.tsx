"use client";

import { Column, ColumnDef } from "@tanstack/react-table";
import { Appointment } from "@/interfaces/appointment";
import { AppointmentStatusBadge } from "@/app/admin/appointments/_components/appointment-status-badge";
import { AppointmentTypeBadge } from "@/app/admin/appointments/_components/appointment-type-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Eye,
  Pencil,
  XCircle,
  ArrowUpDown,
  CheckCircle,
  Activity,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";


type UserRole = "ADMIN" | "DOCTOR" | "NURSE" | "PATIENT";

interface ColumnActionsProps {
  appointment: Appointment;
  role: UserRole;
  userRole?: string; // Actual user role from auth context
  onCancel: (appointment: Appointment) => void;
  onComplete: (appointment: Appointment) => void;
  onEdit: (appointment: Appointment) => void;
  onVitalSigns?: (appointment: Appointment) => void;
}

function ColumnActions({
  appointment,
  role,
  userRole,
  onCancel,
  onComplete,
  onEdit,
  onVitalSigns,
}: ColumnActionsProps) {
  const canEdit =
    (role === "ADMIN" || role === "NURSE") &&
    appointment.status === "SCHEDULED";
  const canCancel = appointment.status === "SCHEDULED"; // All roles can cancel their own appointments
  const canComplete =
    (role === "ADMIN" || role === "DOCTOR") &&
    appointment.status === "SCHEDULED";
  
  // Check if user is actually a NURSE (for vital signs)
  const isNurse = userRole === "NURSE";

  const basePath = role === "ADMIN" ? "/admin" : `/${role.toLowerCase()}`;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`${basePath}/appointments/${appointment.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </Link>
          </DropdownMenuItem>

          {canEdit && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onEdit(appointment);
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit / Reschedule
            </DropdownMenuItem>
          )}

          {/* Nurse: Vital Signs action */}
          {isNurse && appointment.status === "SCHEDULED" && onVitalSigns && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onVitalSigns(appointment);
              }}
            >
              <Activity className="mr-2 h-4 w-4" />
              Điền Vital Signs
            </DropdownMenuItem>
          )}

          {canComplete && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onComplete(appointment);
              }}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark as Completed
            </DropdownMenuItem>
          )}

          {canCancel && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onCancel(appointment);
                }}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Cancel
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

// Helper component for sortable headers
const SortableHeader = <TData,>({
  column,
  children,
}: {
  column: Column<TData, unknown>;
  children: React.ReactNode;
}) => {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {children}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
};

export function getAppointmentColumnsByRole(
  role: UserRole,
  onCancel: (appointment: Appointment) => void,
  onComplete: (appointment: Appointment) => void,
  onEdit: (appointment: Appointment) => void,
  userRole?: string,
  onVitalSigns?: (appointment: Appointment) => void
): ColumnDef<Appointment>[] {
  const columns: ColumnDef<Appointment>[] = [];

  // Patient column - hide for PATIENT role
  if (role !== "PATIENT") {
    columns.push({
      accessorKey: "patient.fullName",
      header: ({ column }) => (
        <SortableHeader column={column}>Patient</SortableHeader>
      ),
      cell: ({ row }) => {
        const patient = row.original.patient;
        return (
          <div>
            <div className="font-medium">{patient.fullName}</div>
            {patient.phoneNumber && (
              <div className="text-sm text-muted-foreground">
                {patient.phoneNumber}
              </div>
            )}
          </div>
        );
      },
    });
  }

  // Doctor column - hide for DOCTOR role
  if (role !== "DOCTOR") {
    columns.push({
      accessorKey: "doctor.fullName",
      header: ({ column }) => (
        <SortableHeader column={column}>Doctor</SortableHeader>
      ),
      cell: ({ row }) => {
        const doctor = row.original.doctor;
        return (
          <div>
            <div className="font-medium">{doctor.fullName}</div>
            {doctor.department && (
              <div className="text-sm text-muted-foreground">
                {doctor.department}
              </div>
            )}
          </div>
        );
      },
    });
  }

  // Common columns for all roles
  columns.push(
    {
      accessorKey: "appointmentTime",
      header: ({ column }) => (
        <SortableHeader column={column}>Date & Time</SortableHeader>
      ),
      cell: ({ row }) => {
        const dateTime = new Date(row.getValue("appointmentTime"));
        return (
          <div>
            <div className="font-medium">{format(dateTime, "MMM d, yyyy")}</div>
            <div className="text-sm text-muted-foreground">
              {format(dateTime, "h:mm a")}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => <AppointmentTypeBadge type={row.getValue("type")} />,
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <SortableHeader column={column}>Status</SortableHeader>
      ),
      cell: ({ row }) => (
        <AppointmentStatusBadge status={row.getValue("status")} />
      ),
    },
    {
      accessorKey: "reason",
      header: "Reason",
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate text-muted-foreground">
          {row.getValue("reason") || "-"}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <ColumnActions
            appointment={row.original}
            role={role}
            userRole={userRole}
            onCancel={onCancel}
            onComplete={onComplete}
            onEdit={onEdit}
            onVitalSigns={onVitalSigns}
          />
        </div>
      ),
    }
  );

  return columns;
}
