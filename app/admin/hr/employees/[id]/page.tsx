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
import EmployeeForm from "../_components/EmployeeForm";
import { EmployeeRequest } from "@/interfaces/hr";
import { useEmployee, useUpdateEmployee } from "@/hooks/queries/useHr";

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { data: employee, isLoading: isFetching, error } = useEmployee(id);
  const updateEmployee = useUpdateEmployee();

  const handleSubmit = async (values: EmployeeRequest) => {
    updateEmployee.mutate(
      { id, data: values },
      {
        onSuccess: () => {
          router.push("/admin/hr/employees");
        },
        onError: (error) => {
          console.error("Failed to update employee:", error);
          alert("Failed to update employee. Please try again.");
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

  if (error || !employee) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Employee not found</CardTitle>
          <CardDescription>
            The employee you are looking for does not exist.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push("/admin/hr/employees")}>
            Back to list
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Edit Employee
          </h1>
          <p className="text-muted-foreground">
            Update profile, role, and account link.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/admin/hr/employees")}
        >
          Back
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Employee Information</CardTitle>
          <CardDescription>Fields follow HR specification.</CardDescription>
        </CardHeader>
        <CardContent>
          <EmployeeForm
            initialData={employee}
            onSubmit={handleSubmit}
            isLoading={updateEmployee.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
