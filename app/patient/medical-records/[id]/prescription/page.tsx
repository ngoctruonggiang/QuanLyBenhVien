"use client";

import { usePrescriptionByExam } from "@/hooks/queries/useMedicalExam";
import { useParams, useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { PrescriptionDetailView } from "@/app/admin/exams/_components/PrescriptionDetailView";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft, Pill } from "lucide-react";

export default function PatientPrescriptionViewPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const examId = params.id as string;

  const {
    data: prescription,
    isLoading,
    isError,
    error,
  } = usePrescriptionByExam(examId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="lg" className="text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertTitle>Lỗi</AlertTitle>
          <AlertDescription>
            Không thể tải đơn thuốc:{" "}
            {(error as any)?.message || "Đã xảy ra lỗi không xác định."}
            {(error as any)?.response?.status === 404 && (
              <p>Không tìm thấy đơn thuốc cho lần khám này.</p>
            )}
          </AlertDescription>
        </Alert>
        <div className="flex justify-center mt-4">
          <Button onClick={() => router.push("/patient/medical-records")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại hồ sơ khám
          </Button>
        </div>
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="container mx-auto py-10">
        <Alert>
          <Pill className="h-4 w-4" />
          <AlertTitle>Không tìm thấy</AlertTitle>
          <AlertDescription>
            Không có đơn thuốc nào cho lần khám này.
          </AlertDescription>
        </Alert>
        <div className="flex justify-center mt-4">
          <Button onClick={() => router.push("/patient/medical-records")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại hồ sơ khám
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      {/* Back button */}
      <Button
        variant="ghost"
        onClick={() => router.push(`/patient/medical-records/${examId}`)}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Quay lại chi tiết khám
      </Button>
      
      {/* Prescription view - Patient role hides cost details and dispense button */}
      <PrescriptionDetailView
        prescription={prescription}
        userRole="PATIENT"
      />
    </div>
  );
}
