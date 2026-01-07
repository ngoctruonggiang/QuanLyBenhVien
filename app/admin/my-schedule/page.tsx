"use client";

import { useEffect, useMemo, useState } from "react";
import { addDays, format, isToday, isThisWeek } from "date-fns";
import { vi } from "date-fns/locale";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMySchedules, useMyEmployeeProfile } from "@/hooks/queries/useHr";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  AlertCircle, 
  CalendarDays, 
  ClipboardList, 
  CalendarCheck, 
  Clock, 
  CheckCircle2,
  Calendar as CalendarIcon,
  Sun,
  Moon,
  Sunrise,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

type ScheduleStatus = "AVAILABLE" | "BOOKED" | "CANCELLED" | "PENDING_CANCEL";

const statusConfig: Record<ScheduleStatus, { label: string; className: string; icon?: React.ReactNode }> = {
  AVAILABLE: { 
    label: "Sẵn sàng", 
    className: "bg-emerald-100 text-emerald-700 border-emerald-200" 
  },
  BOOKED: { 
    label: "Đã đặt", 
    className: "bg-blue-100 text-blue-700 border-blue-200" 
  },
  CANCELLED: { 
    label: "Đã hủy", 
    className: "bg-red-100 text-red-700 border-red-200" 
  },
  PENDING_CANCEL: { 
    label: "Chờ hủy", 
    className: "bg-amber-100 text-amber-700 border-amber-200" 
  },
};

const shiftConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  MORNING: { label: "Sáng", icon: <Sunrise className="h-4 w-4" />, color: "text-amber-500" },
  AFTERNOON: { label: "Chiều", icon: <Sun className="h-4 w-4" />, color: "text-orange-500" },
  EVENING: { label: "Tối", icon: <Moon className="h-4 w-4" />, color: "text-indigo-500" },
};

const SchedulePageSkeleton = () => (
  <div className="space-y-6">
    <div className="rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-500 p-6">
      <Skeleton className="h-9 w-48 bg-white/20" />
      <Skeleton className="h-5 w-64 mt-2 bg-white/20" />
    </div>
    <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="border-0 shadow-md">
          <CardContent className="p-4">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-8 w-12 mt-2" />
          </CardContent>
        </Card>
      ))}
    </div>
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
      <Card className="shadow-sm">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
      <Card className="shadow-sm">
        <CardHeader>
          <Skeleton className="h-6 w-24" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full mb-2" />
          <Skeleton className="h-10 w-full mb-2" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    </div>
  </div>
);

