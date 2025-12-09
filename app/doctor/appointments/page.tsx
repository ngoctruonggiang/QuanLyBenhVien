"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDoctorAppointments } from "@/hooks/queries/useAppointment";
import { AppointmentStatusBadge } from "@/app/admin/appointments/_components/appointment-status-badge";
import {
  format,
  isToday,
  isWithinInterval,
  startOfToday,
  endOfWeek,
} from "date-fns";
import { Appointment, AppointmentStatus } from "@/interfaces/appointment";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, Clock, Users, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function DoctorAppointmentsPage() {
  const { user } = useAuth();
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const { data: appointments = [], isLoading } = useDoctorAppointments(
    doctorId || ""
  );
  const [viewMode, setViewMode] = useState<"today" | "week" | "all">("today");
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "ALL">(
    "ALL"
  );

  useEffect(() => {
    // Get the doctorId from the authenticated user's employeeId
    const id = user?.employeeId;
    if (id) {
      console.log("[Doctor Appointments] Using employeeId from auth:", id);
      setDoctorId(id);
    } else {
      console.warn(
        "[Doctor Appointments] No employeeId found in user object. Using fallback."
      );
      setDoctorId("emp-101"); // fallback mock doctor
    }
  }, [user]);

  // Debug: Log appointments when they change
  useEffect(() => {
    if (doctorId && appointments.length > 0) {
      console.log(
        `[Doctor Appointments] Loaded ${appointments.length} appointments for doctor ${doctorId}`
      );
    } else if (doctorId && appointments.length === 0) {
      console.log(
        `[Doctor Appointments] No appointments found for doctor ${doctorId}`
      );
    }
  }, [doctorId, appointments]);

  const filtered = useMemo(() => {
    let filteredData = [...appointments];

    if (viewMode === "today") {
      filteredData = filteredData.filter((apt) =>
        isToday(new Date(apt.appointmentTime))
      );
    } else if (viewMode === "week") {
      const now = new Date();
      const end = endOfWeek(now, { weekStartsOn: 1 });
      filteredData = filteredData.filter((apt) =>
        isWithinInterval(new Date(apt.appointmentTime), { start: now, end })
      );
    }

    if (statusFilter !== "ALL") {
      filteredData = filteredData.filter((apt) => apt.status === statusFilter);
    }

    return filteredData;
  }, [appointments, viewMode, statusFilter]);

  const stats = useMemo(() => {
    const todayApts = appointments.filter((apt) =>
      isToday(new Date(apt.appointmentTime))
    );
    const total = todayApts.length;
    const pending = todayApts.filter((a) => a.status === "SCHEDULED").length;
    const completed = todayApts.filter((a) => a.status === "COMPLETED").length;
    const cancelled = todayApts.filter((a) => a.status === "CANCELLED").length;
    return { total, pending, completed, cancelled };
  }, [appointments]);

  const todaySchedule = useMemo(() => {
    if (viewMode !== "today") return null;

    const todayApts = appointments.filter((apt) =>
      isToday(new Date(apt.appointmentTime))
    );

    const grouped = todayApts.reduce(
      (acc, apt) => {
        const time = format(new Date(apt.appointmentTime), "HH:mm");
        if (!acc[time]) {
          acc[time] = [];
        }
        acc[time].push(apt);
        return acc;
      },
      {} as Record<string, Appointment[]>
    );

    return Object.entries(grouped).sort(([timeA], [timeB]) =>
      timeA.localeCompare(timeB)
    );
  }, [appointments, viewMode]);

  return (
    <div className="page-shell space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">My Appointments</h1>
          <p className="text-muted-foreground">
            Today is {format(new Date(), "EEEE, dd MMMM yyyy")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={statusFilter}
            onValueChange={(v: AppointmentStatus | "ALL") => setStatusFilter(v)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="SCHEDULED">Scheduled</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant={viewMode === "today" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("today")}
          >
            Today
          </Button>
          <Button
            variant={viewMode === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("week")}
          >
            This Week
          </Button>
          <Button
            variant={viewMode === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("all")}
          >
            All
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today&apos;s Total
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {stats.completed}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive">
              {stats.cancelled}
            </p>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading schedule...</p>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No appointments for the selected period.
          </CardContent>
        </Card>
      ) : viewMode === "today" && todaySchedule ? (
        <div className="space-y-4">
          {todaySchedule.map(([time, appointments]) => (
            <div
              key={time}
              className="grid grid-cols-[80px_1fr] items-start gap-4"
            >
              <div className="text-right">
                <p className="font-bold text-lg">{time}</p>
              </div>
              <div className="space-y-3 border-l-2 pl-4">
                {appointments.map((apt) => (
                  <Card key={apt.id}>
                    <CardHeader className="flex flex-row items-center justify-between p-4">
                      <div>
                        <CardTitle className="text-base">
                          {apt.patient?.fullName}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {apt.type}
                        </p>
                      </div>
                      <AppointmentStatusBadge status={apt.status} />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-sm text-muted-foreground mb-3">
                        Reason: {apt.reason}
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/doctor/appointments/${apt.id}`}>
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((apt) => {
            return (
              <Card key={apt.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base">
                      {apt.patient?.fullName}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {new Date(apt.appointmentTime).toLocaleString("vi-VN")}
                    </p>
                  </div>
                  <AppointmentStatusBadge status={apt.status} />
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Reason: {apt.reason}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/doctor/appointments/${apt.id}`}>
                        Details
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
