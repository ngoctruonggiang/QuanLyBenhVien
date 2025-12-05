"use client";

import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import DepartmentForm from "../_components/DepartmentForm";
import { DepartmentRequest } from "@/interfaces/hr";
import { useDepartment, useUpdateDepartment } from "@/hooks/queries/useHr";

export default function DepartmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { data: department, isLoading: isFetching, error } = useDepartment(id);
  const updateDepartment = useUpdateDepartment();

  const handleSubmit = async (values: DepartmentRequest) => {
    updateDepartment.mutate(
      { id, data: values },
      {
        onSuccess: () => {
          router.push("/admin/hr/departments");
        },
        onError: (error) => {
          console.error("Failed to update department:", error);
          alert("Failed to update department. Please try again.");
        },
      }
    );
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !department) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Department not found</CardTitle>
            <CardDescription>
              The department you are looking for does not exist.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/admin/hr/departments")}>
              Back to list
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Edit Department
          </h1>
          <p className="text-muted-foreground">
            Update department details and head doctor.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/admin/hr/departments")}
        >
          Back
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Department Information</CardTitle>
          <CardDescription>Fields based on HR specification.</CardDescription>
        </CardHeader>
        <CardContent>
          <DepartmentForm
            initialData={department}
            onSubmit={handleSubmit}
            isLoading={updateDepartment.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
