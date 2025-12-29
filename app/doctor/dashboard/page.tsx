"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Users, 
  ClipboardList, 
  CheckCircle,
  Clock,
  ArrowRight,
  Stethoscope,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { StatCard } from "@/components/dashboard";
import { appointmentService, Appointment } from "@/services/appointment.service";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardStats {
  todayPatients: number;
  completedToday: number;
  inQueue: number;
  upcomingAppts: number;
}

export default function DoctorDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    todayPatients: 0,
    completedToday: 0,
    inQueue: 0,
    upcomingAppts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [queuePatients, setQueuePatients] = useState<Appointment[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await appointmentService.list({
        status: "SCHEDULED",
      });
      
      const today = new Date().toISOString().split("T")[0];
      const todayAppts = response.content.filter(apt => 
        apt.appointmentTime.startsWith(today)
      );
      
      const completed = response.content.filter(apt => 
        apt.status === "COMPLETED" && apt.appointmentTime.startsWith(today)
      );

      setStats({
        todayPatients: todayAppts.length,
        completedToday: completed.length,
        inQueue: todayAppts.filter(apt => apt.status === "SCHEDULED").length,
        upcomingAppts: response.content.filter(apt => 
          apt.status === "SCHEDULED" && apt.appointmentTime > new Date().toISOString()
        ).length,
      });

      setQueuePatients(todayAppts.slice(0, 5));
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (isoDate: string) => {
    return new Date(isoDate).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  };

  const quickActions = [
    { 
      icon: ClipboardList, 
      label: "Xem hàng đợi", 
      href: "/doctor/queue",
      description: "Bệnh nhân chờ khám" 
    },
    { 
      icon: Stethoscope, 
      label: "Bắt đầu khám", 
      href: "/doctor/exam",
      description: "Khám bệnh nhân tiếp theo" 
    },
    { 
      icon: Calendar, 
      label: "Lịch làm việc", 
      href: "/doctor/schedule",
      description: "Xem lịch hẹn" 
    },
  ];

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
        <h1 className="text-display">Xin chào, BS. {user?.fullName || "Bác sĩ"}</h1>
        <p className="text-[hsl(var(--muted-foreground))] mt-1">
          Tổng quan hoạt động khám bệnh hôm nay
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Bệnh nhân hôm nay"
          value={stats.todayPatients}
          icon={<Users className="w-5 h-5" />}
          trend={{ value: `${stats.completedToday} đã khám`, direction: "neutral" }}
        />
        <StatCard
          title="Đang chờ khám"
          value={stats.inQueue}
          icon={<Clock className="w-5 h-5" />}
          trend={{ value: "Trong hàng đợi", direction: stats.inQueue > 5 ? "up" : "neutral" }}
        />
        <StatCard
          title="Đã hoàn thành"
          value={stats.completedToday}
          icon={<CheckCircle className="w-5 h-5" />}
          trend={{ value: "Hôm nay", direction: "up" }}
        />
        <StatCard
          title="Lịch hẹn sắp tới"
          value={stats.upcomingAppts}
          icon={<Calendar className="w-5 h-5" />}
          trend={{ value: "Tuần này", direction: "neutral" }}
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

        {/* Queue Preview */}
        <div className="lg:col-span-2 card-base">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-section">Bệnh nhân chờ khám</h3>
            <Link
              href="/doctor/queue"
              className="text-sm text-[hsl(var(--primary))] hover:underline flex items-center gap-1"
            >
              Xem tất cả
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {queuePatients.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 mx-auto text-green-500 opacity-50" />
              <p className="text-[hsl(var(--muted-foreground))] mt-2">
                Không có bệnh nhân nào đang chờ
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {queuePatients.map((apt, index) => (
                <div
                  key={apt.id}
                  className="flex items-center gap-4 p-4 rounded-xl border border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-[hsl(var(--primary-light))] flex items-center justify-center text-[hsl(var(--primary))] font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{apt.patient.fullName}</p>
                    <p className="text-small">{apt.reason || "Khám tổng quát"}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-[hsl(var(--primary))]">
                      {formatTime(apt.appointmentTime)}
                    </p>
                    <p className="text-small">{apt.type}</p>
                  </div>
                  <Link
                    href={`/doctor/exam/${apt.id}`}
                    className="btn-primary text-sm py-2"
                  >
                    Khám
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Alert if queue is long */}
      {stats.inQueue > 5 && (
        <div className="alert-banner">
          <AlertCircle className="w-5 h-5 text-[hsl(var(--warning))]" />
          <div className="flex-1">
            <p className="font-medium">Hàng đợi đang dài</p>
            <p className="text-sm opacity-80">
              Có {stats.inQueue} bệnh nhân đang chờ khám
            </p>
          </div>
          <Link href="/doctor/queue" className="btn-primary text-sm py-2">
            Xem hàng đợi
          </Link>
        </div>
      )}
    </div>
  );
}
