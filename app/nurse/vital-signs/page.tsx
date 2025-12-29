"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Heart,
  User,
  Save,
  Loader2,
  CheckCircle,
  Clock,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { appointmentService, Appointment } from "@/services/appointment.service";

interface VitalSignsData {
  bloodPressureSystolic: string;
  bloodPressureDiastolic: string;
  heartRate: string;
  temperature: string;
  weight: string;
  height: string;
  respiratoryRate: string;
  oxygenSaturation: string;
}

export default function NurseVitalSignsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Appointment | null>(null);
  const [saving, setSaving] = useState(false);
  const [vitalSigns, setVitalSigns] = useState<VitalSignsData>({
    bloodPressureSystolic: "",
    bloodPressureDiastolic: "",
    heartRate: "",
    temperature: "",
    weight: "",
    height: "",
    respiratoryRate: "",
    oxygenSaturation: "",
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
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
      console.error("Failed to fetch patients:", error);
      toast.error("Không thể tải danh sách bệnh nhân");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (isoDate: string) => {
    return new Date(isoDate).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  };

  const handleSelectPatient = (apt: Appointment) => {
    setSelectedPatient(apt);
    // Reset form
    setVitalSigns({
      bloodPressureSystolic: "",
      bloodPressureDiastolic: "",
      heartRate: "",
      temperature: "",
      weight: "",
      height: "",
      respiratoryRate: "",
      oxygenSaturation: "",
    });
  };

  const handleSave = async () => {
    if (!selectedPatient) return;

    if (!vitalSigns.bloodPressureSystolic || !vitalSigns.heartRate) {
      toast.error("Vui lòng nhập ít nhất huyết áp và nhịp tim");
      return;
    }

    try {
      setSaving(true);
      // In real app, save vital signs to API
      await new Promise(r => setTimeout(r, 500));
      toast.success(`Đã lưu sinh hiệu cho ${selectedPatient.patient.fullName}`);
      setSelectedPatient(null);
      fetchPatients();
    } catch (error) {
      toast.error("Không thể lưu sinh hiệu");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-display">Đo sinh hiệu</h1>
        <p className="text-[hsl(var(--muted-foreground))] mt-1">
          Ghi nhận các chỉ số sinh hiệu cho bệnh nhân
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient List */}
        <div className="lg:col-span-1">
          <div className="card-base">
            <h3 className="text-section mb-4">Bệnh nhân chờ đo</h3>
            
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-[hsl(var(--primary))]" />
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-10 h-10 mx-auto text-green-500 opacity-50" />
                <p className="text-small mt-2">Không có bệnh nhân chờ</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {appointments.map((apt) => (
                  <button
                    key={apt.id}
                    onClick={() => handleSelectPatient(apt)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${
                      selectedPatient?.id === apt.id
                        ? "bg-[hsl(var(--primary))] text-white"
                        : "hover:bg-[hsl(var(--secondary))]"
                    }`}
                  >
                    <div className={`avatar ${selectedPatient?.id === apt.id ? "bg-white/20" : ""}`}>
                      {apt.patient.fullName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{apt.patient.fullName}</p>
                      <p className={`text-xs ${selectedPatient?.id === apt.id ? "text-white/70" : "text-[hsl(var(--muted-foreground))]"}`}>
                        <Clock className="w-3 h-3 inline mr-1" />
                        {formatTime(apt.appointmentTime)}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Vital Signs Form */}
        <div className="lg:col-span-2">
          {selectedPatient ? (
            <div className="card-base">
              {/* Patient Header */}
              <div className="flex items-center gap-4 mb-6 pb-4 border-b border-[hsl(var(--border))]">
                <div className="avatar w-14 h-14 text-xl">
                  {selectedPatient.patient.fullName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{selectedPatient.patient.fullName}</h2>
                  <p className="text-small">{selectedPatient.reason || "Khám tổng quát"}</p>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-6">
                {/* Blood Pressure */}
                <div>
                  <label className="text-label mb-2 block">Huyết áp (mmHg) *</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      className="input-base w-24"
                      placeholder="120"
                      value={vitalSigns.bloodPressureSystolic}
                      onChange={(e) => setVitalSigns({ ...vitalSigns, bloodPressureSystolic: e.target.value })}
                    />
                    <span className="text-lg">/</span>
                    <input
                      type="number"
                      className="input-base w-24"
                      placeholder="80"
                      value={vitalSigns.bloodPressureDiastolic}
                      onChange={(e) => setVitalSigns({ ...vitalSigns, bloodPressureDiastolic: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-label">Nhịp tim (bpm) *</label>
                    <input
                      type="number"
                      className="input-base"
                      placeholder="72"
                      value={vitalSigns.heartRate}
                      onChange={(e) => setVitalSigns({ ...vitalSigns, heartRate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-label">Nhiệt độ (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="input-base"
                      placeholder="37.0"
                      value={vitalSigns.temperature}
                      onChange={(e) => setVitalSigns({ ...vitalSigns, temperature: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-label">Cân nặng (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="input-base"
                      placeholder="65.0"
                      value={vitalSigns.weight}
                      onChange={(e) => setVitalSigns({ ...vitalSigns, weight: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-label">Chiều cao (cm)</label>
                    <input
                      type="number"
                      className="input-base"
                      placeholder="170"
                      value={vitalSigns.height}
                      onChange={(e) => setVitalSigns({ ...vitalSigns, height: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-label">Nhịp thở (lần/phút)</label>
                    <input
                      type="number"
                      className="input-base"
                      placeholder="16"
                      value={vitalSigns.respiratoryRate}
                      onChange={(e) => setVitalSigns({ ...vitalSigns, respiratoryRate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-label">SpO2 (%)</label>
                    <input
                      type="number"
                      className="input-base"
                      placeholder="98"
                      value={vitalSigns.oxygenSaturation}
                      onChange={(e) => setVitalSigns({ ...vitalSigns, oxygenSaturation: e.target.value })}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-[hsl(var(--border))]">
                  <button
                    onClick={() => setSelectedPatient(null)}
                    className="btn-secondary"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    <Save className="w-4 h-4" />
                    Lưu sinh hiệu
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card-base text-center py-16">
              <Heart className="w-16 h-16 mx-auto text-[hsl(var(--muted-foreground))] opacity-30" />
              <h3 className="text-lg font-semibold mt-4">Chọn bệnh nhân</h3>
              <p className="text-[hsl(var(--muted-foreground))] mt-2">
                Chọn bệnh nhân từ danh sách bên trái để nhập sinh hiệu
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
