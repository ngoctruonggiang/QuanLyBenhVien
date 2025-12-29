"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Clock,
  Phone,
  Stethoscope,
  CheckCircle,
  Loader2,
  User,
  AlertCircle,
  Play,
} from "lucide-react";
import { toast } from "sonner";
import { appointmentService, Appointment } from "@/services/appointment.service";

export default function DoctorQueuePage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const response = await appointmentService.list({
        status: "SCHEDULED",
      });
      
      // Filter today's appointments and sort by time
      const today = new Date().toISOString().split("T")[0];
      const todayAppts = response.content
        .filter(apt => apt.appointmentTime.startsWith(today))
        .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime));
      
      setAppointments(todayAppts);
    } catch (error) {
      console.error("Failed to fetch queue:", error);
      toast.error("Không thể tải hàng đợi");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (apt: Appointment) => {
    try {
      await appointmentService.complete(apt.id);
      toast.success(`Đã hoàn thành khám cho ${apt.patient.fullName}`);
      fetchQueue();
    } catch (error) {
      toast.error("Không thể cập nhật trạng thái");
    }
  };

  const formatTime = (isoDate: string) => {
    return new Date(isoDate).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  };

  const getQueuePosition = (index: number) => {
    return index + 1;
  };

  const currentTime = new Date();
  const isLate = (appointmentTime: string) => {
    const aptTime = new Date(appointmentTime);
    return currentTime > aptTime;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-display">Hàng đợi bệnh nhân</h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">
            {appointments.length} bệnh nhân đang chờ khám hôm nay
          </p>
        </div>
        <button onClick={fetchQueue} className="btn-secondary">
          <Loader2 className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Làm mới
        </button>
      </div>

      {/* Queue List */}
      <div className="space-y-4">
        {loading ? (
          <div className="card-base text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[hsl(var(--primary))]" />
            <p className="text-small mt-2">Đang tải hàng đợi...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="card-base text-center py-12">
            <CheckCircle className="w-12 h-12 mx-auto text-green-500 opacity-50" />
            <p className="text-[hsl(var(--muted-foreground))] mt-2">
              Không có bệnh nhân nào đang chờ
            </p>
            <p className="text-small mt-1">
              Hàng đợi sẽ tự động cập nhật khi có bệnh nhân mới
            </p>
          </div>
        ) : (
          appointments.map((apt, index) => (
            <div
              key={apt.id}
              className={`card-base flex flex-col md:flex-row md:items-center gap-4 ${
                index === 0 ? "border-2 border-[hsl(var(--primary))] bg-[hsl(var(--primary-light))]" : ""
              }`}
            >
              {/* Queue Number */}
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold ${
                index === 0 
                  ? "bg-[hsl(var(--primary))] text-white" 
                  : "bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))]"
              }`}>
                #{getQueuePosition(index)}
              </div>

              {/* Patient Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold">{apt.patient.fullName}</p>
                  {isLate(apt.appointmentTime) && (
                    <span className="badge badge-warning text-xs">
                      <AlertCircle className="w-3 h-3" />
                      Trễ giờ
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-[hsl(var(--muted-foreground))]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatTime(apt.appointmentTime)}
                  </span>
                  {apt.patient.phoneNumber && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {apt.patient.phoneNumber}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Stethoscope className="w-4 h-4" />
                    {apt.type === "CONSULTATION" ? "Khám mới" : apt.type === "FOLLOW_UP" ? "Tái khám" : "Cấp cứu"}
                  </span>
                </div>
                {apt.reason && (
                  <p className="mt-2 text-sm">
                    <span className="font-medium">Lý do:</span> {apt.reason}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Link
                  href={`/doctor/exam/${apt.id}`}
                  className={`btn-primary ${index === 0 ? "" : "opacity-70"}`}
                >
                  {index === 0 && <Play className="w-4 h-4" />}
                  {index === 0 ? "Bắt đầu khám" : "Khám"}
                </Link>
                <button
                  onClick={() => handleComplete(apt)}
                  className="btn-secondary"
                >
                  <CheckCircle className="w-4 h-4" />
                  Hoàn thành
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Legend */}
      {appointments.length > 0 && (
        <div className="card-base">
          <h3 className="text-label mb-3">Chú thích</h3>
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-[hsl(var(--primary))]" />
              Bệnh nhân tiếp theo
            </span>
            <span className="flex items-center gap-2">
              <span className="badge badge-warning text-xs">
                <AlertCircle className="w-3 h-3" />
                Trễ giờ
              </span>
              Đã qua giờ hẹn
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
