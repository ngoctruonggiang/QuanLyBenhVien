"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import EmployeeForm from "../_components/EmployeeForm";
import { EmployeeRequest } from "@/interfaces/hr";
import { useCreateEmployee } from "@/hooks/queries/useHr";

export default function NewEmployeePage() {
  const router = useRouter();
  const createEmployee = useCreateEmployee();

  const handleSubmit = async (values: EmployeeRequest) => {
    createEmployee.mutate(values, {
      onSuccess: () => {
        router.push("/admin/hr/employees");
      },
      onError: (error) => {
        console.error("Failed to create employee:", error);
        alert("Failed to create employee. Please try again.");
      },
    });
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Add Employee
          </h1>
          <p className="text-muted-foreground">Create a new staff profile.</p>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Fill required fields</CardDescription>
        </CardHeader>
        <CardContent>
          <EmployeeForm
            onSubmit={handleSubmit}
            isLoading={createEmployee.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
