"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  Loader2,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

import { AppointmentStatus, Appointment } from "@/interfaces/appointment";
import {
  useAppointmentList,
  useCancelAppointment,
} from "@/hooks/queries/useAppointment";
import { useDebounce } from "@/hooks/useDebounce";
import {
  AppointmentStatusBadge,
  AppointmentTypeBadge,
  CancelAppointmentDialog,
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
      sort: "appointmentTime,desc",
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
      if (!uniqueDoctors.has(apt.doctor.id)) {
        uniqueDoctors.set(apt.doctor.id, {
          id: apt.doctor.id,
          name: apt.doctor.fullName,
        });
      }
    });
    return Array.from(uniqueDoctors.values());
  }, [data?.content]);

  const handleCancelClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setCancelDialogOpen(true);
  };

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

  const formatDateTime = (value: string) => {
    const date = new Date(value);
    return {
      date: format(date, "MMM d, yyyy"),
      time: format(date, "h:mm a"),
    };
  };

  const handleRowClick = (id: string) => {
    router.push(`/admin/appointments/${id}`);
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
          <div className="overflow-hidden rounded-b-xl border-t">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Patient</TableHead>
                  <TableHead className="w-[180px]">Doctor</TableHead>
                  <TableHead className="w-[150px]">Date & Time</TableHead>
                  <TableHead className="w-[120px]">Type</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Loading skeleton
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-28" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-40" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-8 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : data?.content && data.content.length > 0 ? (
                  data.content.map((appointment) => {
                    const { date, time } = formatDateTime(
                      appointment.appointmentTime
                    );
                    return (
                      <TableRow
                        key={appointment.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleRowClick(appointment.id)}
                      >
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {appointment.patient.fullName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {appointment.patient.phoneNumber}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {appointment.doctor.fullName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {appointment.doctor.department}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{date}</div>
                            <div className="text-sm text-muted-foreground">
                              {time}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <AppointmentTypeBadge type={appointment.type} />
                        </TableCell>
                        <TableCell>
                          <AppointmentStatusBadge status={appointment.status} />
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px] truncate text-muted-foreground">
                            {appointment.reason || "-"}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div
                            className="flex justify-end gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button variant="ghost" size="sm" asChild>
                              <Link
                                href={`/admin/appointments/${appointment.id}`}
                              >
                                View
                              </Link>
                            </Button>
                            {appointment.status === "SCHEDULED" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleCancelClick(appointment)}
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-10 text-center text-muted-foreground"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <CalendarClock className="h-8 w-8" />
                        <span>No appointments found</span>
                        {(search ||
                          status !== "ALL" ||
                          doctorId !== "ALL" ||
                          startDate ||
                          endDate) && (
                          <Button
                            variant="link"
                            onClick={() => {
                              setSearch("");
                              setStatus("ALL");
                              setDoctorId("ALL");
                              setStartDate(undefined);
                              setEndDate(undefined);
                            }}
                          >
                            Clear filters
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

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
        </CardContent>
      </Card>

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
