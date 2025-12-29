"use client";

import { useState, useEffect } from "react";
import { 
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Loader2,
  Download,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { StatCard } from "@/components/dashboard";
import { reportsService } from "@/services/reports.service";
import type { AppointmentStats } from "@/interfaces/reports";

export default function AppointmentReportPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AppointmentStats | null>(null);
  const [period, setPeriod] = useState<"week" | "month" | "year">("month");

  useEffect(() => {
    fetchData();
  }, [period]);

  const getDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();
    
    if (period === "week") {
      startDate.setDate(endDate.getDate() - 7);
    } else if (period === "month") {
      startDate.setDate(endDate.getDate() - 30);
    } else {
      startDate.setFullYear(endDate.getFullYear() - 1);
    }
    
    return {
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    };
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const { startDate, endDate } = getDateRange();
      const stats = await reportsService.getAppointmentStats({ startDate, endDate });
      setData(stats);
    } catch (error) {
      console.error("Failed to fetch appointment stats:", error);
      toast.error("Không thể tải báo cáo lịch hẹn");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const { startDate, endDate } = getDateRange();
      const blob = await reportsService.exportToCSV("appointments", { startDate, endDate });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `appointments-report-${startDate}-${endDate}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Đã xuất báo cáo");
    } catch (error) {
      toast.error("Không thể xuất báo cáo");
    }
  };

  const STATUS_LABELS: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
    COMPLETED: { label: "Hoàn thành", color: "text-green-600", icon: CheckCircle },
    CANCELLED: { label: "Đã hủy", color: "text-red-600", icon: XCircle },
    SCHEDULED: { label: "Đã đặt", color: "text-blue-600", icon: Calendar },
    NO_SHOW: { label: "Vắng mặt", color: "text-orange-600", icon: Clock },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--primary))]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-display">Báo cáo lịch hẹn</h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">
            Thống kê lịch hẹn và tỷ lệ hoàn thành
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="btn-secondary">
            <Download className="w-4 h-4" />
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Period Filter */}
      <div className="card-base">
        <div className="flex gap-2">
          {[
            { value: "week", label: "7 ngày" },
            { value: "month", label: "30 ngày" },
            { value: "year", label: "12 tháng" },
          ].map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === p.value
                  ? "bg-[hsl(var(--primary))] text-white"
                  : "bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary))]/80"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tổng lịch hẹn"
          value={data?.totalAppointments?.toString() || "0"}
          icon={<Calendar className="w-5 h-5" />}
          trend={{ value: "Trong kỳ", direction: "neutral" }}
        />
        <StatCard
          title="Hoàn thành"
          value={data?.completedCount?.toString() || "0"}
          icon={<CheckCircle className="w-5 h-5" />}
          trend={{ 
            value: `${data?.completionRate?.toFixed(1) || 0}%`, 
            direction: (data?.completionRate || 0) >= 80 ? "up" : "down"
          }}
        />
        <StatCard
          title="Đã hủy"
          value={data?.cancelledCount?.toString() || "0"}
          icon={<XCircle className="w-5 h-5" />}
          trend={{ value: "Cần giảm", direction: (data?.cancelledCount || 0) > 0 ? "down" : "neutral" }}
        />
        <StatCard
          title="Vắng mặt"
          value={data?.noShowCount?.toString() || "0"}
          icon={<Users className="w-5 h-5" />}
          trend={{ 
            value: `${data?.noShowRate?.toFixed(1) || 0}%`, 
            direction: (data?.noShowRate || 0) > 5 ? "down" : "up"
          }}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <div className="card-base">
          <h3 className="text-section mb-4">Phân bổ theo trạng thái</h3>
          <div className="space-y-3">
            {data?.appointmentsByStatus?.map((status, i) => {
              const config = STATUS_LABELS[status.status] || { label: status.status, color: "text-gray-600", icon: Calendar };
              const StatusIcon = config.icon;
              return (
                <div key={i} className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg bg-[hsl(var(--secondary))] flex items-center justify-center ${config.color}`}>
                    <StatusIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{config.label}</span>
                      <span className="font-bold">{status.count}</span>
                    </div>
                    <div className="mt-1 h-2 bg-[hsl(var(--secondary))] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[hsl(var(--primary))] rounded-full" 
                        style={{ width: `${status.percentage || 0}%` }} 
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Type Breakdown */}
        <div className="card-base">
          <h3 className="text-section mb-4">Phân bổ theo loại</h3>
          <div className="space-y-3">
            {data?.appointmentsByType?.map((type, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[hsl(var(--secondary))]">
                <span className="font-medium">
                  {type.type === "CONSULTATION" ? "Khám mới" : 
                   type.type === "FOLLOW_UP" ? "Tái khám" : 
                   type.type === "EMERGENCY" ? "Cấp cứu" : type.type}
                </span>
                <span className="badge badge-info">{type.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Trend */}
      {data?.dailyTrend && data.dailyTrend.length > 0 && (
        <div className="card-base">
          <h3 className="text-section mb-4">Xu hướng theo ngày</h3>
          <div className="h-48 flex items-end gap-1">
            {data.dailyTrend.slice(-14).map((day, i) => {
              const maxCount = Math.max(...data.dailyTrend.map(d => d.count));
              const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="relative w-full flex justify-center">
                    <div 
                      className="w-full max-w-[24px] bg-[hsl(var(--primary))] rounded-t-md transition-all hover:bg-[hsl(var(--primary))]/80 cursor-pointer"
                      style={{ height: `${Math.max(height, 4)}%` }}
                    />
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[hsl(var(--foreground))] text-[hsl(var(--background))] text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {day.count} lịch hẹn
                    </div>
                  </div>
                  <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
                    {new Date(day.date).getDate()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cache info */}
      {data?.cached && (
        <div className="text-center text-small">
          Dữ liệu được cập nhật lúc {new Date(data.generatedAt).toLocaleString("vi-VN")}
        </div>
      )}
    </div>
  );
}
