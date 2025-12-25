"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDoctorSchedules, useMyEmployeeProfile } from "@/hooks/queries/useHr";
import { useAppointmentList } from "@/hooks/queries/useAppointment";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CalendarDays } from "lucide-react";

type ScheduleStatus = "AVAILABLE" | "BOOKED" | "CANCELLED";

const statusTone: Record<ScheduleStatus, string> = {
  AVAILABLE: "bg-emerald-100 text-emerald-700",
  BOOKED: "bg-blue-100 text-blue-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const SchedulePageSkeleton = () => (
  <div className="container mx-auto py-6 space-y-6">
    <div>
      <Skeleton className="h-9 w-48" />
      <Skeleton className="h-5 w-64 mt-1" />
    </div>
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
      <Card className="shadow-sm">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48 mt-1" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-40 w-full" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-[180px]" />
            <Skeleton className="h-10 w-20" />
          </div>
        </CardContent>
      </Card>
      <Card className="shadow-sm w-full">
        <CardHeader>
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-40 mt-1" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-4 border-t">
            <Skeleton className="h-10 w-full mb-2" />
            <Skeleton className="h-10 w-full mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

export default function MySchedulesPage() {
  const router = useRouter();
  const [dateRange, setDateRange] = useState<
    { from: Date; to: Date } | undefined
  >(undefined);
  
  // Get current doctor's employee profile
  const { data: myProfile, isLoading: isLoadingProfile } = useMyEmployeeProfile();
  const doctorId = myProfile?.id;

  useEffect(() => {
    setDateRange({
      from: new Date(),
      to: addDays(new Date(), 7),
    });
  }, []);

  const { data, isLoading } = useDoctorSchedules({
    startDate: dateRange ? format(dateRange.from, "yyyy-MM-dd") : undefined,
    endDate: dateRange ? format(dateRange.to, "yyyy-MM-dd") : undefined,
    doctorId,
    enabled: !!dateRange && !!doctorId,
  });

  // Fetch appointments for the doctor to count per day
  // Note: Only filtering by doctorId to avoid backend RSQL issues with combined filters
  const { data: appointmentsData } = useAppointmentList({
    doctorId,
    status: "SCHEDULED", // Only count scheduled appointments
    size: 100, // Reasonable limit for schedule view
  });

  // Create a map of appointment counts per date
  const appointmentCountsByDate = useMemo(() => {
    const counts: Record<string, number> = {};
    if (appointmentsData?.content) {
      appointmentsData.content.forEach((apt: { appointmentTime: string }) => {
        const dateKey = apt.appointmentTime.split("T")[0];
        counts[dateKey] = (counts[dateKey] || 0) + 1;
      });
    }
    return counts;
  }, [appointmentsData]);

  if (!dateRange || isLoadingProfile) {
    return <SchedulePageSkeleton />;
  }

  // Show message if employee profile not found
  if (!doctorId && !isLoadingProfile) {
    return (
      <div className="container mx-auto py-6">
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex items-center gap-3 pt-6">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <div>
              <p className="font-medium text-amber-800">Employee Profile Not Found</p>
              <p className="text-sm text-amber-700">
                Your account is not linked to an employee record. Please contact an administrator.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Schedules</h1>
        <p className="text-muted-foreground mt-1">
          Lịch trực và ca khám của bác sĩ.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Khoảng thời gian</CardTitle>
            <CardDescription>Chọn ngày bắt đầu và kết thúc</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="start-date"
                  className="text-sm font-medium leading-none"
                >
                  Start
                </Label>
                <Input
                  id="start-date"
                  type="date"
                  value={format(dateRange.from, "yyyy-MM-dd")}
                  onChange={(e) =>
                    setDateRange((prev) => ({
                      ...prev!,
                      from: e.target.value
                        ? new Date(e.target.value)
                        : prev!.from,
                    }))
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="end-date"
                  className="text-sm font-medium leading-none"
                >
                  End
                </Label>
                <Input
                  id="end-date"
                  type="date"
                  value={format(dateRange.to, "yyyy-MM-dd")}
                  onChange={(e) =>
                    setDateRange((prev) => ({
                      ...prev!,
                      to: e.target.value ? new Date(e.target.value) : prev!.to,
                    }))
                  }
                  className="h-10"
                />
              </div>
            </div>
            <Calendar
              mode="range"
              selected={{ from: dateRange.from, to: dateRange.to }}
              onSelect={(range) => {
                if (range?.from && range?.to)
                  setDateRange({ from: range.from, to: range.to });
              }}
              defaultMonth={dateRange.from}
              numberOfMonths={1}
            />
          </CardContent>
        </Card>

        <Card className="shadow-sm w-full">
          <CardHeader className="flex-row items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg">Lịch của tôi</CardTitle>
              <CardDescription>
                {format(dateRange.from, "dd/MM/yyyy")} -{" "}
                {format(dateRange.to, "dd/MM/yyyy")}
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
                      <TableCell
                        colSpan={4}
                        className="text-center py-6 text-muted-foreground"
                      >
                        Đang tải...
                      </TableCell>
                    </TableRow>
                  ) : data?.content && data.content.length > 0 ? (
                    data.content.map((schedule: any) => {
                      const dateKey = schedule.workDate;
                      const appointmentCount = appointmentCountsByDate[dateKey] || 0;
                      const isBooked = schedule.status === "BOOKED" || appointmentCount > 0;
                      const displayStatus = appointmentCount > 0 ? "BOOKED" : schedule.status;
                      
                      return (
                        <TableRow 
                          key={schedule.id}
                          className={isBooked ? "cursor-pointer hover:bg-blue-50" : ""}
                          onClick={() => {
                            if (isBooked) {
                              router.push(`/doctor/appointments?date=${dateKey}`);
                            }
                          }}
                        >
                          <TableCell className="text-muted-foreground">
                            {format(new Date(schedule.workDate), "dd/MM/yyyy")}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {schedule.startTime} - {schedule.endTime}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={`px-3 py-1 text-xs font-medium ${
                                statusTone[displayStatus as ScheduleStatus] || ""
                              }`}
                            >
                              {displayStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {isBooked ? (
                              <span className="inline-flex items-center gap-1 text-blue-600 font-medium">
                                <CalendarDays className="h-4 w-4" />
                                {appointmentCount} cuộc hẹn
                              </span>
                            ) : (
                              <span className="text-muted-foreground">
                                {schedule.notes || "Trống"}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="py-10 text-center text-muted-foreground"
                      >
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
