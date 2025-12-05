"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { useDebounce } from "@/hooks/useDebounce";
import {
  useEmployees,
  useDeleteEmployee,
  useDepartments,
} from "@/hooks/queries/useHr";
import { RoleBadge } from "../_components/role-badge";
import { EmployeeStatusBadge } from "../_components/employee-status-badge";
import type { EmployeeRole, EmployeeStatus } from "@/interfaces/hr";

export default function EmployeesPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [search, setSearch] = useState("");
  const [departmentId, setDepartmentId] = useState<string>("ALL");
  const [role, setRole] = useState<string>("ALL");
  const [status, setStatus] = useState<string>("ALL");
  const [sort, setSort] = useState("name-asc");

  const debouncedSearch = useDebounce(search, 300);

  // Fetch departments for filter
  const { data: departmentsData } = useDepartments({ size: 100 });

  // Fetch employees with filters
  const { data, isLoading, error } = useEmployees({
    page,
    size,
    search: debouncedSearch || undefined,
    departmentId: departmentId !== "ALL" ? departmentId : undefined,
    role: role !== "ALL" ? role : undefined,
    status: status !== "ALL" ? status : undefined,
    sort,
  });

  const deleteEmployee = useDeleteEmployee();

  const employees = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const departments = departmentsData?.content ?? [];

  const handleDelete = (id: string, fullName: string) => {
    deleteEmployee.mutate(id, {
      onSuccess: () => {
        // Optionally show toast notification
      },
      onError: (error) => {
        console.error("Failed to delete employee:", error);
        alert(
          "Failed to delete employee. They may have upcoming appointments."
        );
      },
    });
  };

  if (error) {
    return (
      <div className="w-full space-y-6">
        <div className="flex items-center justify-center py-10">
          <p className="text-destructive">
            Error loading employees. Please try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Employees</h1>
          <p className="text-muted-foreground">
            Manage staff profiles, roles, and status.
          </p>
        </div>
        <Button
          onClick={() => router.push("/admin/hr/employees/new")}
          size="lg"
          className="rounded-lg"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Employee
        </Button>
      </div>

      {/* Filters */}
      <Card className="w-full shadow-sm">
        <CardHeader className="gap-3 sm:flex sm:items-end sm:justify-between">
          <div className="relative w-full sm:max-w-xl">
            <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search by name, email, or license..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-lg pl-9"
            />
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <Select
              value={departmentId}
              onValueChange={(v) => {
                setDepartmentId(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-10 w-full rounded-lg sm:w-44">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={role}
              onValueChange={(v) => {
                setRole(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-10 w-full rounded-lg sm:w-36">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Roles</SelectItem>
                <SelectItem value="DOCTOR">Doctor</SelectItem>
                <SelectItem value="NURSE">Nurse</SelectItem>
                <SelectItem value="RECEPTIONIST">Receptionist</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={status}
              onValueChange={(v) => {
                setStatus(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-10 w-full rounded-lg sm:w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                <SelectItem value="RESIGNED">Resigned</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={sort}
              onValueChange={(v) => {
                setSort(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-10 w-full rounded-lg sm:w-36">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">Name A→Z</SelectItem>
                <SelectItem value="name-desc">Name Z→A</SelectItem>
                <SelectItem value="role">Role</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="department">Department</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-hidden rounded-b-xl border-t">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>License</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-10 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : employees.length ? (
                  employees.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">
                        {row.fullName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {row.email}
                      </TableCell>
                      <TableCell>
                        <RoleBadge role={row.role} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {row.departmentName || "N/A"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {row.phoneNumber || "N/A"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {row.licenseNumber || "N/A"}
                      </TableCell>
                      <TableCell>
                        <EmployeeStatusBadge status={row.status} />
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-full"
                          onClick={() =>
                            router.push(`/admin/hr/employees/${row.id}`)
                          }
                        >
                          View / Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="rounded-full text-destructive"
                              disabled={deleteEmployee.isPending}
                            >
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Employee
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete{" "}
                                <strong>{row.fullName}</strong>? This action
                                cannot be undone. If the employee has upcoming
                                appointments, you will need to cancel them
                                first.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleDelete(row.id, row.fullName)
                                }
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-10 text-center text-muted-foreground"
                    >
                      No employees found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <Card className="shadow-sm w-full">
        <CardHeader className="flex-row items-center justify-between gap-3 border-b">
          <CardTitle className="text-base">Pagination</CardTitle>
          <CardDescription className="text-sm">
            {totalElements} employees total
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3 py-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </Button>
            <div className="text-sm text-muted-foreground">
              Page <span className="text-foreground font-medium">{page}</span>{" "}
              of
              <span className="text-foreground font-medium"> {totalPages}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page</span>
            <Select
              value={String(size)}
              onValueChange={(value) => {
                setSize(Number(value));
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9 w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 50].map((count) => (
                  <SelectItem key={count} value={String(count)}>
                    {count}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
