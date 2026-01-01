"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ACTION_ICONS,
  NAV_ICONS,
  STATUS_ICONS,
  TREND_ICONS,
} from "@/config/icons";
import { LucideIcon, ArrowRight, Clock, Pill, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";
import { usePatients } from "@/hooks/queries/usePatient";
import { useAppointmentList } from "@/hooks/queries/useAppointment";
import { useMedicines } from "@/hooks/queries/useMedicine";
import { useDashboardReports } from "@/hooks/queries/useReports";
import { format, startOfDay, endOfDay } from "date-fns";
import { Appointment } from "@/interfaces/appointment";

// Statistics display type
type TrendDirection = keyof typeof TREND_ICONS;

// Quick actions config (static)
const quickActions = [
  {
    title: "Register Patient",
    description: "Add new patient",
    icon: ACTION_ICONS.registerPatient,
    href: "/admin/patients/new",
    color: "bg-sky-500",
  },
  {
    title: "New Appointment",
    description: "Schedule appointment",
    icon: ACTION_ICONS.newAppointment,
    href: "/admin/appointments/new",
    color: "bg-teal-500",
  },
  {
    title: "Start Exam",
    description: "Begin examination",
    icon: ACTION_ICONS.startExam,
    href: "/admin/exams/new",
    color: "bg-violet-500",
  },
  {
    title: "Add Medicine",
    description: "Add to inventory",
    icon: ACTION_ICONS.addMedicine,
    href: "/admin/medicines/new",
    color: "bg-amber-500",
  },
];

const statusStyles: Record<string, { className: string; icon: LucideIcon }> = {
  SCHEDULED: {
    className: "bg-blue-50 text-blue-700 border border-blue-200",
    icon: STATUS_ICONS.appointments.confirmed,
  },
  IN_PROGRESS: {
    className: "bg-sky-50 text-sky-700 border border-sky-200",
    icon: STATUS_ICONS.appointments.inProgress,
  },
  COMPLETED: {
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    icon: STATUS_ICONS.appointments.completed,
  },
  CANCELLED: {
    className: "bg-red-50 text-red-700 border border-red-200",
    icon: STATUS_ICONS.appointments.emergency,
  },
  NO_SHOW: {
    className: "bg-amber-50 text-amber-700 border border-amber-200",
    icon: STATUS_ICONS.appointments.waiting,
  },
};

// Format currency
const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `₫${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `₫${(value / 1000).toFixed(0)}K`;
  }
  return `₫${value.toLocaleString()}`;
};

export default function DashboardPage() {
  // Get today's date range
  const today = new Date();
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);
  const todayStr = format(todayStart, "yyyy-MM-dd");

  // Fetch real data
  const { data: patientsData, isLoading: patientsLoading } = usePatients({ page: 0, size: 1 });
  const { data: appointmentsData, isLoading: appointmentsLoading } = useAppointmentList({
    page: 0,
    size: 5,
    startDate: todayStr,
    endDate: todayStr,
    sort: "appointmentTime,asc",
  });
  const { data: medicinesData, isLoading: medicinesLoading } = useMedicines({
    page: 0,
    size: 100,
  });
  const reportsData = useDashboardReports(todayStr, todayStr);

  // Calculate statistics from real data
  const totalPatients = patientsData?.totalElements || 0;
  const todayAppointments = appointmentsData?.totalElements || 0;
  const recentAppointments: Appointment[] = appointmentsData?.content || [];
  
  // Get low stock medicines (quantity < 50)
  const allMedicines = medicinesData?.content || [];
  const lowStockMedicines = allMedicines
    .filter((m) => m.quantity < 50)
    .slice(0, 4);

  // Revenue from reports
  const todayRevenue = reportsData.revenue.data?.totalRevenue || 0;
  const reportsLoading = reportsData.isLoading;

  // Build stats array
  const stats: Array<{
    title: string;
    value: string;
    change: string;
    trend: TrendDirection;
    icon: LucideIcon;
    href: string;
    gradient: string;
    loading: boolean;
  }> = [
    {
      title: "Total Patients",
      value: patientsLoading ? "..." : totalPatients.toLocaleString(),
      change: "+0%",
      trend: "up",
      icon: NAV_ICONS.patients,
      href: "/admin/patients",
      gradient: "from-sky-500 to-blue-600",
      loading: patientsLoading,
    },
    {
      title: "Today's Appointments",
      value: appointmentsLoading ? "..." : todayAppointments.toString(),
      change: "+0",
      trend: "up",
      icon: NAV_ICONS.appointments,
      href: "/admin/appointments",
      gradient: "from-teal-500 to-emerald-600",
      loading: appointmentsLoading,
    },
    {
      title: "Low Stock Items",
      value: medicinesLoading ? "..." : lowStockMedicines.length.toString(),
      change: lowStockMedicines.length > 0 ? "Attention" : "OK",
      trend: lowStockMedicines.length > 0 ? "down" : "up",
      icon: NAV_ICONS.medicines,
      href: "/admin/medicines",
      gradient: "from-violet-500 to-purple-600",
      loading: medicinesLoading,
    },
    {
      title: "Today's Revenue",
      value: reportsLoading ? "..." : formatCurrency(todayRevenue),
      change: "+0%",
      trend: "up",
      icon: NAV_ICONS.billing,
      href: "/admin/billing",
      gradient: "from-amber-500 to-orange-600",
      loading: reportsLoading,
    },
  ];

  const isLoading = patientsLoading || appointmentsLoading || medicinesLoading || reportsLoading;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">
            Welcome back! Here&apos;s an overview of your hospital today.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-sky-50 to-teal-50 border border-sky-100">
          {isLoading ? (
            <Loader2 className="h-4 w-4 text-sky-500 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 text-sky-500" />
          )}
          <span className="text-sm font-medium text-sky-700">
            {isLoading ? "Loading..." : "Live data"}
          </span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.title} href={stat.href}>
              <Card className={`group relative overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md animate-fade-in-up`} style={{ animationDelay: `${index * 0.1}s` }}>
                {/* Gradient accent */}
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.gradient} opacity-10 rounded-bl-full`} />
                
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div
                      className={`flex items-center gap-1 text-sm font-medium ${
                        stat.trend === "up"
                          ? "text-emerald-600"
                          : "text-red-500"
                      }`}
                    >
                      {(() => {
                        const TrendIcon = TREND_ICONS[stat.trend];
                        return <TrendIcon className="h-4 w-4" />;
                      })()}
                      {stat.change}
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                    <p className="text-sm text-slate-500 mt-1">
                      {stat.title}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-slate-900">Quick Actions</CardTitle>
          <CardDescription>Common tasks you can perform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link key={action.title} href={action.href}>
                  <div className={`group flex flex-col items-center gap-3 p-5 rounded-xl border border-slate-100 bg-white hover:shadow-md hover:border-slate-200 transition-all duration-200 cursor-pointer text-center animate-fade-in`} style={{ animationDelay: `${index * 0.05}s` }}>
                    <div className={`p-3 rounded-xl ${action.color} shadow-md group-hover:scale-110 transition-transform duration-200`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-slate-900">{action.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg font-semibold text-slate-900">
                Today&apos;s Appointments
              </CardTitle>
              <CardDescription className="flex items-center gap-1.5 mt-1">
                <Clock className="h-3.5 w-3.5" />
                {new Date().toLocaleDateString("vi-VN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-sky-600 hover:text-sky-700 hover:bg-sky-50">
              <Link href="/admin/appointments">
                View all
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {appointmentsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : recentAppointments.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                No appointments scheduled for today
              </div>
            ) : (
              <div className="space-y-3">
                {recentAppointments.slice(0, 5).map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 border border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-center min-w-[50px] py-1.5 px-2 rounded-lg bg-white border border-slate-200">
                        <p className="text-lg font-bold text-slate-900">
                          {apt.appointmentTime ? format(new Date(apt.appointmentTime), "HH:mm") : "--:--"}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{apt.patient?.fullName || "Unknown Patient"}</p>
                        <p className="text-sm text-slate-500">
                          {apt.doctor?.fullName || "Unknown Doctor"} • {apt.type || "Consultation"}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        statusStyles[apt.status]?.className ||
                        "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {(() => {
                        const Icon =
                          statusStyles[apt.status]?.icon ||
                          STATUS_ICONS.appointments.waiting;
                        return <Icon className="h-3 w-3" />;
                      })()}
                      {apt.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Medicines */}
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg font-semibold text-slate-900">Low Stock Alert</CardTitle>
              <CardDescription className="mt-1">
                Medicines running low on inventory
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-sky-600 hover:text-sky-700 hover:bg-sky-50">
              <Link href="/admin/medicines">
                View all
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {medicinesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : lowStockMedicines.length === 0 ? (
              <div className="text-center py-8 text-emerald-600">
                <STATUS_ICONS.appointments.completed className="h-8 w-8 mx-auto mb-2" />
                <p>All items are well stocked!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {lowStockMedicines.map((medicine) => {
                  const percentage = Math.min((medicine.quantity / 50) * 100, 100);
                  const isLow = percentage < 30;
                  return (
                    <div key={medicine.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm text-slate-900">{medicine.name}</p>
                        <span className={`text-sm font-medium ${isLow ? 'text-red-600' : 'text-slate-600'}`}>
                          {medicine.quantity} units
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isLow 
                              ? "bg-gradient-to-r from-red-400 to-red-500" 
                              : "bg-gradient-to-r from-sky-400 to-teal-500"
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="mt-6 pt-4 border-t border-slate-100">
              <Button className="w-full bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white shadow-md" asChild>
                <Link href="/admin/medicines/new">
                  <Pill className="h-4 w-4 mr-2" />
                  Restock Inventory
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { value: totalPatients.toString(), label: "Total Patients", color: "text-sky-600", loading: patientsLoading },
          { value: `${todayAppointments}`, label: "Today's Appointments", color: "text-emerald-600", loading: appointmentsLoading },
          { value: allMedicines.length.toString(), label: "Medicine Types", color: "text-violet-600", loading: medicinesLoading },
          { value: formatCurrency(todayRevenue), label: "Today's Revenue", color: "text-amber-600", loading: reportsLoading },
        ].map((item, index) => (
          <Card key={item.label} className={`border-0 shadow-sm hover:shadow-md transition-shadow animate-fade-in`} style={{ animationDelay: `${index * 0.1}s` }}>
            <CardContent className="p-5 text-center">
              {item.loading ? (
                <Loader2 className={`h-8 w-8 mx-auto animate-spin ${item.color}`} />
              ) : (
                <p className={`text-3xl font-bold ${item.color}`}>{item.value}</p>
              )}
              <p className="text-sm text-slate-500 mt-1">{item.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
