"use client";

import { usePrescriptionByExam } from "@/hooks/queries/useMedicalExam";
import { useParams, useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { PrescriptionDetailView } from "@/app/admin/exams/_components/PrescriptionDetailView";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft } from "lucide-react";

export default function DoctorPrescriptionViewPage() {
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
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load prescription:{" "}
            {(error as any)?.message || "An unknown error occurred."}
            {(error as any)?.response?.status === 404 && (
              <p>No prescription found for this medical exam.</p>
            )}
          </AlertDescription>
        </Alert>
        <div className="flex justify-center mt-4">
          <Button onClick={() => router.push("/doctor/exams")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to My Exams
          </Button>
        </div>
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="container mx-auto py-10">
        <Alert>
          <AlertTitle>Not Found</AlertTitle>
          <AlertDescription>
            No prescription was found for this medical exam.
          </AlertDescription>
        </Alert>
        <div className="flex justify-center mt-4">
          <Button onClick={() => router.push("/doctor/exams")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to My Exams
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
        onClick={() => router.push(`/doctor/exams/${examId}`)}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Exam Details
      </Button>
      
      <PrescriptionDetailView
        prescription={prescription}
        userRole={user?.role as UserRole | undefined}
      />
    </div>
  );
}
