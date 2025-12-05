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
  Users,
  CalendarCheck,
  Stethoscope,
  DollarSign,
  Pill,
  TrendingUp,
  TrendingDown,
  Clock,
  UserPlus,
  Calendar,
  Activity,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

// Mock statistics data
const stats = [
  {
    title: "Total Patients",
    value: "1,234",
    change: "+12%",
    trend: "up",
    icon: Users,
    href: "/admin/patients",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    title: "Today's Appointments",
    value: "48",
    change: "+5",
    trend: "up",
    icon: CalendarCheck,
    href: "/admin/appointments",
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    title: "Pending Exams",
    value: "12",
    change: "-3",
    trend: "down",
    icon: Stethoscope,
    href: "/admin/exams",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  {
    title: "Today's Revenue",
    value: "₫15.2M",
    change: "+8%",
    trend: "up",
    icon: DollarSign,
    href: "/admin/billing",
    color: "text-amber-600",
    bgColor: "bg-amber-100",
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
    icon: UserPlus,
    href: "/admin/patients/new",
    color: "text-blue-600",
  },
  {
    title: "New Appointment",
    description: "Schedule appointment",
    icon: Calendar,
    href: "/admin/appointments/new",
    color: "text-green-600",
  },
  {
    title: "Start Exam",
    description: "Begin examination",
    icon: Activity,
    href: "/admin/exams/new",
    color: "text-purple-600",
  },
  {
    title: "Add Medicine",
    description: "Add to inventory",
    icon: Pill,
    href: "/admin/medicines/new",
    color: "text-amber-600",
  },
];

const statusColors: Record<string, string> = {
  Confirmed: "bg-green-100 text-green-700",
  Waiting: "bg-yellow-100 text-yellow-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Completed: "bg-gray-100 text-gray-700",
  Emergency: "bg-red-100 text-red-700",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s an overview of your hospital today.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.title} href={stat.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div
                      className={`flex items-center gap-1 text-sm ${
                        stat.trend === "up" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {stat.trend === "up" ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      {stat.change}
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">
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
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          <CardDescription>Common tasks you can perform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.title} href={action.href}>
                  <div className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer text-center">
                    <div className="p-3 rounded-full bg-muted">
                      <Icon className={`h-5 w-5 ${action.color}`} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{action.title}</p>
                      <p className="text-xs text-muted-foreground">
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">
                Today&apos;s Appointments
              </CardTitle>
              <CardDescription>
                <Clock className="h-3 w-3 inline mr-1" />
                {new Date().toLocaleDateString("vi-VN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/appointments">
                View all
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-center min-w-[50px]">
                      <p className="text-lg font-bold">{apt.time}</p>
                    </div>
                    <div>
                      <p className="font-medium">{apt.patientName}</p>
                      <p className="text-sm text-muted-foreground">
                        {apt.doctor} • {apt.type}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      statusColors[apt.status] || "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {apt.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Medicines */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Low Stock Alert</CardTitle>
              <CardDescription>
                Medicines running low on inventory
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
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
                return (
                  <div key={medicine.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{medicine.name}</p>
                      <span className="text-sm text-muted-foreground">
                        {medicine.quantity} / {medicine.threshold}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          percentage < 30
                            ? "bg-red-500"
                            : percentage < 60
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" className="w-full" asChild>
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
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">156</p>
            <p className="text-sm text-muted-foreground">Patients Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-green-600">89%</p>
            <p className="text-sm text-muted-foreground">Appointment Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-purple-600">24</p>
            <p className="text-sm text-muted-foreground">Active Doctors</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-amber-600">₫45.8M</p>
            <p className="text-sm text-muted-foreground">Weekly Revenue</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
