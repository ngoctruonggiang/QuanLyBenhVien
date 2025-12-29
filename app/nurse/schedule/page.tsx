"use client";

import { useState, useEffect } from "react";
import { 
  Calendar,
  Clock,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { hrService } from "@/services/hr.service";
import type { EmployeeSchedule } from "@/interfaces/hr";

export default function NurseSchedulePage() {
  const [schedules, setSchedules] = useState<EmployeeSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(today.setDate(diff));
  });

  useEffect(() => {
    fetchSchedules();
  }, [currentWeekStart]);

  const getWeekDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const startDate = currentWeekStart.toISOString().split("T")[0];
      const endDate = new Date(currentWeekStart);
      endDate.setDate(endDate.getDate() + 6);
      
      const response = await hrService.getMySchedules({
        startDate,
        endDate: endDate.toISOString().split("T")[0],
      });
      setSchedules(response.content || []);
    } catch (error) {
      console.error("Failed to fetch schedules:", error);
      toast.error("Không thể tải lịch làm việc");
    } finally {
      setLoading(false);
    }
  };

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    setCurrentWeekStart(newDate);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("vi-VN", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
    });
  };

  const getScheduleForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return schedules.filter(s => s.workDate === dateStr);
  };

  const weekDates = getWeekDates();
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-display">Lịch làm việc</h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">
            Xem lịch làm việc của bạn
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigateWeek("prev")} className="btn-icon">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-medium min-w-[200px] text-center">
            {currentWeekStart.toLocaleDateString("vi-VN", { 
              day: "2-digit", 
              month: "2-digit" 
            })} - {weekDates[6].toLocaleDateString("vi-VN", { 
              day: "2-digit", 
              month: "2-digit",
              year: "numeric" 
            })}
          </span>
          <button onClick={() => navigateWeek("next")} className="btn-icon">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Schedule Grid */}
      {loading ? (
        <div className="card-base text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[hsl(var(--primary))]" />
          <p className="text-small mt-2">Đang tải...</p>
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-2">
          {weekDates.map((date, index) => {
            const daySchedules = getScheduleForDate(date);
            const today = isToday(date);
            
            return (
              <div 
                key={index}
                className={`card-base min-h-[200px] ${today ? "border-2 border-[hsl(var(--primary))]" : ""}`}
              >
                <div className={`text-center p-2 -mx-4 -mt-4 mb-3 rounded-t-xl ${today ? "bg-[hsl(var(--primary))] text-white" : "bg-[hsl(var(--secondary))]"}`}>
                  <p className="text-sm font-medium">{formatDate(date)}</p>
                </div>
                
                {daySchedules.length === 0 ? (
                  <p className="text-center text-small text-[hsl(var(--muted-foreground))]">
                    Nghỉ
                  </p>
                ) : (
                  <div className="space-y-2">
                    {daySchedules.map((schedule, i) => (
                      <div 
                        key={i}
                        className={`p-2 rounded-lg text-xs ${
                          schedule.status === "CANCELLED" 
                            ? "bg-red-100 text-red-700" 
                            : "bg-[hsl(var(--primary-light))] text-[hsl(var(--primary))]"
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span className="font-medium">
                            {schedule.startTime?.slice(0, 5)} - {schedule.endTime?.slice(0, 5)}
                          </span>
                        </div>
                        {schedule.notes && (
                          <p className="mt-1 text-[10px]">{schedule.notes}</p>
                        )}
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
        <h3 className="text-label mb-2">Chú thích</h3>
        <div className="flex gap-4 text-sm">
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[hsl(var(--primary-light))]" />
            Có lịch
          </span>
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-100" />
            Đã hủy
          </span>
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-[hsl(var(--primary))]" />
            Hôm nay
          </span>
        </div>
      </div>
    </div>
  );
}
