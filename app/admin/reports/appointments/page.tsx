"use client";

import { useState, useMemo } from "react";
import { format, subDays } from "date-fns";
import {
  Download,
  Loader2,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ReportPageHeader } from "../_components/report-page-header";
import {
  DateRangePicker,
  useDateRangePresets,
} from "../_components/date-range-picker";
import { MetricCard } from "../_components/metric-card";
import { ChartCard } from "../_components/chart-card";
import { useAppointmentStats } from "@/hooks/queries/useReports";
import { useDepartments, useEmployees } from "@/hooks/queries/useHr";

// Pie Chart
function PieChart({
  data,
}: {
  data: { name: string; value: number; color: string }[];
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-8">
      <div className="flex justify-center">
        <div className="relative h-44 w-44">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            {(() => {
              let cumulativePercent = 0;
              return data.map((item, i) => {
                const percent = (item.value / total) * 100;
                const dashArray = `${percent} ${100 - percent}`;
                const dashOffset = -cumulativePercent;
                cumulativePercent += percent;
                return (
                  <circle
                    key={i}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke={item.color}
                    strokeWidth="20"
                    strokeDasharray={dashArray}
                    strokeDashoffset={dashOffset}
                    className="transition-all duration-500"
                  />
                );
              });
            })()}
          </svg>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-3 text-sm">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="flex-1">{item.name}</span>
            <span className="font-medium">{item.value}</span>
            <span className="w-12 text-right text-muted-foreground">
              {((item.value / total) * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Bar Chart
function BarChart({ data }: { data: { name: string; value: number }[] }) {
  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div className="space-y-3">
      {data.map((item, i) => (
        <div key={i} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{item.name}</span>
            <span className="text-muted-foreground">{item.value}</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// Line Chart
function LineChart({ data }: { data: { label: string; value: number }[] }) {
  const maxValue = Math.max(...data.map((d) => d.value));
  const minValue = Math.min(...data.map((d) => d.value));
  const range = maxValue - minValue || 1;

  return (
    <div className="flex h-[200px] items-end gap-1">
      {data.map((item, i) => {
        const height = ((item.value - minValue) / range) * 100 + 10;
        return (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <span className="text-xs text-muted-foreground">{item.value}</span>
            <div
              className="w-full rounded-t bg-primary/80 transition-all duration-300 hover:bg-primary"
              style={{ height: `${height}%` }}
            />
            <span className="text-[10px] text-muted-foreground">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// Horizontal Bar Chart
function HorizontalBarChart({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  const maxValue = Math.max(...data.map((d) => d.value));
  const sortedData = [...data].sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-2">
      {sortedData.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="w-32 truncate text-sm font-medium">{item.name}</span>
          <div className="flex-1">
            <div className="h-6 w-full overflow-hidden rounded bg-muted">
              <div
                className="flex h-full items-center justify-end rounded bg-primary px-2 text-xs text-primary-foreground transition-all duration-500"
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              >
                {item.value}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const statusColors: Record<string, string> = {
  COMPLETED: "#22c55e",
  SCHEDULED: "#3b82f6",
  CONFIRMED: "#8b5cf6",
  CANCELLED: "#ef4444",
  NO_SHOW: "#f59e0b",
};

export default function AppointmentStatsPage() {
  const presets = useDateRangePresets();
  const [startDate, setStartDate] = useState<Date | undefined>(
    presets.last30Days.startDate
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    presets.last30Days.endDate
  );
  const [departmentId, setDepartmentId] = useState<string>("ALL");
  const [doctorId, setDoctorId] = useState<string>("ALL");

  // Fetch departments and doctors for filters
  const { data: departmentsData } = useDepartments({ size: 100 });
  const departments = departmentsData?.content ?? [];

  const { data: employeesData } = useEmployees({
    size: 100,
    role: "DOCTOR",
    departmentId: departmentId !== "ALL" ? departmentId : undefined,
  });
  const doctors = employeesData?.content ?? [];

  // Fetch appointment stats
  const { data, isLoading, refetch } = useAppointmentStats({
    startDate: startDate ? format(startDate, "yyyy-MM-dd") : "",
    endDate: endDate ? format(endDate, "yyyy-MM-dd") : "",
    departmentId: departmentId !== "ALL" ? departmentId : undefined,
    doctorId: doctorId !== "ALL" ? doctorId : undefined,
  });

  // Chart data
  const statusPieData = useMemo(() => {
    if (!data?.appointmentsByStatus) return [];
    return data.appointmentsByStatus.map((item) => ({
      name: item.status.replace("_", " "),
      value: item.count,
      color: statusColors[item.status] || "#94a3b8",
    }));
  }, [data]);

  const typeBarData = useMemo(() => {
    if (!data?.appointmentsByType) return [];
    return data.appointmentsByType.map((item) => ({
      name: item.type.replace("_", " "),
      value: item.count,
    }));
  }, [data]);

  const dailyTrendData = useMemo(() => {
    if (!data?.dailyTrend) return [];
    return data.dailyTrend.map((item) => ({
      label: format(new Date(item.date), "dd/MM"),
      value: item.count,
    }));
  }, [data]);

  const departmentBarData = useMemo(() => {
    if (!data?.appointmentsByDepartment) return [];
    return data.appointmentsByDepartment.map((item) => ({
      name: item.departmentName,
      value: item.count,
    }));
  }, [data]);

  const handleExport = () => {
    alert("Export - Feature coming soon");
  };

  // Reset doctor when department changes
  const handleDepartmentChange = (value: string) => {
    setDepartmentId(value);
    setDoctorId("ALL");
  };

  return (
    <div className="w-full space-y-6">
      <ReportPageHeader
        title="Appointment Statistics"
        description="Comprehensive analysis of appointments by status, type, and department"
        actions={
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        }
      />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filter Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <Select
                value={departmentId}
                onValueChange={handleDepartmentChange}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Doctor</label>
              <Select value={doctorId} onValueChange={setDoctorId}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Doctors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Doctors</SelectItem>
                  {doctors.map((doc) => (
                    <SelectItem key={doc.id} value={doc.id}>
                      {doc.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => refetch()} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Appointments"
          value={data?.totalAppointments?.toLocaleString() ?? "---"}
          icon={Calendar}
          loading={isLoading}
        />
        <MetricCard
          title="Completed"
          value={data?.completedCount?.toLocaleString() ?? "---"}
          icon={CheckCircle}
          subLabel={`${
            data?.completionRate?.toFixed(1) ?? "--"
          }% completion rate`}
          loading={isLoading}
        />
        <MetricCard
          title="Cancelled"
          value={data?.cancelledCount?.toLocaleString() ?? "---"}
          icon={XCircle}
          loading={isLoading}
        />
        <MetricCard
          title="No-Show Rate"
          value={`${data?.noShowRate?.toFixed(1) ?? "--"}%`}
          icon={AlertTriangle}
          subLabel={`${data?.noShowCount ?? 0} appointments`}
          loading={isLoading}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Appointments by Status"
          description="Distribution across status types"
          loading={isLoading}
        >
          {statusPieData.length > 0 ? (
            <PieChart data={statusPieData} />
          ) : (
            <div className="flex h-[200px] items-center justify-center text-muted-foreground">
              No data available
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Appointments by Type"
          description="Breakdown by appointment type"
          loading={isLoading}
        >
          {typeBarData.length > 0 ? (
            <BarChart data={typeBarData} />
          ) : (
            <div className="flex h-[200px] items-center justify-center text-muted-foreground">
              No data available
            </div>
          )}
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Daily Trend"
          description="Appointments over time"
          loading={isLoading}
        >
          {dailyTrendData.length > 0 ? (
            <LineChart data={dailyTrendData} />
          ) : (
            <div className="flex h-[200px] items-center justify-center text-muted-foreground">
              No data available
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Appointments by Department"
          description="Distribution across departments"
          loading={isLoading}
        >
          {departmentBarData.length > 0 ? (
            <HorizontalBarChart data={departmentBarData} />
          ) : (
            <div className="flex h-[200px] items-center justify-center text-muted-foreground">
              No data available
            </div>
          )}
        </ChartCard>
      </div>

      {/* Cache Info */}
      {data?.cached && (
        <p className="text-center text-xs text-muted-foreground">
          Data cached at{" "}
          {format(new Date(data.generatedAt), "dd/MM/yyyy HH:mm")}
        </p>
      )}
    </div>
  );
}
