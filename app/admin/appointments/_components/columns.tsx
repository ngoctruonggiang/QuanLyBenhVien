"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Appointment } from "@/interfaces/appointment";
import { AppointmentStatusBadge } from "./appointment-status-badge";
import { AppointmentTypeBadge } from "./appointment-type-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Pencil, XCircle } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

interface ColumnActionsProps {
  appointment: Appointment;
  onCancel: (appointment: Appointment) => void;
}

function ColumnActions({ appointment, onCancel }: ColumnActionsProps) {
  const canEdit = appointment.status === "SCHEDULED";
  const canCancel = appointment.status === "SCHEDULED";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/admin/appointments/${appointment.id}`}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </Link>
        </DropdownMenuItem>
        {canEdit && (
          <DropdownMenuItem asChild>
            <Link href={`/admin/appointments/${appointment.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit / Reschedule
            </Link>
          </DropdownMenuItem>
        )}
        {canCancel && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onCancel(appointment)}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancel
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function getAppointmentColumns(
  onCancel: (appointment: Appointment) => void
): ColumnDef<Appointment>[] {
  return [
    {
      accessorKey: "patient",
      header: "Patient",
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
    },
    {
      accessorKey: "doctor",
      header: "Doctor",
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
    },
    {
      accessorKey: "appointmentTime",
      header: "Date & Time",
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
      header: "Status",
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
          <ColumnActions appointment={row.original} onCancel={onCancel} />
        </div>
      ),
    },
  ];
}
