"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DepartmentForm from "../_components/DepartmentForm";
import { DepartmentRequest } from "@/interfaces/hr";
import { useCreateDepartment } from "@/hooks/queries/useHr";

export default function NewDepartmentPage() {
  const router = useRouter();
  const createDepartment = useCreateDepartment();

  const handleSubmit = async (values: DepartmentRequest) => {
    createDepartment.mutate(values, {
      onSuccess: () => {
        router.push("/admin/hr/departments");
      },
      onError: (error) => {
        console.error("Failed to create department:", error);
        alert("Failed to create department. Please try again.");
      },
    });
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Add Department
          </h1>
          <p className="text-muted-foreground">
            Create a new department record.
          </p>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>Fill required fields</CardDescription>
        </CardHeader>
        <CardContent>
          <DepartmentForm
            initialData={undefined}
            onSubmit={handleSubmit}
            isLoading={createDepartment.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
