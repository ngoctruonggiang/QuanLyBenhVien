"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  DollarSign,
  Calendar,
  Users,
  ArrowRight,
  TrendingUp,
  BarChart3,
  PieChart,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { reportsService } from "@/services/reports.service";
import { toast } from "sonner";

interface DashboardStats {
  revenue: {
    total: number;
    growth: string;
  };
  appointments: {
    total: number;
    completed: number;
    completionRate: number;
  };
  patients: {
    total: number;
    newThisMonth: number;
  };
}

export default function AdminReportsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get current month date range
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const endDate = now.toISOString().split('T')[0];

      // Fetch all reports in parallel
      const [revenueData, appointmentData, patientData] = await Promise.all([
        reportsService.getRevenueReport({ startDate, endDate }),
        reportsService.getAppointmentStats({ startDate, endDate }),
        reportsService.getPatientActivity({ startDate, endDate }),
      ]);

      setStats({
        revenue: {
          total: revenueData.totalRevenue,
          growth: `+${revenueData.collectionRate}%`,
        },
        appointments: {
          total: appointmentData.totalAppointments,
          completed: appointmentData.completedCount || 0,
          completionRate: appointmentData.completionRate || 0,
        },
        patients: {
          total: patientData.totalPatients,
          newThisMonth: patientData.newPatients,
        },
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      toast.error("Không thể tải dữ liệu báo cáo");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await reportsService.clearCache();
      await fetchDashboardData();
      toast.success("Đã làm mới dữ liệu báo cáo");
    } catch (error) {
      toast.error("Không thể làm mới dữ liệu");
    } finally {
      setRefreshing(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const reports = [
    {
      title: "Báo cáo doanh thu",
      description: "Tổng quan doanh thu, phân tích thanh toán và xu hướng thu nhập",
      icon: DollarSign,
      href: "/admin/reports/revenue",
      color: "bg-green-500",
      stats: stats ? [
        { label: "Tổng doanh thu", value: formatCurrency(stats.revenue.total) },
        { label: "Tăng trưởng", value: stats.revenue.growth },
      ] : [],
    },
    {
      title: "Báo cáo lịch hẹn",
      description: "Thống kê lịch hẹn, tỷ lệ hoàn thành và hiệu suất bác sĩ",
      icon: Calendar,
      href: "/admin/reports/appointments",
      color: "bg-blue-500",
      stats: stats ? [
        { label: "Tổng lịch hẹn", value: stats.appointments.total.toString() },
        { label: "Hoàn thành", value: `${stats.appointments.completionRate.toFixed(1)}%` },
      ] : [],
    },
    {
      title: "Báo cáo bệnh nhân",
      description: "Phân tích bệnh nhân, đăng ký mới và phân bổ nhân khẩu học",
      icon: Users,
      href: "/admin/reports/patients",
      color: "bg-purple-500",
      stats: stats ? [
        { label: "Tổng bệnh nhân", value: stats.patients.total.toLocaleString() },
        { label: "Mới tháng này", value: `+${stats.patients.newThisMonth}` },
      ] : [],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-display">Báo cáo & Thống kê</h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">
            Xem các báo cáo phân tích hoạt động bệnh viện
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn-secondary inline-flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Làm mới
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--primary))]" />
        </div>
      ) : (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card-base bg-gradient-to-br from-green-500/10 to-green-500/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500 text-white flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-small">Doanh thu tháng này</p>
                  <p className="text-2xl font-bold">
                    {stats ? formatCurrency(stats.revenue.total) : "0 VND"}
                  </p>
                </div>
              </div>
            </div>
            <div className="card-base bg-gradient-to-br from-blue-500/10 to-blue-500/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500 text-white flex items-center justify-center">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-small">Lịch hẹn hoàn thành</p>
                  <p className="text-2xl font-bold">
                    {stats ? `${stats.appointments.completed} / ${stats.appointments.total}` : "0 / 0"}
                  </p>
                </div>
              </div>
            </div>
            <div className="card-base bg-gradient-to-br from-purple-500/10 to-purple-500/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500 text-white flex items-center justify-center">
                  <PieChart className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-small">Bệnh nhân mới</p>
                  <p className="text-2xl font-bold">
                    {stats ? `+${stats.patients.newThisMonth} người` : "+0 người"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Report Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <Link
                key={report.href}
                href={report.href}
                className="card-base group hover:border-[hsl(var(--primary))] transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-xl ${report.color} text-white flex items-center justify-center`}>
                    <report.icon className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold group-hover:text-[hsl(var(--primary))] transition-colors">
                      {report.title}
                    </h3>
                    <p className="text-small mt-1">{report.description}</p>
                  </div>
                </div>

                {/* Stats Preview */}
                {report.stats.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[hsl(var(--border))] grid grid-cols-2 gap-4">
                    {report.stats.map((stat, i) => (
                      <div key={i}>
                        <p className="text-small">{stat.label}</p>
                        <p className="text-xl font-bold">{stat.value}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action */}
                <div className="mt-4 flex items-center gap-2 text-[hsl(var(--primary))] font-medium">
                  Xem chi tiết
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
