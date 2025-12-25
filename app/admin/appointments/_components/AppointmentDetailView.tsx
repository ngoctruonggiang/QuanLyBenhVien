"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowLeft,
  Pencil,
  XCircle,
  CheckCircle2,
  User,
  Stethoscope,
  Calendar,
  FileText,
  Clock,
  Phone,
  Building2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StatsSummaryBar } from "@/components/ui/stats-summary-bar";
import { InfoItem, InfoGrid } from "@/components/ui/info-item";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  useCancelAppointment,
  useCompleteAppointment,
} from "@/hooks/queries/useAppointment";
import {
  AppointmentStatusBadge,
  AppointmentTypeBadge,
  CancelAppointmentDialog,
} from ".";
import { Appointment } from "@/interfaces/appointment";
import { Spinner } from "@/components/ui/spinner";

interface AppointmentDetailViewProps {
  appointment: Appointment;
  user: {
    email: string;
    role: string;
    fullName?: string;
    employeeId?: string;
    patientId?: string;
    department?: string;
  } | null;
  backHref: string;
  editHref?: string;
  createExamHref?: string;
  viewExamHref?: string;
  patientProfileBaseHref?: string; // Base path for patient profile link (default: /admin/patients)
}

export function AppointmentDetailView({
  appointment,
  user,
  backHref,
  editHref,
  createExamHref,
  viewExamHref,
  patientProfileBaseHref = "/admin/patients",
}: AppointmentDetailViewProps) {
  const router = useRouter();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);

  const cancelMutation = useCancelAppointment(user?.employeeId, user?.role);
  const completeMutation = useCompleteAppointment(user?.employeeId, user?.role);

  const isScheduled = appointment.status === "SCHEDULED";
  const canEdit =
    isScheduled &&
    ["ADMIN", "NURSE", "RECEPTIONIST", "DOCTOR"].includes(user?.role || "");
  const canCancel =
    isScheduled &&
    ["ADMIN", "NURSE", "RECEPTIONIST", "DOCTOR", "PATIENT"].includes(
      user?.role || ""
    );
  const canComplete =
    isScheduled &&
    (user?.role === "ADMIN" ||
      (user?.role === "DOCTOR" && user?.employeeId === appointment.doctor.id));

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: format(date, "EEEE, MMMM d, yyyy"),
      time: format(date, "h:mm a"),
    };
  };

  const { date, time } = formatDateTime(appointment.appointmentTime);

  const handleConfirmCancel = (reason: string) => {
    cancelMutation.mutate(
      { id: appointment.id, data: { cancelReason: reason } },
      {
        onSuccess: () => {
          setCancelDialogOpen(false);
        },
      }
    );
  };

  const handleConfirmComplete = () => {
    completeMutation.mutate(appointment.id, {
      onSuccess: () => {
        setCompleteDialogOpen(false);
        if (createExamHref) {
          router.push(createExamHref);
        }
      },
    });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Violet Gradient Header */}
      <div className="relative rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 p-6 text-white overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-white" />
        </div>
        
        <div className="relative flex items-start justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Back button */}
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="text-white/90 hover:text-white hover:bg-white/20 shrink-0"
            >
              <Link href={backHref}>
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            
            {/* Icon */}
            <div className="h-16 w-16 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            
            {/* Title & Meta */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">Appointment Details</h1>
                <AppointmentStatusBadge status={appointment.status} />
              </div>
              <p className="text-white/80 text-sm font-medium">
                {date} at {time}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <AppointmentTypeBadge type={appointment.type} />
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {canEdit && editHref && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <Link href={editHref}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Reschedule
                </Link>
              </Button>
            )}
            {canComplete && (
              <Button
                size="sm"
                onClick={() => setCompleteDialogOpen(true)}
                className="bg-white text-violet-600 hover:bg-white/90"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Complete
              </Button>
            )}
            {canCancel && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setCancelDialogOpen(true)}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <StatsSummaryBar
        stats={[
          {
            label: "Patient",
            value: appointment.patient.fullName,
            icon: <User className="h-5 w-5" />,
            color: "violet",
          },
          {
            label: "Doctor",
            value: appointment.doctor.fullName,
            icon: <Stethoscope className="h-5 w-5" />,
            color: "sky",
          },
          {
            label: "Date",
            value: date.split(",")[1]?.trim() || date,
            icon: <Calendar className="h-5 w-5" />,
            color: "teal",
          },
          {
            label: "Time",
            value: time,
            icon: <Clock className="h-5 w-5" />,
            color: "amber",
          },
        ]}
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Patient Information */}
        <div className="detail-section-card">
          <div className="detail-section-card-header">
            <User className="h-4 w-4" />
            <h3>Patient Information</h3>
          </div>
          <div className="detail-section-card-content">
            <InfoGrid columns={1}>
              <InfoItem
                icon={<User className="h-4 w-4" />}
                label="Name"
                value={appointment.patient.fullName}
                color="violet"
              />
              {appointment.patient.phoneNumber && (
                <InfoItem
                  icon={<Phone className="h-4 w-4" />}
                  label="Phone"
                  value={appointment.patient.phoneNumber}
                  color="teal"
                />
              )}
            </InfoGrid>
            <div className="pt-3 mt-3 border-t">
              <Button
                variant="link"
                className="h-auto p-0 text-primary"
                asChild
              >
                <Link href={`${patientProfileBaseHref}/${appointment.patient.id}`}>
                  View Patient Profile →
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Doctor Information */}
        <div className="detail-section-card">
          <div className="detail-section-card-header">
            <Stethoscope className="h-4 w-4" />
            <h3>Doctor Information</h3>
          </div>
          <div className="detail-section-card-content">
            <InfoGrid columns={1}>
              <InfoItem
                icon={<Stethoscope className="h-4 w-4" />}
                label="Name"
                value={appointment.doctor.fullName}
                color="sky"
              />
              {appointment.doctor.department && (
                <InfoItem
                  icon={<Building2 className="h-4 w-4" />}
                  label="Department"
                  value={appointment.doctor.department}
                  color="violet"
                />
              )}
              {appointment.doctor.specialization && (
                <InfoItem
                  icon={<FileText className="h-4 w-4" />}
                  label="Specialization"
                  value={appointment.doctor.specialization}
                  color="teal"
                />
              )}
            </InfoGrid>
          </div>
        </div>
      </div>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            Appointment Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-medium">{date}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Time</p>
              <p className="font-medium">{time}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Type</p>
              <div className="pt-1">
                <AppointmentTypeBadge type={appointment.type} />
              </div>
            </div>
          </div>
          <Separator />
          <div>
            <p className="text-sm text-muted-foreground">Reason for Visit</p>
            <p className="mt-1">{appointment.reason}</p>
          </div>
          {appointment.notes && (
            <div>
              <p className="text-sm text-muted-foreground">Notes</p>
              <p className="mt-1">{appointment.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
      {appointment.status === "CANCELLED" && appointment.cancelledAt && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-destructive">
              <XCircle className="h-5 w-5" />
              Cancellation Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Cancelled At</p>
              <p className="font-medium">
                {format(
                  new Date(appointment.cancelledAt),
                  "MMMM d, yyyy 'at' h:mm a"
                )}
              </p>
            </div>
            {appointment.cancelReason && (
              <div>
                <p className="text-sm text-muted-foreground">Reason</p>
                <p className="mt-1">{appointment.cancelReason}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      {appointment.status === "COMPLETED" && (
        <Card className="border-green-500/50 bg-green-50/50 dark:bg-green-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-green-700 dark:text-green-400">
              <FileText className="h-5 w-5" />
              Medical Examination
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {appointment.medicalExamId && viewExamHref ? (
                <Button asChild>
                  <Link href={viewExamHref}>View Medical Exam Record</Link>
                </Button>
              ) : createExamHref ? (
                <Button asChild>
                  <Link href={createExamHref}>Create Medical Exam</Link>
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-muted-foreground" />
            Audit Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="font-medium">
                {format(
                  new Date(appointment.createdAt),
                  "MMM d, yyyy 'at' h:mm a"
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="font-medium">
                {format(
                  new Date(appointment.updatedAt),
                  "MMM d, yyyy 'at' h:mm a"
                )}
                {appointment.updatedBy && (
                  <span className="text-muted-foreground">
                    {" "}
                    by {appointment.updatedBy}
                  </span>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <CancelAppointmentDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        onConfirm={handleConfirmCancel}
        isLoading={cancelMutation.isPending}
      />
      <AlertDialog
        open={completeDialogOpen}
        onOpenChange={setCompleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark as Completed?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the appointment as completed. You can then create a
              medical exam record for this appointment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={completeMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmComplete}
              disabled={completeMutation.isPending}
            >
              {completeMutation.isPending && (
                <Spinner size="sm" className="mr-2" />
              )}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
