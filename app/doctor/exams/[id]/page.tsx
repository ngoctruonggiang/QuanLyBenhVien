"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Edit, FilePlus, Printer } from "lucide-react";
import { useMedicalExam } from "@/hooks/queries/useMedicalExam";
import { MedicalExamDetailView } from "@/app/admin/exams/_components/MedicalExamDetailView";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";
import { useMyEmployeeProfile } from "@/hooks/queries/useHr";
import { OrderLabTestDialog } from "@/components/lab/OrderLabTestDialog";

export default function DoctorMedicalExamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { data: medicalExam, isLoading, error, refetch } = useMedicalExam(id);
  
  // Get current doctor's employee profile for proper isCreator check
  const { data: myProfile } = useMyEmployeeProfile();
  const myEmployeeId = myProfile?.id || user?.employeeId;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" variant="muted" />
      </div>
    );
  }

  if (error || !medicalExam) {
    return (
      <div className="container mx-auto py-6">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-destructive">
            Medical Exam Not Found
          </h2>
          <p className="text-muted-foreground mt-2">
            The medical exam you're looking for doesn't exist or you don't have
            permission to view it.
          </p>
          <Button onClick={() => router.push("/doctor/exams")} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to My Exams
          </Button>
        </Card>
      </div>
    );
  }

  // Check if doctor is the creator using fetched employeeId
  const isCreator = medicalExam.doctor?.id === myEmployeeId;

  // Doctor can edit their own exams anytime (removed 24-hour restriction)
  // This allows updating diagnosis after receiving lab test results
  const isEditable = isCreator;

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Button
          variant="ghost"
          onClick={() => router.push("/doctor/exams")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Exams
        </Button>

        <div className="flex gap-2 flex-wrap">
          {/* Order Lab Test Button */}
          {isCreator && medicalExam.patient && (
            <OrderLabTestDialog
              medicalExamId={id}
              patientId={medicalExam.patient.id}
              patientName={medicalExam.patient.fullName || "Bệnh nhân"}
              onSuccess={() => refetch()}
            />
          )}

          {isEditable && (
            <Button asChild variant="outline">
              <Link href={`/doctor/exams/${id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Cập nhật Phiếu khám
              </Link>
            </Button>
          )}

          {isCreator && !medicalExam.prescription && (
            <Button asChild>
              <Link href={`/doctor/exams/${id}/prescription`}>
                <FilePlus className="mr-2 h-4 w-4" />
                Add Prescription
              </Link>
            </Button>
          )}

          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      {/* Medical Exam Detail */}
      <MedicalExamDetailView
        medicalExam={medicalExam}
        userRole="DOCTOR"
        patientProfileBaseHref="/doctor/patients"
        examBaseHref="/doctor/exams"
      />
    </div>
  );
}

