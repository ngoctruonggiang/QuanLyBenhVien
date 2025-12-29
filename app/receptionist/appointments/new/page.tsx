"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft,
  Search,
  User,
  Plus,
  Calendar,
  Clock,
  Stethoscope,
  Save,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { getPatients } from "@/services/patient.service";
import { hrService } from "@/services/hr.service";
import { appointmentService } from "@/services/appointment.service";
import { Patient } from "@/interfaces/patient";

interface Doctor {
  id: string;
  fullName: string;
  department?: string;
}

export default function ReceptionistNewAppointmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedPatientId = searchParams.get("patientId");
  
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(preselectedPatientId ? 2 : 1);
  
  // Step 1: Patient
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  // Step 2: Doctor & Time
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [formData, setFormData] = useState({
    doctorId: "",
    appointmentDate: "",
    appointmentTime: "",
    reason: "",
    type: "CONSULTATION" as "CONSULTATION" | "FOLLOW_UP",
  });

  useEffect(() => {
    fetchDoctors();
    if (preselectedPatientId) {
      fetchPatientById(preselectedPatientId);
    }
  }, []);

  const fetchPatientById = async (id: string) => {
    try {
      const response = await getPatients({ filter: `id==${id}` });
      if (response.content.length > 0) {
        setSelectedPatient(response.content[0]);
      }
    } catch (error) {
      console.error("Failed to fetch patient:", error);
    }
  };

  const searchPatients = async () => {
    if (!patientSearch.trim()) return;
    try {
      const response = await getPatients({
        filter: `fullName=like='%${patientSearch}%',phoneNumber=like='%${patientSearch}%'`,
      });
      setPatients(response.content);
    } catch (error) {
      toast.error("Không thể tìm bệnh nhân");
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await hrService.getEmployees({ role: "DOCTOR" });
      setDoctors(response.content.map((emp: any) => ({
        id: emp.id,
        fullName: emp.fullName,
        department: emp.department?.name,
      })));
    } catch (error) {
      console.error("Failed to fetch doctors:", error);
    }
  };

  const handleSubmit = async () => {
    if (!selectedPatient || !formData.doctorId || !formData.appointmentDate || !formData.appointmentTime) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      setLoading(true);
      const appointmentTime = `${formData.appointmentDate}T${formData.appointmentTime}:00`;
      
      await appointmentService.create({
        patientId: selectedPatient.id,
        doctorId: formData.doctorId,
        appointmentTime,
        type: formData.type,
        reason: formData.reason || "Khám tổng quát",
      });

      toast.success("Đặt lịch hẹn thành công!");
      router.push("/receptionist/appointments");
    } catch (error) {
      toast.error("Không thể đặt lịch hẹn");
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = [];
  for (let h = 8; h <= 17; h++) {
    for (let m = 0; m < 60; m += 30) {
      if (h === 17 && m > 0) break;
      timeSlots.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
    }
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/receptionist/appointments" className="btn-icon">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-display">Đặt lịch hẹn mới</h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">
            Đặt lịch khám cho bệnh nhân
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`flex-1 h-2 rounded-full ${
              s <= step ? "bg-[hsl(var(--primary))]" : "bg-[hsl(var(--secondary))]"
            }`}
          />
        ))}
      </div>

      {/* Step 1: Select Patient */}
      {step === 1 && (
        <div className="card-base space-y-4">
          <h3 className="text-section">Bước 1: Chọn bệnh nhân</h3>
          
          <div className="flex gap-2">
            <div className="flex-1 search-input">
              <Search className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
              <input
                type="text"
                placeholder="Tìm theo tên hoặc SĐT..."
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchPatients()}
              />
            </div>
            <button onClick={searchPatients} className="btn-primary">
              Tìm
            </button>
          </div>

          {patients.length > 0 && (
            <div className="space-y-2">
              {patients.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => {
                    setSelectedPatient(patient);
                    setStep(2);
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] text-left"
                >
                  <div className="avatar">{patient.fullName.charAt(0)}</div>
                  <div>
                    <p className="font-medium">{patient.fullName}</p>
                    <p className="text-small">{patient.phoneNumber || "Chưa có SĐT"}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Select Doctor & Time */}
      {step === 2 && selectedPatient && (
        <div className="card-base space-y-4">
          <h3 className="text-section">Bước 2: Chọn bác sĩ và thời gian</h3>
          
          <div className="p-4 rounded-xl bg-[hsl(var(--secondary))]">
            <p className="text-label">Bệnh nhân</p>
            <p className="font-semibold">{selectedPatient.fullName}</p>
          </div>

          <div className="space-y-2">
            <label className="text-label">Bác sĩ *</label>
            <select
              className="dropdown w-full"
              value={formData.doctorId}
              onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
            >
              <option value="">-- Chọn bác sĩ --</option>
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  BS. {doc.fullName} {doc.department && `- ${doc.department}`}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-label">Ngày khám *</label>
              <input
                type="date"
                className="input-base"
                min={today}
                value={formData.appointmentDate}
                onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-label">Giờ khám *</label>
              <select
                className="dropdown w-full"
                value={formData.appointmentTime}
                onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
              >
                <option value="">-- Chọn giờ --</option>
                {timeSlots.map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-[hsl(var(--border))]">
            <button onClick={() => setStep(1)} className="btn-secondary flex-1">
              Quay lại
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!formData.doctorId || !formData.appointmentDate || !formData.appointmentTime}
              className="btn-primary flex-1"
            >
              Tiếp tục
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && selectedPatient && (
        <div className="card-base space-y-4">
          <h3 className="text-section">Bước 3: Xác nhận</h3>
          
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-[hsl(var(--secondary))]">
              <p className="text-label">Bệnh nhân</p>
              <p className="font-semibold">{selectedPatient.fullName}</p>
            </div>
            <div className="p-4 rounded-xl bg-[hsl(var(--secondary))]">
              <p className="text-label">Bác sĩ</p>
              <p className="font-semibold">
                {doctors.find(d => d.id === formData.doctorId)?.fullName}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[hsl(var(--secondary))]">
              <p className="text-label">Thời gian</p>
              <p className="font-semibold">{formData.appointmentDate} lúc {formData.appointmentTime}</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-label">Lý do khám</label>
            <textarea
              className="input-base min-h-[80px] resize-none"
              placeholder="Nhập lý do khám (tuỳ chọn)..."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-[hsl(var(--border))]">
            <button onClick={() => setStep(2)} className="btn-secondary flex-1">
              Quay lại
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <Save className="w-4 h-4" />
              Đặt lịch
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
