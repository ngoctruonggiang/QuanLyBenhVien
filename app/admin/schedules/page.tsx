"use client";

import { useMemo, useState, useCallback } from "react";
import {
  addDays,
  endOfWeek,
  format,
  startOfWeek,
  isToday,
  eachDayOfInterval,
  differenceInDays,
} from "date-fns";
import { vi } from "date-fns/locale";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Users,
  Building2,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  BarChart3,
  UserCheck,
  UserX,
  Loader2,
  Grid3X3,
  LayoutList,
  GanttChart,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import ScheduleForm from "@/app/admin/hr/schedules/_components/ScheduleForm";
import { ScheduleStatusBadge } from "@/app/admin/hr/_components/schedule-status-badge";
import {
  useAllSchedules,
  useCreateSchedule,
  useUpdateSchedule,
  useDeleteSchedule,
  useDepartments,
  useEmployees,
} from "@/hooks/queries/useHr";
import type {
  ScheduleRequest,
  EmployeeSchedule,
  Department,
  Employee,
} from "@/interfaces/hr";
import { cn } from "@/lib/utils";
import { DateRangeFilter, DateRange } from "@/components/ui/date-range-filter";

// Hours for timeline (0-24)
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const WORK_HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 6:00 - 22:00

// Convert HH:mm to minutes since midnight
const timeToMinutes = (time: string): number => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

// Get color based on time range
const getScheduleColor = (startTime: string, endTime: string) => {
  const startHour = parseInt(startTime.split(":")[0], 10);
  const endHour = parseInt(endTime.split(":")[0], 10);
  
  // Night shift (includes hours before 6 or after 22)
  if (startHour < 6 || endHour > 22 || startHour >= 22) {
    return { bg: "bg-indigo-100", border: "border-indigo-300", text: "text-indigo-700", fill: "bg-indigo-400" };
  }
  // Morning dominant (start before 12)
  if (startHour < 12) {
    if (endHour <= 13) {
      return { bg: "bg-amber-100", border: "border-amber-300", text: "text-amber-700", fill: "bg-amber-400" };
    }
    // Cross morning-afternoon
    return { bg: "bg-gradient-to-r from-amber-100 to-sky-100", border: "border-orange-300", text: "text-orange-700", fill: "bg-orange-400" };
  }
  // Afternoon (12-18)
  if (startHour < 18) {
    if (endHour <= 18) {
      return { bg: "bg-sky-100", border: "border-sky-300", text: "text-sky-700", fill: "bg-sky-400" };
    }
    // Cross afternoon-evening
    return { bg: "bg-gradient-to-r from-sky-100 to-violet-100", border: "border-blue-300", text: "text-blue-700", fill: "bg-blue-400" };
  }
  // Evening (18-22)
  return { bg: "bg-violet-100", border: "border-violet-300", text: "text-violet-700", fill: "bg-violet-400" };
};

