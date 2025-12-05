"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePatients, useDeletePatient } from "@/hooks/queries/usePatient";
import { PatientFiltersBar, PatientFilters, PatientCard } from "./_components";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Plus,
  Loader2,
  LayoutGrid,
  List,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import {
  Patient,
  PatientListParams,
  Gender,
  BloodType,
} from "@/interfaces/patient";

type ViewMode = "table" | "grid";

export default function PatientsPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<PatientFilters>({
    search: "",
    gender: undefined,
    bloodType: undefined,
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

  const params: PatientListParams = {
    page,
    size: pageSize,
    search: filters.search || undefined,
    gender: filters.gender,
    bloodType: filters.bloodType,
  };

  const { data, isLoading } = usePatients(params);
  const { mutate: deletePatient, isPending: isDeleting } = useDeletePatient();

  const patients = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalElements = data?.totalElements ?? 0;

  const handleDelete = useCallback((patient: Patient) => {
    setPatientToDelete(patient);
    setDeleteId(patient.id);
  }, []);

  const handleViewPatient = useCallback(
    (patient: Patient) => {
      router.push(`/admin/patients/${patient.id}`);
    },
    [router]
  );

  const confirmDelete = useCallback(() => {
    if (deleteId) {
      deletePatient(deleteId, {
        onSettled: () => {
          setDeleteId(null);
          setPatientToDelete(null);
        },
      });
    }
  }, [deleteId, deletePatient]);

  const handleFiltersChange = useCallback((newFilters: PatientFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page on filter change
  }, []);

  const formatDate = (date: string | null) => {
    if (!date) return "N/A";
    try {
      return format(new Date(date), "dd/MM/yyyy");
    } catch {
      return date;
    }
  };

  const getGenderLabel = (gender: string | null) => {
    if (!gender) return "N/A";
    return gender.charAt(0) + gender.slice(1).toLowerCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6" />
            Patients
          </h1>
          <p className="text-muted-foreground">
            Manage patient records and information
          </p>
        </div>
        <Button asChild size="lg" className="rounded-lg">
          <Link href="/admin/patients/new">
            <Plus className="h-4 w-4 mr-2" />
            New Patient
          </Link>
        </Button>
      </div>

      {/* Filters & View Toggle */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <PatientFiltersBar
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "table" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("table")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : patients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No patients found</h3>
              <p className="text-muted-foreground">
                {filters.search || filters.gender || filters.bloodType
                  ? "Try adjusting your filters"
                  : "Get started by adding a new patient"}
              </p>
              {!filters.search && !filters.gender && !filters.bloodType && (
                <Button asChild className="mt-4">
                  <Link href="/admin/patients/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Patient
                  </Link>
                </Button>
              )}
            </div>
          ) : viewMode === "grid" ? (
            // Grid View
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {patients.map((patient) => (
                <PatientCard
                  key={patient.id}
                  patient={patient}
                  onDelete={() => handleDelete(patient)}
                  isDeleting={isDeleting && deleteId === patient.id}
                />
              ))}
            </div>
          ) : (
            // Table View
            <div className="border-t">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Date of Birth</TableHead>
                    <TableHead>Blood Type</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients.map((patient) => (
                    <TableRow
                      key={patient.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleViewPatient(patient)}
                    >
                      <TableCell>
                        <span className="font-medium">{patient.fullName}</span>
                        {patient.email && (
                          <p className="text-sm text-muted-foreground">
                            {patient.email}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>{patient.phoneNumber}</TableCell>
                      <TableCell>
                        {patient.gender && (
                          <Badge variant="secondary">
                            {getGenderLabel(patient.gender)}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(patient.dateOfBirth)}
                      </TableCell>
                      <TableCell>
                        {patient.bloodType && (
                          <Badge
                            variant="destructive"
                            className="bg-red-100 text-red-700"
                          >
                            {patient.bloodType}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewPatient(patient)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/patients/${patient.id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDelete(patient)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {patients.length > 0 && (
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-medium">{(page - 1) * pageSize + 1}</span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(page * pageSize, totalElements)}
              </span>{" "}
              of <span className="font-medium">{totalElements}</span> patients
            </p>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Rows per page
                </span>
                <Select
                  value={String(pageSize)}
                  onValueChange={(value) => {
                    setPageSize(Number(value));
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-9 w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 20, 30, 50].map((size) => (
                      <SelectItem key={size} value={String(size)}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="px-3 text-sm">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Patient</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{patientToDelete?.fullName}</strong>? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
