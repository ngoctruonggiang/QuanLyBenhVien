"use client";

import { useState, useEffect } from "react";
import { 
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Loader2,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { appointmentService, Appointment } from "@/services/appointment.service";
import { useAuth } from "@/contexts/AuthContext";

const DAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const FULL_DAYS = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

export default function DoctorSchedulePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(now.setDate(diff));
  });

  useEffect(() => {
    fetchAppointments();
  }, [currentWeekStart]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentService.list({});
      setAppointments(response.content);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
      toast.error("Không thể tải lịch làm việc");
    } finally {
      setLoading(false);
    }
  };

  const navigateWeek = (direction: number) => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + direction * 7);
    setCurrentWeekStart(newStart);
  };

  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const getAppointmentsForDay = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return appointments.filter(apt => apt.appointmentTime.startsWith(dateStr));
  };

  const formatTime = (isoDate: string) => {
    return new Date(isoDate).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  };

  const weekDays = getWeekDays();
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-display">Lịch làm việc</h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">
            BS. {user?.fullName || "Bác sĩ"}
          </p>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="card-base">
        <div className="flex items-center justify-between">
          <button onClick={() => navigateWeek(-1)} className="btn-icon">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <p className="font-semibold">
              {currentWeekStart.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}
              {" - "}
              {new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
            </p>
          </div>
          <button onClick={() => navigateWeek(1)} className="btn-icon">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      {loading ? (
        <div className="card-base text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[hsl(var(--primary))]" />
          <p className="text-small mt-2">Đang tải...</p>
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-2">
          {/* Day Headers */}
          {weekDays.map((date, i) => {
            const isToday = date.toISOString().split("T")[0] === today;
            return (
              <div
                key={i}
                className={`text-center p-3 rounded-t-xl ${
                  isToday 
                    ? "bg-[hsl(var(--primary))] text-white" 
                    : "bg-[hsl(var(--secondary))]"
                }`}
              >
                <p className="text-sm font-medium">{DAYS[date.getDay()]}</p>
                <p className="text-2xl font-bold">{date.getDate()}</p>
              </div>
            );
          })}

          {/* Day Contents */}
          {weekDays.map((date, i) => {
            const dayAppts = getAppointmentsForDay(date);
            const isToday = date.toISOString().split("T")[0] === today;
            return (
              <div
                key={`content-${i}`}
                className={`min-h-[200px] p-2 rounded-b-xl border ${
                  isToday 
                    ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary-light))]" 
                    : "border-[hsl(var(--border))]"
                }`}
              >
                {dayAppts.length === 0 ? (
                  <p className="text-xs text-[hsl(var(--muted-foreground))] text-center py-4">
                    Không có lịch
                  </p>
                ) : (
                  <div className="space-y-1">
                    {dayAppts.map((apt) => (
                      <div
                        key={apt.id}
                        className={`p-2 rounded-lg text-xs ${
                          apt.status === "COMPLETED"
                            ? "bg-green-100 text-green-700"
                            : apt.status === "CANCELLED"
                            ? "bg-red-100 text-red-700"
                            : "bg-[hsl(var(--primary))] text-white"
                        }`}
                      >
                        <p className="font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(apt.appointmentTime)}
                        </p>
                        <p className="truncate flex items-center gap-1 mt-1">
                          <User className="w-3 h-3" />
                          {apt.patient.fullName}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="card-base">
        <h3 className="text-label mb-3">Chú thích</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[hsl(var(--primary))]" />
            Đã đặt
          </span>
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500" />
            Hoàn thành
          </span>
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500" />
            Đã hủy
          </span>
        </div>
      </div>
    </div>
  );
}
