"use client";

import { useParams, useRouter } from "next/navigation";
import {
  useCreatePrescription,
  useMedicalExam,
} from "@/hooks/queries/useMedicalExam";
import { PrescriptionForm } from "../../_components/prescription-form";
import { PrescriptionFormValues } from "@/lib/schemas/medical-exam";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CreatePrescriptionPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: exam, isLoading } = useMedicalExam(id);
  const { mutateAsync: createPrescription, isPending } =
    useCreatePrescription();

  const onSubmit = async (data: PrescriptionFormValues) => {
    try {
      await createPrescription({
        examId: id,
        data: {
          items: data.items.map((item) => ({
            medicineId: item.medicineId,
            quantity: item.quantity,
            dosage: item.dosage,
            durationDays: parseInt(item.duration) || undefined,
            instructions: item.notes,
          })),
          notes: data.notes,
        },
      });
      toast.success("Prescription created successfully");
      router.push(`/admin/exams/${id}`);
    } catch (error) {
      toast.error("Failed to create prescription");
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">
          Loading exam details...
        </span>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <p className="text-muted-foreground">Medical Exam not found</p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  // Check if prescription already exists
  if (exam.prescription) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <p className="text-muted-foreground">
          This exam already has a prescription
        </p>
        <Button
          variant="outline"
          onClick={() => router.push(`/admin/exams/${id}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> View Exam
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Create Prescription
          </h1>
          <p className="text-muted-foreground">
            Patient: {exam.patient.fullName} • Doctor: {exam.doctor.fullName}
          </p>
        </div>
      </div>

      {/* Exam Summary */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Exam Summary</CardTitle>
          <CardDescription>
            Reference information from the examination
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Diagnosis</p>
            <p className="font-medium">{exam.diagnosis || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Treatment</p>
            <p className="font-medium">{exam.treatment || "—"}</p>
          </div>
        </CardContent>
      </Card>

      {/* Prescription Form */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Prescription Details</CardTitle>
          <CardDescription>Add medicines to the prescription</CardDescription>
        </CardHeader>
        <CardContent>
          <PrescriptionForm onSubmit={onSubmit} isSubmitting={isPending} />
        </CardContent>
      </Card>
    </div>
  );
}
