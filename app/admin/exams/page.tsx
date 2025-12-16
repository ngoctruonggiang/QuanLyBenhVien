"use client";

import { useState, useMemo } from "react";
import { CalendarClock, Download, Search, Stethoscope, FileText, Pill } from "lucide-react";
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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMedicalExamList } from "@/hooks/queries/useMedicalExam";
import { useDebounce } from "@/hooks/useDebounce";
import { MedicalExamListItem } from "@/interfaces/medical-exam";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useEmployees } from "@/hooks/queries/useHr";
import { Spinner } from "@/components/ui/spinner";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { DataTableRowActions } from "@/components/ui/data-table-row-actions";
import { ListPageHeader } from "@/components/ui/list-page-header";
import { FilterPills } from "@/components/ui/filter-pills";
import { ListEmptyState } from "@/components/ui/list-empty-state";
import { format } from "date-fns";

const formatDate = (value: string) =>
  format(new Date(value), "MMM d, yyyy");

export default function MedicalExamListPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [doctorId, setDoctorId] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [quickFilter, setQuickFilter] = useState<string>("all");

  const debouncedSearch = useDebounce(search, 300);

  const { data: doctorsData } = useEmployees({ role: "DOCTOR", size: 9999 });

  const { data, isLoading } = useMedicalExamList({
    page,
    size: pageSize,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    doctorId: doctorId !== "ALL" ? doctorId : undefined,
  });

  const exams = data?.data?.content || [];
  const totalPages = data?.data?.totalPages || 1;
  const totalElements = data?.data?.totalElements || 0;

  // Count exams with and without prescriptions
  const withPrescription = useMemo(
    () => exams.filter((e) => e.hasPrescription).length,
    [exams]
  );
  const withoutPrescription = useMemo(
    () => exams.filter((e) => !e.hasPrescription).length,
    [exams]
  );

  // Filtered exams based on quick filter
  const filteredExams = useMemo(() => {
    if (quickFilter === "with_rx") {
      return exams.filter((e) => e.hasPrescription);
    }
    if (quickFilter === "without_rx") {
      return exams.filter((e) => !e.hasPrescription);
    }
    return exams;
  }, [exams, quickFilter]);

  const clearFilters = () => {
    setSearch("");
    setDoctorId("ALL");
    setStartDate("");
    setEndDate("");
    setQuickFilter("all");
    setPage(0);
  };

  const hasFilters = search || doctorId !== "ALL" || startDate || endDate;

  return (
    <RoleGuard allowedRoles={["ADMIN", "NURSE"]}>
      <div className="space-y-6">
        {/* Enhanced Header */}
        <ListPageHeader
          title="Medical Examinations"
          description="View and manage all medical examination records"
          theme="sky"
          icon={<Stethoscope className="h-6 w-6 text-white" />}
          stats={[
            { label: "Total Exams", value: totalElements },
            { label: "With Prescription", value: withPrescription },
          ]}
          primaryAction={{
            label: "Export CSV",
            icon: <Download className="h-4 w-4 mr-2" />,
            onClick: () => {
              // TODO: Implement export
              console.log("Export CSV");
            },
          }}
        />

        {/* Quick Filter Pills */}
        <FilterPills
          filters={[
            { id: "all", label: "All", count: exams.length },
            {
              id: "with_rx",
              label: "With Prescription",
              count: withPrescription,
              countColor: "success",
            },
            {
              id: "without_rx",
              label: "Without Prescription",
              count: withoutPrescription,
            },
          ]}
          activeFilter={quickFilter}
          onFilterChange={(id) => {
            setQuickFilter(id);
            setPage(0);
          }}
        />

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by patient name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="pl-9"
            />
          </div>

          {/* Doctor Filter */}
          <Select
            value={doctorId}
            onValueChange={(value) => {
              setDoctorId(value);
              setPage(0);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Doctor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Doctors</SelectItem>
              {doctorsData?.content?.map((doctor) => (
                <SelectItem key={doctor.id} value={doctor.id}>
                  {doctor.fullName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date Range */}
          <Input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(0);
            }}
            className="w-[140px]"
            aria-label="Start date"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(0);
            }}
            className="w-[140px]"
            aria-label="End date"
          />

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </div>

        {/* Table Card */}
        <Card className="border-2 border-slate-200 shadow-md rounded-xl">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[22%]">Patient</TableHead>
                  <TableHead className="w-[18%]">Doctor</TableHead>
                  <TableHead className="w-[25%]">Diagnosis</TableHead>
                  <TableHead className="w-[15%]">Exam Date</TableHead>
                  <TableHead className="w-[10%] text-center">Rx</TableHead>
                  <TableHead className="w-[10%] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center">
                      <span className="inline-flex items-center gap-2 text-muted-foreground">
                        <Spinner size="sm" /> Loading exams...
                      </span>
                    </TableCell>
                  </TableRow>
                ) : filteredExams.length ? (
                  filteredExams.map((exam: MedicalExamListItem) => (
                    <TableRow
                      key={exam.id}
                      className="cursor-pointer"
                      onClick={() => router.push(`/admin/exams/${exam.id}`)}
                    >
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900">
                            {exam.patient.fullName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {exam.doctor.fullName}
                      </TableCell>
                      <TableCell className="text-muted-foreground truncate max-w-[200px]">
                        {exam.diagnosis || (
                          <span className="text-slate-400 italic">No diagnosis</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(exam.examDate)}
                      </TableCell>
                      <TableCell className="text-center">
                        {exam.hasPrescription ? (
                          <Badge
                            variant="secondary"
                            className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                          >
                            <Pill className="h-3 w-3 mr-1" />
                            Yes
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DataTableRowActions
                          rowId={exam.id}
                          actions={[
                            {
                              label: "View details",
                              href: `/admin/exams/${exam.id}`,
                            },
                          ]}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10">
                      <ListEmptyState
                        icon={<CalendarClock className="h-12 w-12" />}
                        title="No examinations found"
                        description="No medical examinations match your current filters."
                        action={
                          hasFilters
                            ? {
                                label: "Clear filters",
                                onClick: clearFilters,
                              }
                            : undefined
                        }
                      />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination */}
        {!isLoading && totalElements > 0 && (
          <Card className="border-2 border-slate-200 shadow-sm rounded-xl">
            <CardContent className="py-3 px-4">
              <DataTablePagination
                currentPage={page}
                totalPages={totalPages}
                totalElements={totalElements}
                pageSize={pageSize}
                onPageChange={setPage}
                showRowsPerPage={true}
                rowsPerPageOptions={[10, 20, 50]}
                rowsPerPage={pageSize}
                onRowsPerPageChange={(size) => {
                  setPageSize(size);
                  setPage(0);
                }}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </RoleGuard>
  );
}