export default function MySchedulePage() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>(undefined);

  // Get current user's employee profile
  const { data: myProfile, isLoading: isLoadingProfile } = useMyEmployeeProfile();
  const employeeId = myProfile?.id;

  useEffect(() => {
    setDateRange({
      from: new Date(),
      to: addDays(new Date(), 30), // Show current month by default
    });
  }, []);

  // Fetch my schedules
  const { data: schedulesData, isLoading: isLoadingSchedules } = useMySchedules({
    startDate: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
    endDate: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
    enabled: !!dateRange?.from && !!dateRange?.to,
  });

  const schedules = schedulesData?.content || schedulesData || [];

  // Calculate stats
  const stats = useMemo(() => {
    const today = (schedules as any[]).filter((s: any) => 
      isToday(new Date(s.workDate))
    ).length;
    const thisWeek = (schedules as any[]).filter((s: any) => 
      isThisWeek(new Date(s.workDate), { weekStartsOn: 1 })
    ).length;
    const available = (schedules as any[]).filter((s: any) => 
      s.status === "AVAILABLE"
    ).length;
    const booked = (schedules as any[]).filter((s: any) => 
      s.status === "BOOKED"
    ).length;
    return { today, thisWeek, available, booked, total: (schedules as any[]).length };
  }, [schedules]);

  // Get dates with schedules for calendar highlighting
  const scheduleDates = useMemo(() => {
    return (schedules as any[]).map((s: any) => new Date(s.workDate));
  }, [schedules]);

  // Role display name
  const roleDisplayName = useMemo(() => {
    switch (user?.role) {
      case "NURSE": return "Y tá";
      case "RECEPTIONIST": return "Lễ tân";
      case "DOCTOR": return "Bác sĩ";
      default: return user?.role || "Nhân viên";
    }
  }, [user?.role]);

  // Theme color based on role
  const themeColors = useMemo(() => {
    switch (user?.role) {
      case "NURSE": 
        return {
          gradient: "from-rose-600 via-pink-500 to-fuchsia-500",
          accent: "rose",
          iconBg: "bg-rose-50",
          iconColor: "text-rose-500"
        };
      case "RECEPTIONIST": 
        return {
          gradient: "from-amber-600 via-orange-500 to-red-500",
          accent: "amber",
          iconBg: "bg-amber-50",
          iconColor: "text-amber-500"
        };
      default: 
        return {
          gradient: "from-sky-600 via-sky-500 to-cyan-500",
          accent: "sky",
          iconBg: "bg-sky-50",
          iconColor: "text-sky-500"
        };
    }
  }, [user?.role]);

  if (!dateRange || isLoadingProfile) {
    return <SchedulePageSkeleton />;
  }

  // Show message if employee profile not found
  if (!employeeId && !isLoadingProfile) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="flex items-center gap-3 pt-6">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <div>
            <p className="font-medium text-amber-800">Không tìm thấy hồ sơ nhân viên</p>
            <p className="text-sm text-amber-700">
              Tài khoản của bạn chưa được liên kết với hồ sơ nhân viên. Vui lòng liên hệ quản trị viên.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Gradient Header */}
      <div className={cn(
        "relative overflow-hidden rounded-2xl p-6 text-white shadow-lg",
        `bg-gradient-to-r ${themeColors.gradient}`
      )}>
        {/* Background decoration */}
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/5" />
        <div className="absolute top-1/2 right-1/4 h-24 w-24 rounded-full bg-white/5" />
        
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          {/* Left: Title and description */}
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
              <CalendarDays className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Lịch làm việc của tôi</h1>
              <p className="mt-1 text-white/80">
                Xem và theo dõi lịch trực của bạn • {roleDisplayName}
              </p>
            </div>
          </div>
          
          {/* Right: Quick stats - hidden on mobile */}
          <div className="hidden md:flex gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-white/80 text-sm">
                <Clock className="h-4 w-4" />
                Hôm nay
              </div>
              <div className="text-2xl font-bold">{stats.today}</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-white/80 text-sm">
                <CalendarCheck className="h-4 w-4" />
                Tuần này
              </div>
              <div className="text-2xl font-bold">{stats.thisWeek}</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-white/80 text-sm">
                <TrendingUp className="h-4 w-4" />
                Tổng cộng
              </div>
              <div className="text-2xl font-bold">{stats.total}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="border-0 shadow-md overflow-hidden relative group hover:shadow-lg transition-shadow">
          <div className={cn("absolute top-0 right-0 w-16 h-16 rounded-bl-full opacity-50", themeColors.iconBg)} />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Hôm nay</p>
                <p className="text-2xl font-bold text-slate-900">{stats.today}</p>
              </div>
              <div className={cn("p-2.5 rounded-lg", themeColors.iconBg)}>
                <Clock className={cn("h-5 w-5", themeColors.iconColor)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md overflow-hidden relative group hover:shadow-lg transition-shadow">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-violet-400/10 to-transparent rounded-bl-full" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Tuần này</p>
                <p className="text-2xl font-bold text-slate-900">{stats.thisWeek}</p>
              </div>
              <div className="p-2.5 bg-violet-50 rounded-lg">
                <CalendarCheck className="h-5 w-5 text-violet-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md overflow-hidden relative group hover:shadow-lg transition-shadow">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-emerald-400/10 to-transparent rounded-bl-full" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Sẵn sàng</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.available}</p>
              </div>
              <div className="p-2.5 bg-emerald-50 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md overflow-hidden relative group hover:shadow-lg transition-shadow">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-400/10 to-transparent rounded-bl-full" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Đã đặt</p>
                <p className="text-2xl font-bold text-blue-600">{stats.booked}</p>
              </div>
              <div className="p-2.5 bg-blue-50 rounded-lg">
                <CalendarIcon className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content: Calendar + Schedule Table */}
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* Calendar Sidebar */}
        <Card className="shadow-md border-0">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarIcon className="h-5 w-5 text-slate-500" />
              Chọn khoảng thời gian
            </CardTitle>
            <CardDescription>Xem lịch trong khoảng ngày đã chọn</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="start-date" className="text-xs font-medium text-slate-500">
                  Từ ngày
                </Label>
                <Input
                  id="start-date"
                  type="date"
                  value={format(dateRange.from, "yyyy-MM-dd")}
                  onChange={(e) =>
                    setDateRange({
                      ...dateRange,
                      from: e.target.value ? new Date(e.target.value) : dateRange.from,
                    })
                  }
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="end-date" className="text-xs font-medium text-slate-500">
                  Đến ngày
                </Label>
                <Input
                  id="end-date"
                  type="date"
                  value={format(dateRange.to, "yyyy-MM-dd")}
                  onChange={(e) =>
                    setDateRange({
                      ...dateRange,
                      to: e.target.value ? new Date(e.target.value) : dateRange.to,
                    })
                  }
                  className="h-9"
                />
              </div>
            </div>
            
            <div className="pt-2">
              <Calendar
                mode="range"
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) => {
                  if (range?.from && range?.to)
                    setDateRange({ from: range.from, to: range.to });
                }}
                defaultMonth={dateRange.from}
                numberOfMonths={1}
                locale={vi}
                modifiers={{
                  hasSchedule: scheduleDates,
                }}
                modifiersStyles={{
                  hasSchedule: {
                    fontWeight: "bold",
                    textDecoration: "underline",
                    textDecorationColor: "currentColor",
                  },
                }}
                className="rounded-lg border"
              />
            </div>
            
            {/* Legend */}
            <div className="flex flex-wrap gap-2 pt-2 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-slate-600">Sẵn sàng</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-slate-600">Đã đặt</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-slate-600">Đã hủy</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Table */}
        <Card className="shadow-md border-0">
          <CardHeader className="flex-row items-center justify-between gap-3 pb-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ClipboardList className="h-5 w-5 text-slate-500" />
                Lịch trực chi tiết
              </CardTitle>
              <CardDescription>
                {format(dateRange.from, "dd/MM/yyyy", { locale: vi })} - {format(dateRange.to, "dd/MM/yyyy", { locale: vi })}
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-sm">
              {(schedules as any[]).length} ca làm việc
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-hidden rounded-b-xl border-t">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50">
                    <TableHead className="font-semibold">Ngày</TableHead>
                    <TableHead className="font-semibold">Ca làm</TableHead>
                    <TableHead className="font-semibold">Giờ làm việc</TableHead>
                    <TableHead className="font-semibold">Trạng thái</TableHead>
                    <TableHead className="font-semibold">Ghi chú</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingSchedules ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10">
                        <div className="flex items-center justify-center gap-2 text-slate-500">
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
                          Đang tải...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (schedules as any[]).length > 0 ? (
                    (schedules as any[]).map((schedule: any) => {
                      const status = schedule.status as ScheduleStatus;
                      const config = statusConfig[status] || statusConfig.AVAILABLE;
                      const shift = shiftConfig[schedule.shift] || null;
                      const scheduleDate = new Date(schedule.workDate);
                      const isTodaySchedule = isToday(scheduleDate);

                      return (
                        <TableRow 
                          key={schedule.id}
                          className={cn(
                            "transition-colors",
                            isTodaySchedule && "bg-amber-50/50 hover:bg-amber-50"
                          )}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {isTodaySchedule && (
                                <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                              )}
                              <div>
                                <p className="font-medium text-slate-900">
                                  {format(scheduleDate, "EEEE", { locale: vi })}
                                </p>
                                <p className="text-sm text-slate-500">
                                  {format(scheduleDate, "dd/MM/yyyy", { locale: vi })}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {shift ? (
                              <div className="flex items-center gap-2">
                                <span className={shift.color}>{shift.icon}</span>
                                <span className="font-medium">{shift.label}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <Clock className="h-4 w-4 text-slate-400" />
                              <span className="font-mono">
                                {schedule.startTime || "08:00"} - {schedule.endTime || "17:00"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn(
                                "px-2.5 py-0.5 text-xs font-medium border",
                                config.className
                              )}
                            >
                              {config.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-slate-500 text-sm">
                              {schedule.notes || "—"}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="rounded-full bg-slate-100 p-4">
                            <CalendarDays className="h-8 w-8 text-slate-400" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-600">Không có lịch làm việc</p>
                            <p className="text-sm text-slate-400 mt-1">
                              Không tìm thấy lịch trong khoảng thời gian đã chọn
                            </p>
                          </div>
                        </div>
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
