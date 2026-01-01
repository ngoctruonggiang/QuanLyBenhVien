"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { MedicalExamForm } from "@/app/admin/exams/_components/medical-exam-form";
import { MedicalExamFormValues } from "@/lib/schemas/medical-exam";
import { useCreateMedicalExam } from "@/hooks/queries/useMedicalExam";
import { useAppointment } from "@/hooks/queries/useAppointment";
import { useCompleteAppointment } from "@/hooks/queries/useQueue";
import { useAuth } from "@/contexts/AuthContext";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
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

function CreateMedicalExamPageClient() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("appointmentId");
  const createExamMutation = useCreateMedicalExam();
  const completeAppointmentMutation = useCompleteAppointment();
  const [showPrescriptionPrompt, setShowPrescriptionPrompt] = useState(false);
  const [createdExamId, setCreatedExamId] = useState<string | null>(null);

  // Fetch appointment details if appointmentId exists
  const { data: appointment, isLoading: isLoadingAppointment } = useAppointment(appointmentId || "");

  useEffect(() => {
    // Only doctors can create exams
    if (user && user.role !== "DOCTOR") {
      router.push("/");
    }
  }, [user, router]);

  // Check if appointment already has a medical exam - redirect to it
  useEffect(() => {
    if (appointment && appointment.medicalExamId) {
      toast.info("Appointment đã có phiếu khám. Đang chuyển đến trang chi tiết...");
      router.push(`/doctor/exams/${appointment.medicalExamId}`);
    }
  }, [appointment, router]);

  if (!user || user.role !== "DOCTOR") {
    return null;
  }

  // Show loading while checking if appointment has exam
  if (isLoadingAppointment && appointmentId) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Đang kiểm tra...</div>
      </div>
    );
  }

  // If appointment already has exam, show redirect message while useEffect handles redirect
  if (appointment?.medicalExamId) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">
          Appointment đã có phiếu khám. Đang chuyển hướng...
        </div>
      </div>
    );
  }

  const handleSubmit = async (
    data: MedicalExamFormValues,
    status: "PENDING" | "FINALIZED"
  ) => {
    try {
      const result = await createExamMutation.mutateAsync({
        data: {
          ...data,
          status,
        },
        doctorInfo: user?.employeeId
          ? { id: user.employeeId, fullName: user.fullName || "Doctor" }
          : undefined,
        patientInfo: appointment?.patient
          ? { id: appointment.patient.id, fullName: appointment.patient.fullName }
          : undefined,
      });

      const examId = result.id;
      toast.success("Medical exam created successfully");

      // Auto-complete the appointment if it exists
      if (appointmentId) {
        try {
          await completeAppointmentMutation.mutateAsync(appointmentId);
          console.log("Appointment auto-completed:", appointmentId);
        } catch (err) {
          // Non-critical error, just log it
          console.warn("Could not auto-complete appointment:", err);
        }
      }

      // Show prompt to add prescription
      setCreatedExamId(examId);
      setShowPrescriptionPrompt(true);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const handleAddPrescription = () => {
    if (createdExamId) {
      router.push(`/doctor/exams/${createdExamId}/prescription`);
    }
  };

  const handleViewExam = () => {
    if (createdExamId) {
      router.push(`/doctor/exams/${createdExamId}`);
    }
  };

  return (
    <>
      <div className="container mx-auto py-6">
        <MedicalExamForm
          onSubmit={(data) => handleSubmit(data, "PENDING")}
          onSubmitWithStatus={handleSubmit}
          isSubmitting={createExamMutation.isPending}
          userRole="DOCTOR"
          defaultAppointmentId={appointmentId || undefined}
          appointment={appointment}
        />
      </div>

      <AlertDialog
        open={showPrescriptionPrompt}
        onOpenChange={setShowPrescriptionPrompt}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add Prescription?</AlertDialogTitle>
            <AlertDialogDescription>
              Medical exam created successfully. Would you like to add a
              prescription for this exam now?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleViewExam}>
              Later
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleAddPrescription}>
              Add Prescription
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default function CreateMedicalExamPage() {
  return (
    <Suspense fallback={<div className="p-6" />}>
      <CreateMedicalExamPageClient />
    </Suspense>
  );
}
