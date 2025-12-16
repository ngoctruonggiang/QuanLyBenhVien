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
import { LucideIcon, ArrowRight, Clock, Pill, Sparkles } from "lucide-react";
import Link from "next/link";

// Mock statistics data
type TrendDirection = keyof typeof TREND_ICONS;

const stats: Array<{
  title: string;
  value: string;
  change: string;
  trend: TrendDirection;
  icon: LucideIcon;
  href: string;
  gradient: string;
}> = [
  {
    title: "Total Patients",
    value: "1,234",
    change: "+12%",
    trend: "up",
    icon: NAV_ICONS.patients,
    href: "/admin/patients",
    gradient: "from-sky-500 to-blue-600",
  },
  {
    title: "Today's Appointments",
    value: "48",
    change: "+5",
    trend: "up",
    icon: NAV_ICONS.appointments,
    href: "/admin/appointments",
    gradient: "from-teal-500 to-emerald-600",
  },
  {
    title: "Pending Exams",
    value: "12",
    change: "-3",
    trend: "down",
    icon: NAV_ICONS.exams,
    href: "/admin/exams",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    title: "Today's Revenue",
    value: "₫15.2M",
    change: "+8%",
    trend: "up",
    icon: NAV_ICONS.billing,
    href: "/admin/billing",
    gradient: "from-amber-500 to-orange-600",
  },
];

// Mock recent appointments
const recentAppointments = [
  {
    id: "1",
    patientName: "Nguyen Van A",
    time: "09:00",
    doctor: "Dr. Tran Thi B",
    status: "Confirmed",
    type: "Check-up",
  },
  {
    id: "2",
    patientName: "Le Thi C",
    time: "09:30",
    doctor: "Dr. Pham Van D",
    status: "Waiting",
    type: "Follow-up",
  },
  {
    id: "3",
    patientName: "Hoang Van E",
    time: "10:00",
    doctor: "Dr. Tran Thi B",
    status: "In Progress",
    type: "Consultation",
  },
  {
    id: "4",
    patientName: "Pham Thi F",
    time: "10:30",
    doctor: "Dr. Nguyen Van G",
    status: "Confirmed",
    type: "Check-up",
  },
  {
    id: "5",
    patientName: "Vo Van H",
    time: "11:00",
    doctor: "Dr. Le Thi I",
    status: "Confirmed",
    type: "Emergency",
  },
];

// Mock low stock medicines
const lowStockMedicines = [
  { id: "1", name: "Paracetamol 500mg", quantity: 45, threshold: 100 },
  { id: "2", name: "Amoxicillin 250mg", quantity: 23, threshold: 50 },
  { id: "3", name: "Vitamin C 1000mg", quantity: 18, threshold: 30 },
  { id: "4", name: "Ibuprofen 400mg", quantity: 32, threshold: 80 },
];

// Quick actions
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
  Confirmed: {
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    icon: STATUS_ICONS.appointments.confirmed,
  },
  Waiting: {
    className: "bg-amber-50 text-amber-700 border border-amber-200",
    icon: STATUS_ICONS.appointments.waiting,
  },
  "In Progress": {
    className: "bg-sky-50 text-sky-700 border border-sky-200",
    icon: STATUS_ICONS.appointments.inProgress,
  },
  Completed: {
    className: "bg-slate-50 text-slate-700 border border-slate-200",
    icon: STATUS_ICONS.appointments.completed,
  },
  Emergency: {
    className: "bg-red-50 text-red-700 border border-red-200",
    icon: STATUS_ICONS.appointments.emergency,
  },
};

export default function DashboardPage() {
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
          <Sparkles className="h-4 w-4 text-sky-500" />
          <span className="text-sm font-medium text-sky-700">Live updates</span>
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
            <div className="space-y-3">
              {recentAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 border border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center min-w-[50px] py-1.5 px-2 rounded-lg bg-white border border-slate-200">
                      <p className="text-lg font-bold text-slate-900">{apt.time}</p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{apt.patientName}</p>
                      <p className="text-sm text-slate-500">
                        {apt.doctor} • {apt.type}
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
            <div className="space-y-4">
              {lowStockMedicines.map((medicine) => {
                const percentage =
                  (medicine.quantity / medicine.threshold) * 100;
                const isLow = percentage < 30;
                return (
                  <div key={medicine.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm text-slate-900">{medicine.name}</p>
                      <span className={`text-sm font-medium ${isLow ? 'text-red-600' : 'text-slate-600'}`}>
                        {medicine.quantity} / {medicine.threshold}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isLow 
                            ? "bg-gradient-to-r from-red-400 to-red-500" 
                            : "bg-gradient-to-r from-sky-400 to-teal-500"
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
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
          { value: "156", label: "Patients Today", color: "text-sky-600" },
          { value: "89%", label: "Appointment Rate", color: "text-emerald-600" },
          { value: "24", label: "Active Doctors", color: "text-violet-600" },
          { value: "₫45.8M", label: "Weekly Revenue", color: "text-amber-600" },
        ].map((item, index) => (
          <Card key={item.label} className={`border-0 shadow-sm hover:shadow-md transition-shadow animate-fade-in`} style={{ animationDelay: `${index * 0.1}s` }}>
            <CardContent className="p-5 text-center">
              <p className={`text-3xl font-bold ${item.color}`}>{item.value}</p>
              <p className="text-sm text-slate-500 mt-1">{item.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