export default function SchedulesPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [activeDept, setActiveDept] = useState<string>("ALL");
  const [activeEmployee, setActiveEmployee] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"timeline" | "employee">("timeline");
  const [createDate, setCreateDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  // Calculate week or custom range days
  const weekStart = useMemo(() => startOfWeek(date, { weekStartsOn: 1 }), [date]);
  const weekEnd = useMemo(() => endOfWeek(weekStart, { weekStartsOn: 1 }), [weekStart]);
  
  // Use custom date range if selected, otherwise use week
  const effectiveStart = dateRange?.from || weekStart;
  const effectiveEnd = dateRange?.to || weekEnd;
  
  // Generate days for the current range (max 14 days for display)
  const displayDays = useMemo(() => {
    const daysDiff = differenceInDays(effectiveEnd, effectiveStart);
    const maxDays = Math.min(daysDiff + 1, 14);
    return Array.from({ length: maxDays }, (_, i) => addDays(effectiveStart, i));
  }, [effectiveStart, effectiveEnd]);
  
  const weekDays = displayDays;

  // Fetch data
  const { data: departmentsData } = useDepartments({ size: 100 });
  const { data: employeesData, isLoading: loadingEmployees } = useEmployees({ size: 100 });

  const startDateStr = format(effectiveStart, "yyyy-MM-dd");
  const endDateStr = format(effectiveEnd, "yyyy-MM-dd");

  const { data: schedulesData, isLoading: loadingSchedules } = useAllSchedules({
    startDate: startDateStr,
    endDate: endDateStr,
    departmentId: activeDept !== "ALL" ? activeDept : undefined,
    employeeId: activeEmployee !== "ALL" ? activeEmployee : undefined,
  });

  const createSchedule = useCreateSchedule();
  const updateSchedule = useUpdateSchedule();
  const deleteSchedule = useDeleteSchedule();

  const schedules = schedulesData?.content ?? [];
  const departments = departmentsData?.content ?? [];
  const employees = employeesData?.content ?? [];

  // Helper to get employee name (fallback to employees list if backend doesn't return employeeName)
  const getEmployeeName = (schedule: EmployeeSchedule) => {
    if (schedule.employeeName) return schedule.employeeName;
    const emp = employees.find((e: Employee) => e.id === schedule.employeeId);
    return emp?.fullName || "Nhân viên";
  };

  // ===== STATS =====
  const stats = useMemo(() => {
    const totalSchedules = schedules.length;
    const byStatus = {
      AVAILABLE: schedules.filter((s: EmployeeSchedule) => s.status === "AVAILABLE").length,
      BOOKED: schedules.filter((s: EmployeeSchedule) => s.status === "BOOKED").length,
      CANCELLED: schedules.filter((s: EmployeeSchedule) => s.status === "CANCELLED").length,
    };
    
    const employeesWithSchedule = new Set(schedules.map((s: EmployeeSchedule) => s.employeeId));
    const employeesWithCount = employeesWithSchedule.size;
    const employeesWithoutCount = employees.length - employeesWithCount;
    
    // Calculate total hours scheduled
    const totalMinutes = schedules.reduce((sum: number, s: EmployeeSchedule) => {
      const start = timeToMinutes(s.startTime);
      const end = timeToMinutes(s.endTime);
      return sum + (end - start);
    }, 0);
    const totalHours = Math.round(totalMinutes / 60);

    // Night shifts (starts before 6 or ends after 22)
    const nightShifts = schedules.filter((s: EmployeeSchedule) => {
      const startHour = parseInt(s.startTime.split(":")[0], 10);
      const endHour = parseInt(s.endTime.split(":")[0], 10);
      return startHour < 6 || endHour > 22 || startHour >= 22;
    }).length;

    return { totalSchedules, byStatus, employeesWithCount, employeesWithoutCount, totalHours, nightShifts };
  }, [schedules, employees]);

  // ===== HANDLERS =====
  const handleCreate = (data: ScheduleRequest) => {
    createSchedule.mutate(data, {
      onSuccess: () => setIsCreateOpen(false),
      onError: () => alert("Không thể tạo lịch. Nhân viên có thể đã có lịch trong ngày này."),
    });
  };

  const handleUpdate = (data: ScheduleRequest) => {
    if (!editId) return;
    updateSchedule.mutate({ id: editId, ...data }, {
      onSuccess: () => setEditId(null),
      onError: () => alert("Không thể cập nhật lịch."),
    });
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteSchedule.mutate(deleteId, {
      onSuccess: () => setDeleteId(null),
      onError: () => alert("Không thể xóa lịch."),
    });
  };

  const editInitial = useMemo(() => {
    if (!editId) return undefined;
    const item = schedules.find((s: EmployeeSchedule) => s.id === editId);
    if (!item) return undefined;
    return {
      employeeId: item.employeeId,
      workDate: item.workDate,
      startTime: item.startTime,
      endTime: item.endTime,
      status: item.status,
      notes: "",
    } as Partial<ScheduleRequest>;
  }, [editId, schedules]);

  const isLoading = loadingSchedules || loadingEmployees;

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-500 to-purple-500 p-6 text-white shadow-xl">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/5" />

          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                <CalendarDays className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                  Quản lý lịch làm việc
                  <Badge className="bg-white/20 text-white border-0 text-xs">
                    24/24
                  </Badge>
                </h1>
                <p className="mt-1 text-violet-200">
                  Hỗ trợ xếp lịch linh hoạt - bất kỳ giờ nào trong ngày
                </p>
              </div>
            </div>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-white text-violet-700 hover:bg-white/90">
                  <Plus className="mr-2 h-4 w-4" /> Tạo lịch mới
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Tạo lịch làm việc</DialogTitle>
                </DialogHeader>
                <ScheduleForm
                  onSubmit={handleCreate}
                  isLoading={createSchedule.isPending}
                  onCancel={() => setIsCreateOpen(false)}
                  initialData={{ workDate: createDate }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-white">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-violet-100">
                  <CalendarDays className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-violet-700">{stats.totalSchedules}</p>
                  <p className="text-xs text-muted-foreground">Tổng lịch</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100">
                  <Clock className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-700">{stats.totalHours}h</p>
                  <p className="text-xs text-muted-foreground">Tổng giờ</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-sky-200 bg-gradient-to-br from-sky-50 to-white">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-sky-100">
                  <CheckCircle className="h-5 w-5 text-sky-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-sky-700">{stats.byStatus.AVAILABLE}</p>
                  <p className="text-xs text-muted-foreground">Available</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100">
                  <UserCheck className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-700">{stats.employeesWithCount}</p>
                  <p className="text-xs text-muted-foreground">NV có lịch</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-white">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100">
                  <UserX className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-700">{stats.employeesWithoutCount}</p>
                  <p className="text-xs text-muted-foreground">Chưa có lịch</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-100">
                  <Sparkles className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-indigo-700">{stats.nightShifts}</p>
                  <p className="text-xs text-muted-foreground">Ca đêm</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Schedule View */}
        <Card className="border-2 border-slate-200 shadow-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />
          <CardHeader className="flex flex-wrap items-center justify-between gap-4 pb-4">
            <div className="flex items-center gap-4">
              {/* Navigation */}
              <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
                <Button variant="ghost" size="icon" className="rounded-lg h-8 w-8" onClick={() => { setDateRange(undefined); setDate(addDays(date, -7)); }}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="rounded-lg px-3" onClick={() => { setDateRange(undefined); setDate(new Date()); }}>
                  Hôm nay
                </Button>
                <Button variant="ghost" size="icon" className="rounded-lg h-8 w-8" onClick={() => { setDateRange(undefined); setDate(addDays(date, 7)); }}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <Badge variant="outline" className="px-3 py-1.5 bg-white">
                <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
                {format(effectiveStart, "dd/MM")} - {format(effectiveEnd, "dd/MM/yyyy")}
              </Badge>

              {/* Date Range Filter */}
              <DateRangeFilter
                value={dateRange}
                onChange={setDateRange}
                theme="purple"
                presetKeys={["all", "thisWeek", "thisMonth", "7days", "30days"]}
                showQuickPresets={false}
              />
            </div>

            <div className="flex items-center gap-3">
              {/* Filters */}
              <Select value={activeDept} onValueChange={setActiveDept}>
                <SelectTrigger className="w-40 bg-white border-2">
                  <Building2 className="h-4 w-4 mr-2 text-slate-400" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả khoa</SelectItem>
                  {departments.map((dept: Department) => (
                    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={activeEmployee} onValueChange={setActiveEmployee}>
                <SelectTrigger className="w-40 bg-white border-2">
                  <Users className="h-4 w-4 mr-2 text-slate-400" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả NV</SelectItem>
                  {employees.map((emp: Employee) => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.fullName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* View Mode */}
              <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
                <Button
                  variant={viewMode === "timeline" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("timeline")}
                  className={cn("rounded-lg px-3", viewMode === "timeline" && "bg-violet-600 hover:bg-violet-700")}
                >
                  <GanttChart className="h-4 w-4 mr-1" />
                  Timeline
                </Button>
                <Button
                  variant={viewMode === "employee" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("employee")}
                  className={cn("rounded-lg px-3", viewMode === "employee" && "bg-violet-600 hover:bg-violet-700")}
                >
                  <LayoutList className="h-4 w-4 mr-1" />
                  Theo NV
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
              </div>
            ) : viewMode === "timeline" ? (
              /* TIMELINE VIEW - Gantt Style */
              <div className="space-y-4">
                {weekDays.map((day) => {
                  const dateStr = format(day, "yyyy-MM-dd");
                  const daySchedules = schedules.filter((s: EmployeeSchedule) => s.workDate === dateStr);
                  
                  return (
                    <div key={dateStr} className={cn(
                      "rounded-xl border-2 overflow-hidden",
                      isToday(day) ? "border-violet-300 bg-violet-50/30" : "border-slate-200"
                    )}>
                      {/* Day Header */}
                      <div className={cn(
                        "flex items-center justify-between px-4 py-2 border-b",
                        isToday(day) ? "bg-violet-100 border-violet-200" : "bg-slate-50 border-slate-200"
                      )}>
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            "font-semibold",
                            isToday(day) ? "text-violet-700" : "text-slate-700"
                          )}>
                            {format(day, "EEEE, dd/MM", { locale: vi })}
                          </span>
                          {isToday(day) && <Badge className="bg-violet-600 text-xs">Hôm nay</Badge>}
                          <Badge variant="secondary">{daySchedules.length} lịch</Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setCreateDate(dateStr); setIsCreateOpen(true); }}
                        >
                          <Plus className="h-4 w-4 mr-1" /> Thêm
                        </Button>
                      </div>

                      {/* Timeline Grid */}
                      <div className="relative">
                        {/* Hour markers */}
                        <div className="flex border-b border-slate-200 bg-slate-50/50">
                          <div className="w-36 flex-shrink-0 px-3 py-1.5 text-xs text-slate-500 border-r border-slate-200">
                            Nhân viên
                          </div>
                          <div className="flex-1 flex">
                            {WORK_HOURS.map((hour) => (
                              <div
                                key={hour}
                                className="flex-1 text-center text-xs text-slate-400 py-1.5 border-r border-slate-100 last:border-r-0 min-w-[40px]"
                              >
                                {hour}:00
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Schedules as bars */}
                        {daySchedules.length === 0 ? (
                          <div className="py-8 text-center text-muted-foreground">
                            <Clock className="h-8 w-8 mx-auto mb-2 opacity-40" />
                            Không có lịch trong ngày này
                          </div>
                        ) : (
                          daySchedules.map((schedule: EmployeeSchedule) => {
                            const startMin = timeToMinutes(schedule.startTime);
                            const endMin = timeToMinutes(schedule.endTime);
                            const dayStartMin = 6 * 60; // 6:00
                            const dayEndMin = 22 * 60; // 22:00
                            const totalDayMin = dayEndMin - dayStartMin;
                            
                            // Calculate position (clamp to visible range)
                            const visibleStart = Math.max(startMin, dayStartMin);
                            const visibleEnd = Math.min(endMin, dayEndMin);
                            const left = ((visibleStart - dayStartMin) / totalDayMin) * 100;
                            const width = ((visibleEnd - visibleStart) / totalDayMin) * 100;

                            const colorConfig = getScheduleColor(schedule.startTime, schedule.endTime);

                            return (
                              <div key={schedule.id} className="flex items-center border-b border-slate-100 last:border-b-0">
                                <div className="w-36 flex-shrink-0 px-3 py-3 text-sm font-medium truncate border-r border-slate-200">
                                  {getEmployeeName(schedule)}
                                </div>
                                <div className="flex-1 relative h-12">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div
                                        className={cn(
                                          "absolute top-1.5 h-9 rounded-lg border-2 cursor-pointer flex items-center px-2 transition-all hover:shadow-md",
                                          colorConfig.bg,
                                          colorConfig.border
                                        )}
                                        style={{ left: `${left}%`, width: `${Math.max(width, 3)}%` }}
                                        onClick={() => setEditId(schedule.id)}
                                      >
                                        <span className={cn("text-xs font-medium truncate", colorConfig.text)}>
                                          {schedule.startTime} - {schedule.endTime}
                                        </span>
                                        {startMin < dayStartMin && (
                                          <span className="absolute -left-1 top-1/2 -translate-y-1/2 text-xs">◀</span>
                                        )}
                                        {endMin > dayEndMin && (
                                          <span className="absolute -right-1 top-1/2 -translate-y-1/2 text-xs">▶</span>
                                        )}
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <div className="text-sm">
                                        <p className="font-semibold">{getEmployeeName(schedule)}</p>
                                        <p>{schedule.startTime} - {schedule.endTime}</p>
                                        <p className="text-muted-foreground capitalize">{schedule.status.toLowerCase()}</p>
                                        <p className="text-xs text-muted-foreground mt-1">Click để sửa</p>
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* EMPLOYEE VIEW */
              <div className="overflow-auto">
                <div className="min-w-[900px] rounded-xl border-2 border-slate-200 bg-white overflow-hidden">
                  {/* Header */}
                  <div className="grid grid-cols-[180px_repeat(7,minmax(100px,1fr))] bg-gradient-to-r from-violet-50 to-purple-50">
                    <div className="px-4 py-3 text-slate-600 border-r border-slate-200 font-medium">
                      <Users className="h-4 w-4 mb-1" />
                      Nhân viên
                    </div>
                    {weekDays.map((day) => (
                      <div
                        key={day.toISOString()}
                        className={cn(
                          "px-2 py-3 text-center border-r border-slate-200 last:border-r-0",
                          isToday(day) && "bg-violet-100"
                        )}
                      >
                        <div className={cn("font-semibold text-sm", isToday(day) && "text-violet-700")}>
                          {format(day, "EEE", { locale: vi })}
                        </div>
                        <div className={cn("text-xs", isToday(day) ? "text-violet-600" : "text-muted-foreground")}>
                          {format(day, "dd/MM")}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Employee Rows */}
                  {employees.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">Không có nhân viên</div>
                  ) : (
                    employees.slice(0, 20).map((emp: Employee, index: number) => {
                      const empSchedules = schedules.filter((s: EmployeeSchedule) => s.employeeId === emp.id);
                      return (
                        <div key={emp.id} className={cn(
                          "grid grid-cols-[180px_repeat(7,minmax(100px,1fr))] border-t border-slate-200",
                          index % 2 === 0 && "bg-slate-50/50"
                        )}>
                          <div className="px-4 py-3 border-r border-slate-200">
                            <div className="font-medium text-slate-800 truncate">{emp.fullName}</div>
                            <div className="text-xs text-muted-foreground truncate">{emp.role}</div>
                          </div>

                          {weekDays.map((day) => {
                            const dateStr = format(day, "yyyy-MM-dd");
                            const daySchedules = empSchedules.filter((s: EmployeeSchedule) => s.workDate === dateStr);
                            return (
                              <div
                                key={dateStr}
                                className={cn(
                                  "px-1 py-2 border-r border-slate-200 last:border-r-0 min-h-[60px]",
                                  isToday(day) && "bg-violet-50/30"
                                )}
                              >
                                {daySchedules.length === 0 ? (
                                  <div className="h-full flex items-center justify-center">
                                    <span className="text-slate-200">—</span>
                                  </div>
                                ) : (
                                  <div className="flex flex-col gap-1">
                                    {daySchedules.map((s: EmployeeSchedule) => {
                                      const colorConfig = getScheduleColor(s.startTime, s.endTime);
                                      return (
                                        <Tooltip key={s.id}>
                                          <TooltipTrigger asChild>
                                            <div
                                              className={cn(
                                                "text-[10px] px-1.5 py-1 rounded-md border cursor-pointer hover:shadow-sm",
                                                colorConfig.bg,
                                                colorConfig.border,
                                                colorConfig.text
                                              )}
                                              onClick={() => setEditId(s.id)}
                                            >
                                              {s.startTime}-{s.endTime}
                                            </div>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>{s.startTime} - {s.endTime}</p>
                                            <p className="text-muted-foreground capitalize">{s.status.toLowerCase()}</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog - centered modal */}
        <Dialog open={!!editId} onOpenChange={(open) => !open && setEditId(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa lịch làm việc</DialogTitle>
            </DialogHeader>
            <ScheduleForm
              onSubmit={handleUpdate}
              isLoading={updateSchedule.isPending}
              onCancel={() => setEditId(null)}
              initialData={editInitial}
            />
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xóa lịch làm việc</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc muốn xóa lịch này? Hành động không thể hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteSchedule.isPending ? "Đang xóa..." : "Xóa"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
