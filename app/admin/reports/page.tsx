"use client";

import Link from "next/link";
import { 
  DollarSign,
  Calendar,
  Users,
  ArrowRight,
  TrendingUp,
  BarChart3,
  PieChart,
} from "lucide-react";

const reports = [
  {
    title: "Báo cáo doanh thu",
    description: "Tổng quan doanh thu, phân tích thanh toán và xu hướng thu nhập",
    icon: DollarSign,
    href: "/admin/reports/revenue",
    color: "bg-green-500",
    stats: [
      { label: "Tổng doanh thu", value: "125.6M" },
      { label: "Tăng trưởng", value: "+11.7%" },
    ],
  },
  {
    title: "Báo cáo lịch hẹn",
    description: "Thống kê lịch hẹn, tỷ lệ hoàn thành và hiệu suất bác sĩ",
    icon: Calendar,
    href: "/admin/reports/appointments",
    color: "bg-blue-500",
    stats: [
      { label: "Tổng lịch hẹn", value: "456" },
      { label: "Hoàn thành", value: "85.3%" },
    ],
  },
  {
    title: "Báo cáo bệnh nhân",
    description: "Phân tích bệnh nhân, đăng ký mới và phân bổ nhân khẩu học",
    icon: Users,
    href: "/admin/reports/patients",
    color: "bg-purple-500",
    stats: [
      { label: "Tổng bệnh nhân", value: "2,456" },
      { label: "Mới tháng này", value: "+156" },
    ],
  },
];

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-display">Báo cáo & Thống kê</h1>
        <p className="text-[hsl(var(--muted-foreground))] mt-1">
          Xem các báo cáo phân tích hoạt động bệnh viện
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-base bg-gradient-to-br from-green-500/10 to-green-500/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500 text-white flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-small">Doanh thu tháng này</p>
              <p className="text-2xl font-bold">125.6M VND</p>
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
              <p className="text-2xl font-bold">389 / 456</p>
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
              <p className="text-2xl font-bold">+156 người</p>
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
            <div className="mt-4 pt-4 border-t border-[hsl(var(--border))] grid grid-cols-2 gap-4">
              {report.stats.map((stat, i) => (
                <div key={i}>
                  <p className="text-small">{stat.label}</p>
                  <p className="text-xl font-bold">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Action */}
            <div className="mt-4 flex items-center gap-2 text-[hsl(var(--primary))] font-medium">
              Xem chi tiết
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
