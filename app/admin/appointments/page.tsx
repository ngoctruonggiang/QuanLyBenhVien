"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  Plus,
  Search,
  CalendarDays,
} from "lucide-react";
import { format } from "date-fns";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/ui/data-table";

import { AppointmentStatus, Appointment } from "@/interfaces/appointment";
import {
  useAppointmentList,
  useCancelAppointment,
} from "@/hooks/queries/useAppointment";
import { useDebounce } from "@/hooks/useDebounce";
import {
  CancelAppointmentDialog,
  getAppointmentColumns,
} from "./_components";
import Link from "next/link";

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const AppointmentPage = () => {
  const router = useRouter();

  // Filters state
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<AppointmentStatus | "ALL">("ALL");
  const [doctorId, setDoctorId] = useState<string>("ALL");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  
  // Cancel dialog state
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  // Build query params
  const queryParams = useMemo(
    () => ({
      page,
      size: pageSize,
      search: debouncedSearch || undefined,
      status: status === "ALL" ? undefined : status,
      doctorId: doctorId === "ALL" ? undefined : doctorId,
      startDate: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
      endDate: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
    }),
    [page, pageSize, debouncedSearch, status, doctorId, startDate, endDate]
  );

  const { data, isLoading, isFetching } = useAppointmentList(queryParams);
  const cancelMutation = useCancelAppointment();

  // Get unique doctors for filter dropdown (from current results)
  const doctors = useMemo(() => {
    if (!data?.content) return [];
    const uniqueDoctors = new Map<string, { id: string; name: string }>();
    data.content.forEach((apt) => {
      if (apt.doctor && !uniqueDoctors.has(apt.doctor.id)) {
        uniqueDoctors.set(apt.doctor.id, {
          id: apt.doctor.id,
          name: apt.doctor.fullName,
        });
      }
    });
    return Array.from(uniqueDoctors.values());
  }, [data]);

  const handleCancelClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setCancelDialogOpen(true);
  };
  
  const columns = useMemo(() => getAppointmentColumns(handleCancelClick), []);


  const handleConfirmCancel = (reason: string) => {
    if (!selectedAppointment) return;
    cancelMutation.mutate(
      { id: selectedAppointment.id, data: { cancelReason: reason } },
      {
        onSuccess: () => {
          setCancelDialogOpen(false);
          setSelectedAppointment(null);
        },
      }
    );
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Appointments
          </h1>
          <p className="text-muted-foreground">
            Schedule and manage patient appointments.
          </p>
        </div>
        <Button size="lg" className="rounded-lg" asChild>
          <Link href="/admin/appointments/new">
            <Plus className="mr-2 h-4 w-4" /> Book Appointment
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card className="w-full shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Search */}
            <div className="relative w-full lg:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by patient or doctor..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                className="h-10 pl-9"
              />
            </div>

            {/* Filter dropdowns */}
            <div className="flex flex-wrap gap-2">
              {/* Status filter */}
              <Select
                value={status}
                onValueChange={(v) => {
                  setStatus(v as AppointmentStatus | "ALL");
                  setPage(0);
                }}
              >
                <SelectTrigger className="h-10 w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="NO_SHOW">No Show</SelectItem>
                </SelectContent>
              </Select>

              {/* Doctor filter */}
              <Select
                value={doctorId}
                onValueChange={(v) => {
                  setDoctorId(v);
                  setPage(0);
                }}
              >
                <SelectTrigger className="h-10 w-[160px]">
                  <SelectValue placeholder="Doctor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Doctors</SelectItem>
                  {doctors.map((doc) => (
                    <SelectItem key={doc.id} value={doc.id}>
                      {doc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Start Date */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-10 w-[140px] justify-start"
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "MMM d") : "Start Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      setStartDate(date);
                      setPage(0);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {/* End Date */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-10 w-[140px] justify-start"
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "MMM d") : "End Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => {
                      setEndDate(date);
                      setPage(0);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {/* Clear filters */}
              {(search ||
                status !== "ALL" ||
                doctorId !== "ALL" ||
                startDate ||
                endDate) && (
                <Button
                  variant="ghost"
                  className="h-10"
                  onClick={() => {
                    setSearch("");
                    setStatus("ALL");
                    setDoctorId("ALL");
                    setStartDate(undefined);
                    setEndDate(undefined);
                    setPage(0);
                  }}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
            <DataTable columns={columns} data={data?.content ?? []} />
        </CardContent>
      </Card>

      {/* Pagination */}
      {data && data.totalElements > 0 && (
        <div className="flex items-center justify-between border-t px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              Showing {page * pageSize + 1}-
              {Math.min((page + 1) * pageSize, data.totalElements)} of{" "}
              {data.totalElements}
            </span>
            <Select
              value={pageSize.toString()}
              onValueChange={(v) => {
                setPageSize(Number(v));
                setPage(0);
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span>per page</span>
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0 || isFetching}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.totalPages - 1 || isFetching}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Cancel Dialog */}
      <CancelAppointmentDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        onConfirm={handleConfirmCancel}
        isLoading={cancelMutation.isPending}
      />
    </div>
  );
};

export default AppointmentPage;
