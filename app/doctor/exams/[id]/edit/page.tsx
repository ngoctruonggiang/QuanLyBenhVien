"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MedicalExamForm } from "@/app/admin/exams/_components/medical-exam-form";
import { MedicalExamFormValues } from "@/lib/schemas/medical-exam";
import { useMedicalExam, useUpdateMedicalExam } from "@/hooks/queries/useMedicalExam";
import { useAuth } from "@/contexts/AuthContext";
import { useMyEmployeeProfile } from "@/hooks/queries/useHr";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

export default function EditDoctorMedicalExamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { data: medicalExam, isLoading } = useMedicalExam(id);
  const updateExamMutation = useUpdateMedicalExam();
  
  // Get current doctor's employee profile for proper creator check
  const { data: myProfile } = useMyEmployeeProfile();
  const myEmployeeId = myProfile?.id || user?.employeeId;

  // Check permissions - doctor can edit their own exams anytime (removed PENDING restriction)
  const isCreator = medicalExam?.doctor?.id === myEmployeeId;

  useEffect(() => {
    if (medicalExam && myEmployeeId) {
      // Check if user is the creator
      if (medicalExam.doctor?.id !== myEmployeeId) {
        toast.error("Bạn không có quyền chỉnh sửa phiếu khám này");
        router.push(`/doctor/exams/${id}`);
      }
    }
  }, [medicalExam, myEmployeeId, id, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" variant="muted" />
      </div>
    );
  }

  if (!medicalExam) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive">
            Không tìm thấy phiếu khám
          </h2>
          <Button onClick={() => router.push("/doctor/exams")} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  if (!isCreator) {
    return (
      <div className="container mx-auto py-6 max-w-2xl">
        <Card className="p-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-amber-500" />
          <h2 className="mt-4 text-xl font-semibold">Không thể chỉnh sửa</h2>
          <p className="mt-2 text-muted-foreground">
            Bạn không có quyền chỉnh sửa phiếu khám này vì bạn không phải là người tạo.
          </p>
          <Button
            className="mt-4"
            onClick={() => router.push(`/doctor/exams/${id}`)}
          >
            Xem phiếu khám
          </Button>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (
    data: MedicalExamFormValues,
    status: "PENDING" | "FINALIZED"
  ) => {
    try {
      // Remove appointmentId from update request - cannot change appointment
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { appointmentId, ...updateData } = data;
      await updateExamMutation.mutateAsync({
        id,
        data: { ...updateData, status },
      });
      toast.success("Đã cập nhật phiếu khám thành công");
      router.push(`/doctor/exams/${id}`);
    } catch (error) {
      console.error("Failed to update medical exam:", error);
      toast.error("Cập nhật phiếu khám thất bại");
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push(`/doctor/exams/${id}`)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Button>
        <h1 className="text-2xl font-bold mt-4">Cập nhật Phiếu khám</h1>
        <p className="text-muted-foreground">
          Cập nhật chẩn đoán, điều trị dựa trên kết quả xét nghiệm
        </p>
        
        {/* Show current patient/doctor info */}
        <div className="mt-4 p-4 bg-muted rounded-lg space-y-2">
          <div className="flex items-center gap-4">
            <span className="font-medium">Bệnh nhân:</span>
            <span>{medicalExam.patient?.fullName}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-medium">Bác sĩ:</span>
            <span>{medicalExam.doctor?.fullName}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-medium">Ngày khám:</span>
            <span>{new Date(medicalExam.examDate).toLocaleDateString("vi-VN")}</span>
          </div>
        </div>
      </div>
      <MedicalExamForm
        defaultAppointmentId={medicalExam.appointment?.id}
        isEditMode={true}
        defaultValues={{
          appointmentId: medicalExam.appointment?.id || "",
          temperature: medicalExam.vitals?.temperature || 37,
          bloodPressureSystolic: medicalExam.vitals?.bloodPressureSystolic || 120,
          bloodPressureDiastolic: medicalExam.vitals?.bloodPressureDiastolic || 80,
          heartRate: medicalExam.vitals?.heartRate || 75,
          weight: medicalExam.vitals?.weight || 70,
          height: medicalExam.vitals?.height || 170,
          diagnosis: medicalExam.diagnosis || "",
          symptoms: medicalExam.symptoms || "",
          treatment: medicalExam.treatment || "",
          notes: medicalExam.notes || "",
          followUpDate: medicalExam.followUpDate ? new Date(medicalExam.followUpDate).toISOString().split('T')[0] : "",
        }}
        onSubmit={(data) => handleSubmit(data, (medicalExam.status as "PENDING" | "FINALIZED") || "PENDING")}
        onSubmitWithStatus={handleSubmit}
        isSubmitting={updateExamMutation.isPending}
        userRole="DOCTOR"
        currentExamStatus={medicalExam.status}
      />
    </div>
  );
}

