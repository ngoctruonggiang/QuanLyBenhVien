"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Users, 
  ClipboardList, 
  Heart,
  TestTube,
  Pill,
  Clock,
  ArrowRight,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { StatCard } from "@/components/dashboard";
import { appointmentService, Appointment } from "@/services/appointment.service";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardStats {
  waitingPatients: number;
  vitalSignsPending: number;
  labResultsPending: number;
  prescriptionsPending: number;
}

export default function NurseDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    waitingPatients: 0,
    vitalSignsPending: 0,
    labResultsPending: 0,
    prescriptionsPending: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentPatients, setRecentPatients] = useState<Appointment[]>([]);

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

      setStats({
        waitingPatients: todayAppts.length,
        vitalSignsPending: Math.floor(todayAppts.length * 0.6), // Mock
        labResultsPending: Math.floor(todayAppts.length * 0.3), // Mock
        prescriptionsPending: Math.floor(todayAppts.length * 0.4), // Mock
      });

      setRecentPatients(todayAppts.slice(0, 5));
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
      href: "/nurse/queue",
      description: "Bệnh nhân chờ khám",
      count: stats.waitingPatients,
    },
    { 
      icon: Heart, 
      label: "Ghi sinh hiệu", 
      href: "/nurse/vital-signs",
      description: "Chờ đo sinh hiệu",
      count: stats.vitalSignsPending,
    },
    { 
      icon: TestTube, 
      label: "Kết quả XN", 
      href: "/nurse/lab-results",
      description: "Chờ nhập kết quả",
      count: stats.labResultsPending,
    },
    { 
      icon: Pill, 
      label: "Phát thuốc", 
      href: "/nurse/pharmacy",
      description: "Đơn chờ phát",
      count: stats.prescriptionsPending,
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
        <h1 className="text-display">Xin chào, {user?.fullName || "Y tá"}</h1>
        <p className="text-[hsl(var(--muted-foreground))] mt-1">
          Tổng quan hoạt động hôm nay
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Bệnh nhân chờ"
          value={stats.waitingPatients}
          icon={<Users className="w-5 h-5" />}
          trend={{ value: "Hôm nay", direction: "neutral" }}
        />
        <StatCard
          title="Chờ đo sinh hiệu"
          value={stats.vitalSignsPending}
          icon={<Heart className="w-5 h-5" />}
          trend={{ value: "Cần xử lý", direction: stats.vitalSignsPending > 3 ? "up" : "neutral" }}
        />
        <StatCard
          title="Chờ kết quả XN"
          value={stats.labResultsPending}
          icon={<TestTube className="w-5 h-5" />}
          trend={{ value: "Chờ nhập", direction: "neutral" }}
        />
        <StatCard
          title="Đơn chờ phát"
          value={stats.prescriptionsPending}
          icon={<Pill className="w-5 h-5" />}
          trend={{ value: "Nhà thuốc", direction: "neutral" }}
        />
      </div>

      {/* Quick Actions */}
      <div className="card-base">
        <h3 className="text-section mb-4">Thao tác nhanh</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, i) => (
            <Link
              key={i}
              href={action.href}
              className="flex items-center gap-4 p-4 rounded-xl border border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-light))] transition-colors group"
            >
              <div className="w-12 h-12 rounded-xl bg-[hsl(var(--primary-light))] flex items-center justify-center text-[hsl(var(--primary))] group-hover:bg-[hsl(var(--primary))] group-hover:text-white transition-colors relative">
                <action.icon className="w-6 h-6" />
                {action.count > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                    {action.count}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium">{action.label}</p>
                <p className="text-small">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Patients */}
      <div className="card-base">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-section">Bệnh nhân gần đây</h3>
          <Link
            href="/nurse/queue"
            className="text-sm text-[hsl(var(--primary))] hover:underline flex items-center gap-1"
          >
            Xem tất cả
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {recentPatients.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 mx-auto text-green-500 opacity-50" />
            <p className="text-[hsl(var(--muted-foreground))] mt-2">
              Không có bệnh nhân nào đang chờ
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentPatients.map((apt) => (
              <div
                key={apt.id}
                className="flex items-center gap-4 p-4 rounded-xl border border-[hsl(var(--border))]"
              >
                <div className="avatar">
                  {apt.patient.fullName.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{apt.patient.fullName}</p>
                  <p className="text-small">{apt.reason || "Khám tổng quát"}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm text-[hsl(var(--primary))]">
                    <Clock className="w-4 h-4" />
                    {formatTime(apt.appointmentTime)}
                  </div>
                </div>
                <Link
                  href={`/nurse/vital-signs/${apt.id}`}
                  className="btn-secondary text-sm py-2"
                >
                  Đo sinh hiệu
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Alert */}
      {stats.vitalSignsPending > 3 && (
        <div className="alert-banner">
          <AlertCircle className="w-5 h-5 text-[hsl(var(--warning))]" />
          <div className="flex-1">
            <p className="font-medium">Nhiều bệnh nhân chờ đo sinh hiệu</p>
            <p className="text-sm opacity-80">
              Có {stats.vitalSignsPending} bệnh nhân cần đo sinh hiệu
            </p>
          </div>
          <Link href="/nurse/vital-signs" className="btn-primary text-sm py-2">
            Xử lý
          </Link>
        </div>
      )}
    </div>
  );
}
