"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Calendar,
  Heart,
  Clock,
  Receipt,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface PatientDetail {
  id: string;
  fullName: string;
  dateOfBirth: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  phoneNumber?: string;
  address?: string;
  bloodType?: string;
  healthInsuranceNumber?: string;
  allergies?: string;
  appointments: {
    id: string;
    appointmentTime: string;
    doctorName: string;
    status: string;
  }[];
  invoices: {
    id: string;
    invoiceNumber: string;
    totalAmount: number;
    status: string;
    createdAt: string;
  }[];
}

export default function ReceptionistPatientDetailPage() {
  const params = useParams();
  const patientId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"info" | "appointments" | "invoices">("info");
  const [patient, setPatient] = useState<PatientDetail | null>(null);

  useEffect(() => {
    fetchPatient();
  }, [patientId]);

  const fetchPatient = async () => {
    try {
      setLoading(true);
      await new Promise(r => setTimeout(r, 300));
      // Mock data
      setPatient({
        id: patientId,
        fullName: "Nguyễn Văn An",
        dateOfBirth: "1990-05-15",
        gender: "MALE",
        phoneNumber: "0901234567",
        address: "123 Đường ABC, Quận 1, TP.HCM",
        bloodType: "O+",
        healthInsuranceNumber: "HS123456789",
        allergies: "Penicillin",
        appointments: [
          { id: "apt-1", appointmentTime: new Date().toISOString(), doctorName: "BS. Trần Văn Minh", status: "SCHEDULED" },
          { id: "apt-2", appointmentTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), doctorName: "BS. Nguyễn Thị Hoa", status: "COMPLETED" },
        ],
        invoices: [
          { id: "inv-1", invoiceNumber: "INV-001", totalAmount: 500000, status: "PAID", createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
        ],
      });
    } catch (error) {
      toast.error("Không thể tải thông tin bệnh nhân");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
  };

  if (loading || !patient) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--primary))]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/receptionist/patients" className="btn-icon">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-display">{patient.fullName}</h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">
            Chi tiết hồ sơ bệnh nhân
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="card-base">
        <div className="flex gap-2">
          {[
            { value: "info", label: "Thông tin" },
            { value: "appointments", label: "Lịch hẹn" },
            { value: "invoices", label: "Hóa đơn" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.value
                  ? "bg-[hsl(var(--primary))] text-white"
                  : "bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary))]/80"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "info" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card-base">
            <h3 className="text-section mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Thông tin cá nhân
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">Họ tên</span>
                <span className="font-medium">{patient.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">Ngày sinh</span>
                <span className="font-medium">{formatDate(patient.dateOfBirth)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">Giới tính</span>
                <span className="font-medium">{patient.gender === "MALE" ? "Nam" : "Nữ"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">Điện thoại</span>
                <span className="font-medium">{patient.phoneNumber || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">Địa chỉ</span>
                <span className="font-medium">{patient.address || "-"}</span>
              </div>
            </div>
          </div>

          <div className="card-base">
            <h3 className="text-section mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Thông tin y tế
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">Nhóm máu</span>
                <span className="font-medium">{patient.bloodType || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">Số BHYT</span>
                <span className="font-medium">{patient.healthInsuranceNumber || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">Dị ứng</span>
                <span className="font-medium text-red-500">{patient.allergies || "Không"}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "appointments" && (
        <div className="card-base">
          <h3 className="text-section mb-4">Lịch hẹn</h3>
          <div className="space-y-3">
            {patient.appointments.length === 0 ? (
              <p className="text-center py-8 text-[hsl(var(--muted-foreground))]">
                Chưa có lịch hẹn nào
              </p>
            ) : (
              patient.appointments.map((apt) => (
                <div key={apt.id} className="flex items-center justify-between p-4 rounded-xl border border-[hsl(var(--border))]">
                  <div>
                    <p className="font-medium">{apt.doctorName}</p>
                    <p className="text-small flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(apt.appointmentTime)}
                    </p>
                  </div>
                  <span className={`badge ${
                    apt.status === "COMPLETED" ? "badge-success" :
                    apt.status === "SCHEDULED" ? "badge-info" : "badge-secondary"
                  }`}>
                    {apt.status === "COMPLETED" ? "Hoàn thành" :
                     apt.status === "SCHEDULED" ? "Đã đặt" : apt.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === "invoices" && (
        <div className="card-base">
          <h3 className="text-section mb-4">Hóa đơn</h3>
          <div className="space-y-3">
            {patient.invoices.length === 0 ? (
              <p className="text-center py-8 text-[hsl(var(--muted-foreground))]">
                Chưa có hóa đơn nào
              </p>
            ) : (
              patient.invoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between p-4 rounded-xl border border-[hsl(var(--border))]">
                  <div>
                    <p className="font-medium">{inv.invoiceNumber}</p>
                    <p className="text-small">{formatDate(inv.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[hsl(var(--primary))]">{formatCurrency(inv.totalAmount)}</p>
                    <span className={`badge ${inv.status === "PAID" ? "badge-success" : "badge-warning"}`}>
                      {inv.status === "PAID" ? "Đã thanh toán" : "Chờ thanh toán"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Link href={`/receptionist/appointments/new?patientId=${patientId}`} className="btn-primary">
          <Calendar className="w-4 h-4" />
          Đặt lịch hẹn
        </Link>
        <Link href={`/receptionist/billing?patientId=${patientId}`} className="btn-secondary">
          <Receipt className="w-4 h-4" />
          Xem hóa đơn
        </Link>
      </div>
    </div>
  );
}
