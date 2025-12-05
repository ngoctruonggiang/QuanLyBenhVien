"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MedicalExamForm } from "../_components/medical-exam-form";
import { MedicalExamFormValues } from "@/lib/schemas/medical-exam";
import { useCreateMedicalExam } from "@/hooks/queries/useMedicalExam";
import { toast } from "sonner";

export default function NewMedicalExamPage() {
  const router = useRouter();
  const createExamMutation = useCreateMedicalExam();

  const handleSubmit = async (data: MedicalExamFormValues) => {
    try {
      await createExamMutation.mutateAsync({
        appointmentId: data.appointmentId,
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
      });
      toast.success("Medical exam created successfully");
      router.push("/admin/exams");
    } catch (error) {
      toast.error("Failed to create medical exam");
    }
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
              Create Medical Exam
            </h1>
            <p className="text-muted-foreground">
              Record vitals, diagnosis, and treatment plan.
            </p>
          </div>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Exam Details</CardTitle>
          <CardDescription>
            Enter the patient examination information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MedicalExamForm
            onSubmit={handleSubmit}
            isSubmitting={createExamMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
