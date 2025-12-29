"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft,
  Calendar,
  Clock,
  Stethoscope,
  Save,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { appointmentService } from "@/services/appointment.service";
import { hrService } from "@/services/hr.service";
import { useAuth } from "@/contexts/AuthContext";

interface Doctor {
  id: string;
  fullName: string;
  department?: string;
}

export default function NewAppointmentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  const [formData, setFormData] = useState({
    doctorId: "",
    appointmentDate: "",
    appointmentTime: "",
    reason: "",
    type: "CONSULTATION" as "CONSULTATION" | "FOLLOW_UP" | "EMERGENCY",
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoadingDoctors(true);
      const response = await hrService.getEmployees({ role: "DOCTOR" });
      setDoctors(response.content.map((emp: any) => ({
        id: emp.id,
        fullName: emp.fullName,
        department: emp.department?.name,
      })));
    } catch (error) {
      console.error("Failed to fetch doctors:", error);
      toast.error("Không thể tải danh sách bác sĩ");
    } finally {
      setLoadingDoctors(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.doctorId || !formData.appointmentDate || !formData.appointmentTime) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      setLoading(true);
      
      const appointmentTime = `${formData.appointmentDate}T${formData.appointmentTime}:00`;
      
      await appointmentService.create({
        patientId: user?.accountId || "",
        doctorId: formData.doctorId,
        appointmentTime,
        type: formData.type,
        reason: formData.reason || "Khám tổng quát",
      });

      toast.success("Đặt lịch hẹn thành công!");
      router.push("/patient/appointments");
    } catch (error) {
      toast.error("Không thể đặt lịch hẹn. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Generate time slots
  const timeSlots = [];
  for (let h = 8; h <= 17; h++) {
    for (let m = 0; m < 60; m += 30) {
      if (h === 17 && m > 0) break;
      timeSlots.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
    }
  }

  // Get min date (today)
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/patient/appointments" className="btn-icon">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-display">Đặt lịch hẹn mới</h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">
            Chọn bác sĩ và thời gian khám
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card-base space-y-6">
        {/* Doctor Selection */}
        <div className="space-y-2">
          <label className="text-label flex items-center gap-2">
            <Stethoscope className="w-4 h-4" />
            Chọn bác sĩ *
          </label>
          {loadingDoctors ? (
            <div className="flex items-center gap-2 py-3">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-small">Đang tải danh sách bác sĩ...</span>
            </div>
          ) : (
            <select
              className="dropdown w-full"
              value={formData.doctorId}
              onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
              required
            >
              <option value="">-- Chọn bác sĩ --</option>
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  BS. {doc.fullName} {doc.department && `- ${doc.department}`}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Date */}
        <div className="space-y-2">
          <label className="text-label flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Ngày khám *
          </label>
          <input
            type="date"
            className="input-base"
            min={today}
            value={formData.appointmentDate}
            onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
            required
          />
        </div>

        {/* Time */}
        <div className="space-y-2">
          <label className="text-label flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Giờ khám *
          </label>
          <select
            className="dropdown w-full"
            value={formData.appointmentTime}
            onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
            required
          >
            <option value="">-- Chọn giờ --</option>
            {timeSlots.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>

        {/* Type */}
        <div className="space-y-2">
          <label className="text-label">Loại khám</label>
          <div className="flex gap-2">
            {[
              { value: "CONSULTATION", label: "Khám mới" },
              { value: "FOLLOW_UP", label: "Tái khám" },
            ].map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData({ ...formData, type: type.value as any })}
                className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                  formData.type === type.value
                    ? "bg-[hsl(var(--primary))] text-white"
                    : "bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary))]/80"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reason */}
        <div className="space-y-2">
          <label className="text-label">Lý do khám</label>
          <textarea
            className="input-base min-h-[100px] resize-none"
            placeholder="Mô tả triệu chứng hoặc lý do khám..."
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-[hsl(var(--border))]">
          <Link href="/patient/appointments" className="btn-secondary flex-1">
            Hủy
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <Save className="w-4 h-4" />
            Đặt lịch
          </button>
        </div>
      </form>
    </div>
  );
}
