"use client";

import { useAuth } from "@/contexts/AuthContext";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { MedicalExamDetailView } from "../_components/MedicalExamDetailView";
import { useMedicalExam } from "@/hooks/queries/useMedicalExam";
import { useRouter, useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MedicalExamDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const { data: medicalExam, isLoading, isError, error: medicalExamError } = useMedicalExam(id as string);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load medical exam: {medicalExamError?.message || "An unknown error occurred."}
            {medicalExamError?.response?.status === 404 && (
              <p>The medical exam you are looking for does not exist.</p>
            )}
          </AlertDescription>
        </Alert>
        <div className="flex justify-center mt-4">
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  if (!medicalExam) {
    return (
      <div className="container mx-auto py-10">
        <Alert>
          <AlertTitle>Not Found</AlertTitle>
          <AlertDescription>
            The medical exam you are looking for does not exist.
          </AlertDescription>
        </Alert>
        <div className="flex justify-center mt-4">
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={["ADMIN", "DOCTOR", "NURSE"]}>
      <MedicalExamDetailView medicalExam={medicalExam} userRole={user?.role} />
    </RoleGuard>
  );
}