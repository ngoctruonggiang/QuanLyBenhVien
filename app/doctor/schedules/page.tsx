"use client";

import { useMemo, useState } from "react";
import { addDays, format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ScheduleStatus = "AVAILABLE" | "BOOKED" | "CANCELLED";

type Schedule = {
  id: string;
  doctorId: string;
  workDate: string;
  startTime: string;
  endTime: string;
  status: ScheduleStatus;
  notes?: string;
  appointments?: number;
};

// TODO: replace with real API when backend is ready
// import { getMySchedules } from "@/services/hr.service";

const mockMySchedules: Schedule[] = [
  {
    id: "ms-1",
    doctorId: "doc-1",
    workDate: "2025-12-10",
    startTime: "09:00",
    endTime: "12:00",
    status: "AVAILABLE",
    notes: "Morning clinic",
  },
  {
    id: "ms-2",
    doctorId: "doc-1",
    workDate: "2025-12-10",
    startTime: "13:00",
    endTime: "16:00",
    status: "BOOKED",
    notes: "Appointments",
    appointments: 4,
  },
  {
    id: "ms-3",
    doctorId: "doc-2",
    workDate: "2025-12-11",
    startTime: "08:00",
    endTime: "11:00",
    status: "CANCELLED",
    notes: "Surgery cancelled",
  },
];

const statusTone: Record<ScheduleStatus, string> = {
  AVAILABLE: "bg-emerald-100 text-emerald-700",
  BOOKED: "bg-blue-100 text-blue-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function MySchedulesPage() {
  const defaultStart = mockMySchedules.length
    ? new Date(mockMySchedules[0].workDate)
    : new Date();
  const [startDate, setStartDate] = useState<Date | undefined>(defaultStart);
  const [endDate, setEndDate] = useState<Date | undefined>(addDays(defaultStart, 13));
  const [status, setStatus] = useState<ScheduleStatus | "ALL">("ALL");
  const currentDoctorId = "doc-1";

  const rows = useMemo(() => {
    const start = startDate ? new Date(format(startDate, "yyyy-MM-dd")) : undefined;
    const end = endDate ? new Date(format(endDate, "yyyy-MM-dd")) : undefined;
    return mockMySchedules
      .filter((item) => item.doctorId === currentDoctorId)
      .filter((item) => {
        const d = new Date(item.workDate);
        if (start && d < start) return false;
        if (end && d > end) return false;
        return true;
      })
      .filter((item) => (status === "ALL" ? true : item.status === status))
      .sort((a, b) => a.workDate.localeCompare(b.workDate) || a.startTime.localeCompare(b.startTime));
  }, [startDate, endDate, status]);

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">My Schedules</h1>
        <p className="text-muted-foreground">Personal schedule for doctor view.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Date Range (next 2 weeks default)</CardTitle>
            <CardDescription>Read-only schedule view.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Start</label>
              <input
                type="date"
                className="w-full rounded-md border px-3 py-2 text-sm"
                value={startDate ? format(startDate, "yyyy-MM-dd") : ""}
                onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : undefined)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">End</label>
              <input
                type="date"
                className="w-full rounded-md border px-3 py-2 text-sm"
                value={endDate ? format(endDate, "yyyy-MM-dd") : ""}
                onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : undefined)}
              />
            </div>
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={setStartDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card className="shadow-sm w-full">
          <CardHeader className="flex-row items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg">Upcoming schedules</CardTitle>
              <CardDescription>Next two weeks by default</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
                <SelectTrigger className="h-9 w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="AVAILABLE">Available</SelectItem>
                  <SelectItem value="BOOKED">Booked</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-hidden rounded-b-xl border-t">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length ? (
                    rows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(row.workDate), "dd-MM-yyyy")}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {row.startTime} - {row.endTime}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={`rounded-full px-3 py-1 text-xs font-medium ${statusTone[row.status]}`}
                          >
                            {row.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {row.status === "BOOKED" && row.appointments
                            ? `${row.notes || ""} (${row.appointments} appointments)`
                            : row.notes || "—"}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="py-10 text-center text-muted-foreground">
                        No schedules for this date.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
