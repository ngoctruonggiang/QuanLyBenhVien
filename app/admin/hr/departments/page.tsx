"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Search, Loader2, Building2 } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useDepartments, useDeleteDepartment } from "@/hooks/queries/useHr";
import { useDebounce } from "@/hooks/useDebounce";
import { DepartmentStatusBadge } from "../_components/department-status-badge";
import { Department, DepartmentStatus } from "@/interfaces/hr";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { DataTableRowActions } from "@/components/ui/data-table-row-actions";
import { ListPageHeader } from "@/components/ui/list-page-header";
import { FilterPills } from "@/components/ui/filter-pills";

export default function DepartmentsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<DepartmentStatus | "ALL">("ALL");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] =
    useState<Department | null>(null);
  const [sort, setSort] = useState("name,asc");

  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useDepartments({
    page: page - 1,
    size,
    search: debouncedSearch || undefined,
    status: status === "ALL" ? undefined : status,
    sort: sort,
  });

  const deleteMutation = useDeleteDepartment();

  const departments = data?.content ?? [];
  const totalItems = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 1;

  // Calculate stats
  const activeCount = useMemo(() => departments.filter(d => d.status === "ACTIVE").length, [departments]);
  const inactiveCount = useMemo(() => departments.filter(d => d.status === "INACTIVE").length, [departments]);

  const handleDeleteClick = (dept: Department) => {
    setDepartmentToDelete(dept);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!departmentToDelete) return;
    try {
      await deleteMutation.mutateAsync(departmentToDelete.id);
      toast.success(
        `Department "${departmentToDelete.name}" deleted successfully`
      );
      setDeleteDialogOpen(false);
      setDepartmentToDelete(null);
    } catch (error) {
      toast.error("Cannot delete department with assigned employees");
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* List Page Header */}
      <ListPageHeader
        title="Departments"
        description="Manage hospital departments and their heads."
        theme="violet"
        icon={<Building2 className="h-6 w-6 text-white" />}
        stats={[
          { label: "Total", value: totalItems },
          { label: "Active", value: activeCount },
          { label: "Inactive", value: inactiveCount },
        ]}
        primaryAction={
          isAdmin
            ? {
                label: "Add Department",
                href: "/admin/hr/departments/new",
              }
            : undefined
        }
      />

      {/* Filter Pills */}
      <FilterPills
        filters={[
          { id: "ALL", label: "All" },
          { id: "ACTIVE", label: "Active", count: activeCount },
          { id: "INACTIVE", label: "Inactive", count: inactiveCount },
        ]}
        activeFilter={status}
        onFilterChange={(v) => {
          setStatus(v as DepartmentStatus | "ALL");
          setPage(1);
        }}
      />

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search by name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-lg pl-9"
          />
        </div>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="h-10 w-44 rounded-lg">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name,asc">Name (A-Z)</SelectItem>
            <SelectItem value="name,desc">Name (Z-A)</SelectItem>
            <SelectItem value="status,asc">Status (A-Z)</SelectItem>
            <SelectItem value="status,desc">Status (Z-A)</SelectItem>
            <SelectItem value="createdAt,desc">Created (newest)</SelectItem>
            <SelectItem value="createdAt,asc">Created (oldest)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table Card */}
      <Card className="w-full border-2 border-slate-200 shadow-md rounded-xl">
        <CardContent className="p-0">
          <div className="overflow-hidden rounded-xl">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Head Doctor</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center">
                      <Spinner className="mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : departments.length ? (
                  departments.map((row) => (
                    <TableRow
                      key={row.id}
                      accent="violet"
                      className="cursor-pointer"
                      onClick={() => router.push(`/admin/hr/departments/${row.id}`)}
                    >
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell className="text-muted-foreground max-w-xs truncate">
                        {row.description || "N/A"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {row.location || "N/A"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {row.phoneExtension || "N/A"}
                      </TableCell>
                      <TableCell>
                        <DepartmentStatusBadge status={row.status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {row.headDoctorName || "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DataTableRowActions
                          rowId={row.id}
                          actions={[
                            {
                              label: "View details",
                              href: `/admin/hr/departments/${row.id}`,
                            },
                            ...(isAdmin
                              ? [
                                  {
                                    label: "Edit",
                                    href: `/admin/hr/departments/${row.id}/edit`,
                                  },
                                  {
                                    label: "Delete",
                                    onClick: () => handleDeleteClick(row),
                                    destructive: true,
                                    separator: true,
                                  },
                                ]
                              : []),
                          ]}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-10 text-center text-muted-foreground"
                    >
                      No departments found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-slate-200 shadow-sm rounded-xl w-full">
        <CardContent className="py-4">
          <DataTablePagination
            currentPage={page - 1} // Convert from 1-indexed to 0-indexed
            totalPages={totalPages}
            totalElements={totalItems}
            pageSize={size}
            onPageChange={(newPage) => setPage(newPage + 1)} // Convert back to 1-indexed
            showRowsPerPage={true}
            rowsPerPageOptions={[10, 20, 50]}
            rowsPerPage={size}
            onRowsPerPageChange={(newSize) => {
              setSize(newSize);
              setPage(1);
            }}
          />
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Department</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{departmentToDelete?.name}
              &quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <Spinner size="sm" className="mr-2" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
