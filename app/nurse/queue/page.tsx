"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Clock,
  Phone,
  Heart,
  CheckCircle,
  Loader2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { appointmentService, Appointment } from "@/services/appointment.service";

export default function NurseQueuePage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "vital-pending" | "completed">("all");

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const response = await appointmentService.list({
        status: "SCHEDULED",
      });
      
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

  const formatTime = (isoDate: string) => {
    return new Date(isoDate).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  };

  // Mock vital signs status - in real app this would come from API
  const hasVitalSigns = (apt: Appointment) => {
    return Math.random() > 0.5; // Mock
  };

  const filteredAppointments = appointments.filter(apt => {
    if (filter === "all") return true;
    if (filter === "vital-pending") return !hasVitalSigns(apt);
    if (filter === "completed") return hasVitalSigns(apt);
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-display">Hàng đợi bệnh nhân</h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">
            {appointments.length} bệnh nhân hôm nay
          </p>
        </div>
        <button onClick={fetchQueue} className="btn-secondary">
          <Loader2 className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Làm mới
        </button>
      </div>

      {/* Filters */}
      <div className="card-base">
        <div className="flex flex-wrap gap-2">
          {[
            { value: "all", label: "Tất cả" },
            { value: "vital-pending", label: "Chờ đo sinh hiệu" },
            { value: "completed", label: "Đã đo" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f.value
                  ? "bg-[hsl(var(--primary))] text-white"
                  : "bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary))]/80"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Queue List */}
      <div className="space-y-4">
        {loading ? (
          <div className="card-base text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[hsl(var(--primary))]" />
            <p className="text-small mt-2">Đang tải hàng đợi...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="card-base text-center py-12">
            <CheckCircle className="w-12 h-12 mx-auto text-green-500 opacity-50" />
            <p className="text-[hsl(var(--muted-foreground))] mt-2">
              {filter === "vital-pending" 
                ? "Không có bệnh nhân nào chờ đo sinh hiệu" 
                : "Không có bệnh nhân nào trong hàng đợi"}
            </p>
          </div>
        ) : (
          filteredAppointments.map((apt, index) => {
            const vitalDone = hasVitalSigns(apt);
            return (
              <div
                key={apt.id}
                className={`card-base flex flex-col md:flex-row md:items-center gap-4 ${
                  !vitalDone ? "border-l-4 border-l-[hsl(var(--warning))]" : ""
                }`}
              >
                {/* Queue Number */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${
                  vitalDone 
                    ? "bg-green-100 text-green-600" 
                    : "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]"
                }`}>
                  {index + 1}
                </div>

                {/* Patient Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold">{apt.patient.fullName}</p>
                    {vitalDone ? (
                      <span className="badge badge-success text-xs">
                        <CheckCircle className="w-3 h-3" />
                        Đã đo sinh hiệu
                      </span>
                    ) : (
                      <span className="badge badge-warning text-xs">
                        <AlertCircle className="w-3 h-3" />
                        Chờ đo sinh hiệu
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
                  </div>
                  {apt.reason && (
                    <p className="mt-2 text-sm">
                      <span className="font-medium">Lý do:</span> {apt.reason}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {!vitalDone && (
                    <Link
                      href={`/nurse/vital-signs/${apt.id}`}
                      className="btn-primary"
                    >
                      <Heart className="w-4 h-4" />
                      Đo sinh hiệu
                    </Link>
                  )}
                  <Link
                    href={`/nurse/patient/${apt.patient.id}`}
                    className="btn-secondary"
                  >
                    Chi tiết
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
