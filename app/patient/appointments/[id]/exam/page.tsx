"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useMedicalExamByAppointment } from "@/hooks/queries/useMedicalExam";
import { PatientExamDetailView } from "./_components/PatientExamDetailView";

export default function PatientExamPage() {
  const params = useParams();
  const appointmentId = params.id as string;

  const { user } = useAuth();
  const {
    data: medicalExam,
    isLoading,
    error,
  } = useMedicalExamByAppointment(appointmentId);

  if (isLoading) {
    return (
      <div className="page-shell space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error || !medicalExam) {
    return (
      <div className="page-shell text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
        <h2 className="mt-4 text-xl font-semibold">
          Medical Exam Not Available
        </h2>
        <p className="mt-2 text-muted-foreground">
          The medical exam for this appointment has not been created or
          finalized by the doctor yet.
        </p>
        <Button className="mt-4" asChild>
          <Link href="/patient/appointments">Back to My Appointments</Link>
        </Button>
      </div>
    );
  }

  // Security check: Ensure the logged-in patient is viewing their own exam
  if (user?.role === "PATIENT" && user?.patientId !== medicalExam.patient.id) {
    return (
      <div className="page-shell text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
        <h2 className="mt-4 text-xl font-semibold">Access Denied</h2>
        <p className="mt-2 text-muted-foreground">
          You are not authorized to view this medical exam.
        </p>
        <Button className="mt-4" asChild>
          <Link href="/patient/appointments">Back to My Appointments</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="page-shell space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/patient/appointments">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Exam Result</h1>
        </div>
      </div>
      <PatientExamDetailView medicalExam={medicalExam} />
    </div>
  );
}
