"use client";

import { useEffect, useState } from "react";
import { addDays, format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDoctorMySchedules } from "@/hooks/queries/useHr";
import { Button } from "@/components/ui/button";

type ScheduleStatus = "AVAILABLE" | "BOOKED" | "CANCELLED";

const statusTone: Record<ScheduleStatus, string> = {
  AVAILABLE: "bg-emerald-100 text-emerald-700",
  BOOKED: "bg-blue-100 text-blue-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function MySchedulesPage() {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(),
    to: addDays(new Date(), 7),
  });
  const [status, setStatus] = useState<ScheduleStatus | "ALL">("ALL");
  const [doctorId, setDoctorId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("doctorId") : null;
    if (stored) setDoctorId(stored);
  }, []);

  const { data, isLoading, refetch } = useDoctorMySchedules({
    startDate: format(dateRange.from, "yyyy-MM-dd"),
    endDate: format(dateRange.to, "yyyy-MM-dd"),
    status: status === "ALL" ? undefined : status,
    doctorId,
  });

  return (
    <div className="page-shell space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">My Schedules</h1>
        <p className="text-muted-foreground">Lịch trực và ca khám của bác sĩ.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Khoảng thời gian</CardTitle>
            <CardDescription>Chọn ngày bắt đầu và kết thúc</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">Start</label>
                <input
                  type="date"
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={format(dateRange.from, "yyyy-MM-dd")}
                  onChange={(e) =>
                    setDateRange((prev) => ({
                      ...prev,
                      from: e.target.value ? new Date(e.target.value) : prev.from,
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">End</label>
                <input
                  type="date"
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={format(dateRange.to, "yyyy-MM-dd")}
                  onChange={(e) =>
                    setDateRange((prev) => ({
                      ...prev,
                      to: e.target.value ? new Date(e.target.value) : prev.to,
                    }))
                  }
                />
              </div>
            </div>
            <Calendar
              mode="range"
              selected={{ from: dateRange.from, to: dateRange.to }}
              onSelect={(range) => {
                if (range?.from && range?.to) setDateRange({ from: range.from, to: range.to });
              }}
              defaultMonth={dateRange.from}
              numberOfMonths={1}
            />
            <div className="flex items-center gap-2">
              <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All statuses</SelectItem>
                  <SelectItem value="AVAILABLE">Available</SelectItem>
                  <SelectItem value="BOOKED">Booked</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm w-full">
          <CardHeader className="flex-row items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg">Lịch của tôi</CardTitle>
              <CardDescription>
                {format(dateRange.from, "dd/MM/yyyy")} - {format(dateRange.to, "dd/MM/yyyy")}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-hidden rounded-b-xl border-t">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ngày</TableHead>
                    <TableHead>Giờ</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ghi chú</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                        Đang tải...
                      </TableCell>
                    </TableRow>
                  ) : data?.content && data.content.length > 0 ? (
                    data.content.map((schedule: any) => (
                      <TableRow key={schedule.id}>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(schedule.workDate), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {schedule.startTime} - {schedule.endTime}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              statusTone[schedule.status as ScheduleStatus] || ""
                            }`}
                          >
                            {schedule.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {schedule.notes || `${schedule.appointments || 0} appointments`}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                        Không có lịch
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
