"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MedicalExamForm } from "../../_components/medical-exam-form";
import { MedicalExamFormValues } from "@/lib/schemas/medical-exam";
import { useMedicalExam, useUpdateMedicalExam } from "@/hooks/queries/useMedicalExam";
import { toast } from "sonner";

// Check if exam is within 24-hour edit window
const isEditable = (createdAt: string) => {
  const created = new Date(createdAt);
  const now = new Date();
  const diffHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
  return diffHours <= 24;
};

// Calculate remaining time for edit window
const getTimeRemaining = (createdAt: string) => {
  const created = new Date(createdAt);
  const deadline = new Date(created.getTime() + 24 * 60 * 60 * 1000);
  const now = new Date();
  const diff = deadline.getTime() - now.getTime();
  if (diff <= 0) return null;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
};

export default function EditMedicalExamPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: exam, isLoading, error } = useMedicalExam(params.id);
  const updateExamMutation = useUpdateMedicalExam();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading exam details...</span>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <p className="text-muted-foreground">Exam not found</p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  const canEdit = isEditable(exam.createdAt);
  const timeRemaining = getTimeRemaining(exam.createdAt);

  if (!canEdit) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <p className="text-muted-foreground">
          This exam can no longer be edited. The 24-hour edit window has passed.
        </p>
        <Button variant="outline" onClick={() => router.push(`/admin/exams/${exam.id}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> View Exam
        </Button>
      </div>
    );
  }

  const handleSubmit = async (data: MedicalExamFormValues) => {
    try {
      await updateExamMutation.mutateAsync({
        id: exam.id,
        data: {
          diagnosis: data.diagnosis,
          symptoms: data.symptoms,
          treatment: data.treatment,
          temperature: data.temperature,
          bloodPressureSystolic: data.bloodPressureSystolic,
          bloodPressureDiastolic: data.bloodPressureDiastolic,
          heartRate: data.heartRate,
          weight: data.weight,
          height: data.height,
          notes: data.notes,
        },
      });
      toast.success("Medical exam updated successfully");
      router.push(`/admin/exams/${exam.id}`);
    } catch (error) {
      toast.error("Failed to update medical exam");
    }
  };

  const defaultValues: Partial<MedicalExamFormValues> = {
    appointmentId: exam.appointment.id,
    diagnosis: exam.diagnosis || "",
    symptoms: exam.symptoms || "",
    treatment: exam.treatment || "",
    temperature: exam.vitals?.temperature,
    bloodPressureSystolic: exam.vitals?.bloodPressureSystolic,
    bloodPressureDiastolic: exam.vitals?.bloodPressureDiastolic,
    heartRate: exam.vitals?.heartRate,
    weight: exam.vitals?.weight,
    height: exam.vitals?.height,
    notes: exam.notes || "",
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Edit Medical Exam
            </h1>
            <p className="text-muted-foreground">
              Patient: {exam.patient.fullName}
            </p>
          </div>
        </div>
        {timeRemaining && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {timeRemaining} left to edit
          </Badge>
        )}
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Update Exam Details</CardTitle>
          <CardDescription>
            Modify the examination information. Changes are allowed within 24 hours of creation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MedicalExamForm
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            isSubmitting={updateExamMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
