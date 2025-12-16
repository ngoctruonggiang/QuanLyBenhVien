"use client";

import { useState, useCallback, useMemo } from "react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
} from "@/components/ui/alert-dialog";
import { Plus, LayoutGrid, List, Users, ArrowUpDown, UserPlus } from "lucide-react";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { DataTableRowActions } from "@/components/ui/data-table-row-actions";
import { format, differenceInYears } from "date-fns";
import { Patient, PatientListParams } from "@/interfaces/patient";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { appointmentService } from "@/services/appointment.service";
import { Spinner } from "@/components/ui/spinner";
import { BloodTypeBadge } from "@/components/ui/blood-type-badge";
import { GenderBadge } from "@/components/ui/gender-badge";
import { EmptyValue } from "@/components/ui/empty-value";
import { ListPageHeader } from "@/components/ui/list-page-header";
import { FilterPills } from "@/components/ui/filter-pills";
import { ListEmptyState } from "@/components/ui/list-empty-state";

type ViewMode = "table" | "grid";

export default function PatientsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const canDelete = user?.role === "ADMIN";
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [page, setPage] = useState(0); // 0-based for API
  const [pageSize, setPageSize] = useState(10);
  const [sort, setSort] = useState<{
    field: string;
    direction: "asc" | "desc";
  }>({
    field: "fullName",
    direction: "asc",
  });
  const [filters, setFilters] = useState<PatientFilters>({
    search: "",
    gender: undefined,
    bloodType: undefined,
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [futureAppointmentsCount, setFutureAppointmentsCount] = useState(0);
  const [quickFilter, setQuickFilter] = useState<string>("all");

  const params: PatientListParams = {
    page,
    size: pageSize,
    search: filters.search || undefined,
    gender: filters.gender,
    bloodType: filters.bloodType,
    sort: `${sort.field},${sort.direction}`,
  };

  const { data, isLoading } = usePatients(params);
  const { mutate: deletePatient, isPending: isDeleting } = useDeletePatient();

  const patients = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalElements = data?.totalElements ?? 0;

  const toggleSort = useCallback((field: string) => {
    setSort((prev) => {
      if (prev.field === field) {
        return { field, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { field, direction: "asc" };
    });
    setPage(0);
  }, []);

  const handleDelete = useCallback(async (patient: Patient) => {
    setPatientToDelete(patient);
    const appointments = await appointmentService.list({
      patientId: patient.id,
    });
    const futureAppointments = appointments.content.filter(
      (appt) => new Date(appt.appointmentTime) > new Date()
    );

    if (futureAppointments.length > 0) {
      setFutureAppointmentsCount(futureAppointments.length);
      setShowWarningDialog(true);
    } else {
      setDeleteId(patient.id);
    }
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
    setPage(0); // Reset to first page on filter change (0-based)
  }, []);

  const formatDate = (date: string | null) => {
    if (!date) return null;
    try {
      return format(new Date(date), "dd/MM/yyyy");
    } catch {
      return date;
    }
  };

  const calculateAge = (dateOfBirth: string | null) => {
    if (!dateOfBirth) return null;
    try {
      return differenceInYears(new Date(), new Date(dateOfBirth));
    } catch {
      return null;
    }
  };

  const renderSortIcon = (field: string) => {
    if (sort.field !== field) return <ArrowUpDown className="h-4 w-4" />;
    return (
      <ArrowUpDown
        className="h-4 w-4"
        style={{
          transform: sort.direction === "asc" ? "rotate(180deg)" : "none",
        }}
      />
    );
  };

  const tableSkeleton = useMemo(
    () =>
      Array.from({ length: 8 }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: 7 }).map((__, j) => (
            <TableCell key={j}>
              <Skeleton className="h-4 w-full" />
            </TableCell>
          ))}
        </TableRow>
      )),
    []
  );

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <ListPageHeader
        title="Patients"
        description="Manage patient records and information"
        theme="sky"
        icon={<Users className="h-6 w-6 text-white" />}
        stats={[
          { label: "Total Patients", value: totalElements },
          { label: "This Page", value: patients.length },
        ]}
        primaryAction={{
          label: "New Patient",
          href: "/admin/patients/new",
          icon: <UserPlus className="h-4 w-4 mr-2" />,
        }}
      />

      {/* Quick Filter Pills */}
      <FilterPills
        filters={[
          { id: "all", label: "All", count: totalElements },
          { id: "male", label: "Male", count: patients.filter(p => p.gender?.toUpperCase() === "MALE").length },
          { id: "female", label: "Female", count: patients.filter(p => p.gender?.toUpperCase() === "FEMALE").length },
        ]}
        activeFilter={quickFilter}
        onFilterChange={(id) => {
          setQuickFilter(id);
          if (id === "all") {
            setFilters(prev => ({ ...prev, gender: undefined }));
          } else if (id === "male") {
            setFilters(prev => ({ ...prev, gender: "MALE" }));
          } else if (id === "female") {
            setFilters(prev => ({ ...prev, gender: "FEMALE" }));
          }
        }}
      />

      {/* Filters Row - not inside Card */}
      <div className="flex flex-wrap items-center gap-4">
        <PatientFiltersBar
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />
        <Select
          value={`${sort.field},${sort.direction}`}
          onValueChange={(val) => {
            const [field, direction] = val.split(",") as [
              string,
              "asc" | "desc",
            ];
            setSort({ field, direction });
            setPage(0);
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fullName,asc">
              Sort by Name (A-Z)
            </SelectItem>
            <SelectItem value="createdAt,desc">
              Sort by Created (newest)
            </SelectItem>
            <SelectItem value="dateOfBirth,asc">
              Sort by DOB (oldest)
            </SelectItem>
          </SelectContent>
        </Select>
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

      {/* Table Card */}
      <Card className="border-2 border-slate-200 shadow-md rounded-xl">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="border-t">
              <Table>
                <TableHeader>
                  <TableRow>
                    {[
                      "Patient",
                      "Email",
                      "Phone",
                      "Gender",
                      "DOB",
                      "Blood",
                      "Insurance",
                      "",
                    ].map((h) => (
                      <TableHead key={h}>{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>{tableSkeleton}</TableBody>
              </Table>
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
                  onDelete={canDelete ? () => handleDelete(patient) : undefined}
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
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => toggleSort("fullName")}
                    >
                      <div className="flex items-center gap-1">
                        Patient
                        {renderSortIcon("fullName")}
                      </div>
                    </TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => toggleSort("dateOfBirth")}
                    >
                      <div className="flex items-center gap-1">
                        Age / DOB
                        {renderSortIcon("dateOfBirth")}
                      </div>
                    </TableHead>
                    <TableHead>Blood Type</TableHead>
                    <TableHead>Insurance #</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading
                    ? tableSkeleton
                    : patients.map((patient) => (
                        <TableRow
                          key={patient.id}
                          className="cursor-pointer hover:bg-sky-50/50 border-b border-slate-100"
                          onClick={() => handleViewPatient(patient)}
                        >
                          <TableCell>
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-gradient-to-br from-sky-400 to-teal-400 text-white font-semibold">
                                {patient.fullName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-900">
                                {patient.fullName}
                              </span>
                              <span className="text-sm text-slate-500">
                                {patient.email || <EmptyValue text="No email" />}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-slate-700">
                              {patient.phoneNumber || <EmptyValue text="—" />}
                            </span>
                          </TableCell>
                          <TableCell>
                            {patient.gender ? (
                              <GenderBadge gender={patient.gender} />
                            ) : (
                              <EmptyValue text="—" />
                            )}
                          </TableCell>
                          <TableCell>
                            {patient.dateOfBirth ? (
                              <div className="flex flex-col">
                                <span className="font-medium text-slate-900">
                                  {calculateAge(patient.dateOfBirth)} yrs
                                </span>
                                <span className="text-xs text-slate-500">
                                  {formatDate(patient.dateOfBirth)}
                                </span>
                              </div>
                            ) : (
                              <EmptyValue text="—" />
                            )}
                          </TableCell>
                          <TableCell>
                            {patient.bloodType ? (
                              <BloodTypeBadge bloodType={patient.bloodType} />
                            ) : (
                              <EmptyValue text="—" />
                            )}
                          </TableCell>
                          <TableCell>
                            {patient.healthInsuranceNumber ? (
                              <span className="font-mono text-sm text-slate-600">
                                {patient.healthInsuranceNumber}
                              </span>
                            ) : (
                              <EmptyValue text="Not insured" />
                            )}
                          </TableCell>
                          <TableCell
                            onClick={(e) => e.stopPropagation()}
                            className="text-right"
                          >
                            <DataTableRowActions
                              rowId={patient.id}
                              actions={[
                                {
                                  label: "View details",
                                  href: `/admin/patients/${patient.id}`,
                                },
                                {
                                  label: "Edit",
                                  href: `/admin/patients/${patient.id}/edit`,
                                },
                                ...(canDelete
                                  ? [
                                      {
                                        label: "Delete",
                                        onClick: () => handleDelete(patient),
                                        destructive: true,
                                        separator: true,
                                      },
                                    ]
                                  : []),
                              ]}
                            />
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
        <Card className="border-2 border-slate-200 shadow-sm rounded-xl">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{page * pageSize + 1}</span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min((page + 1) * pageSize, totalElements)}
              </span>{" "}
              of <span className="font-medium">{totalElements}</span> patients
            </p>

            <DataTablePagination
              currentPage={page}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={pageSize}
              onPageChange={setPage}
              showRowsPerPage={true}
              rowsPerPageOptions={[10, 20, 50]}
              rowsPerPage={pageSize}
              onRowsPerPageChange={(newSize) => {
                setPageSize(newSize);
                setPage(0);
              }}
            />
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
                  <Spinner size="sm" className="mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Future Appointments Warning Dialog */}
      <AlertDialog
        open={showWarningDialog}
        onOpenChange={() => setShowWarningDialog(false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cannot Delete Patient</AlertDialogTitle>
            <AlertDialogDescription>
              This patient cannot be deleted because they have{" "}
              <strong>{futureAppointmentsCount}</strong> future appointment(s).
              Please cancel or reschedule them first.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowWarningDialog(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
