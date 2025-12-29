"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Users, 
  Calendar, 
  UserPlus, 
  CreditCard,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { StatCard } from "@/components/dashboard";
import axiosInstance from "@/config/axios";

interface DashboardStats {
  todayAppointments: number;
  completedToday: number;
  pendingPayments: number;
  newPatientsToday: number;
}

export default function ReceptionistDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    todayAppointments: 0,
    completedToday: 0,
    pendingPayments: 0,
    newPatientsToday: 0,
  });
  const [loading, setLoading] = useState(true);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [appointmentsRes] = await Promise.allSettled([
        axiosInstance.get("/appointments/stats"),
      ]);

      const appointmentStats = appointmentsRes.status === "fulfilled" 
        ? appointmentsRes.value.data.data 
        : null;

      setStats({
        todayAppointments: appointmentStats?.scheduledToday || 24,
        completedToday: appointmentStats?.completedToday || 12,
        pendingPayments: 8,
        newPatientsToday: 5,
      });

      // Mock upcoming appointments
      setUpcomingAppointments([
        { id: 1, patient: "Nguyễn Văn An", time: "09:00", doctor: "BS. Trần Thị Bình", status: "waiting" },
        { id: 2, patient: "Lê Thị Cúc", time: "09:30", doctor: "BS. Phạm Văn Dũng", status: "waiting" },
        { id: 3, patient: "Hoàng Minh Em", time: "10:00", doctor: "BS. Trần Thị Bình", status: "confirmed" },
        { id: 4, patient: "Vũ Thị Phương", time: "10:30", doctor: "BS. Ngô Văn Giang", status: "confirmed" },
        { id: 5, patient: "Đặng Văn Hùng", time: "11:00", doctor: "BS. Phạm Văn Dũng", status: "waiting" },
      ]);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { 
      icon: UserPlus, 
      label: "Tiếp nhận BN mới", 
      href: "/receptionist/walk-in",
      description: "Đăng ký bệnh nhân mới khám" 
    },
    { 
      icon: Calendar, 
      label: "Đặt lịch hẹn", 
      href: "/receptionist/appointments/new",
      description: "Tạo lịch hẹn mới" 
    },
    { 
      icon: Users, 
      label: "Tra cứu BN", 
      href: "/receptionist/patients",
      description: "Tìm kiếm hồ sơ bệnh nhân" 
    },
    { 
      icon: CreditCard, 
      label: "Thu tiền", 
      href: "/receptionist/billing",
      description: "Xử lý thanh toán" 
    },
  ];

  const statusConfig = {
    waiting: { label: "Chờ khám", class: "badge-warning", icon: Clock },
    confirmed: { label: "Đã xác nhận", class: "badge-info", icon: CheckCircle },
    completed: { label: "Hoàn thành", class: "badge-success", icon: CheckCircle },
    cancelled: { label: "Đã hủy", class: "badge-danger", icon: XCircle },
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="stat-card">
              <div className="skeleton h-4 w-24 mb-4" />
              <div className="skeleton h-8 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-display">Dashboard Lễ tân</h1>
        <p className="text-[hsl(var(--muted-foreground))] mt-1">
          Tổng quan hoạt động tiếp đón hôm nay
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Lịch hẹn hôm nay"
          value={stats.todayAppointments}
          icon={<Calendar className="w-5 h-5" />}
          trend={{ value: `${stats.completedToday} đã khám`, direction: "neutral" }}
        />
        <StatCard
          title="Chờ thanh toán"
          value={stats.pendingPayments}
          icon={<CreditCard className="w-5 h-5" />}
          trend={{ value: "Cần xử lý", direction: "up" }}
        />
        <StatCard
          title="BN mới hôm nay"
          value={stats.newPatientsToday}
          icon={<UserPlus className="w-5 h-5" />}
          trend={{ value: "+2 so với hôm qua", direction: "up" }}
        />
        <StatCard
          title="Đang chờ khám"
          value={upcomingAppointments.filter(a => a.status === "waiting").length}
          icon={<Clock className="w-5 h-5" />}
          trend={{ value: "Trong hàng đợi", direction: "neutral" }}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="card-base">
          <h3 className="text-section mb-4">Thao tác nhanh</h3>
          <div className="space-y-3">
            {quickActions.map((action, i) => (
              <Link
                key={i}
                href={action.href}
                className="flex items-center gap-4 p-4 rounded-xl border border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-light))] transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-[hsl(var(--primary-light))] flex items-center justify-center text-[hsl(var(--primary))] group-hover:bg-[hsl(var(--primary))] group-hover:text-white transition-colors">
                  <action.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{action.label}</p>
                  <p className="text-small">{action.description}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary))]" />
              </Link>
            ))}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="lg:col-span-2 card-base">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-section">Lịch hẹn sắp tới</h3>
            <Link
              href="/receptionist/appointments"
              className="text-sm text-[hsl(var(--primary))] hover:underline flex items-center gap-1"
            >
              Xem tất cả
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Bệnh nhân</th>
                  <th>Giờ hẹn</th>
                  <th>Bác sĩ</th>
                  <th>Trạng thái</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {upcomingAppointments.map((apt) => {
                  const status = statusConfig[apt.status as keyof typeof statusConfig];
                  const StatusIcon = status.icon;
                  return (
                    <tr key={apt.id}>
                      <td className="font-medium">{apt.patient}</td>
                      <td>
                        <div className="flex items-center gap-1 text-[hsl(var(--muted-foreground))]">
                          <Clock className="w-4 h-4" />
                          {apt.time}
                        </div>
                      </td>
                      <td>{apt.doctor}</td>
                      <td>
                        <span className={`badge ${status.class}`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </td>
                      <td>
                        <Link
                          href={`/receptionist/appointments/${apt.id}`}
                          className="text-[hsl(var(--primary))] hover:underline text-sm"
                        >
                          Chi tiết
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pending Payments Alert */}
      {stats.pendingPayments > 0 && (
        <div className="alert-banner">
          <AlertCircle className="w-5 h-5 text-[hsl(var(--warning))]" />
          <div className="flex-1">
            <p className="font-medium">Có {stats.pendingPayments} hóa đơn chờ thanh toán</p>
            <p className="text-sm opacity-80">
              Vui lòng xử lý để bệnh nhân có thể hoàn tất quy trình khám
            </p>
          </div>
          <Link href="/receptionist/billing" className="btn-primary text-sm py-2">
            Xử lý ngay
          </Link>
        </div>
      )}
    </div>
  );
}
