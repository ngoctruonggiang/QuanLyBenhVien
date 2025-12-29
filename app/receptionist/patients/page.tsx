"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Search, 
  User,
  Phone,
  Mail,
  MoreHorizontal,
  Eye,
  Calendar,
  Loader2,
  UserPlus,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { getPatients } from "@/services/patient.service";
import { Patient } from "@/interfaces/patient";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ReceptionistPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchPatients();
  }, [searchQuery]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await getPatients({
        search: searchQuery || undefined,
      });
      setPatients(response.content || []);
    } catch (error) {
      console.error("Failed to fetch patients:", error);
      toast.error("Không thể tải danh sách bệnh nhân");
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dob?: string | null) => {
    if (!dob) return "-";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-display">Danh sách bệnh nhân</h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">
            {patients.length} bệnh nhân trong hệ thống
          </p>
        </div>
        <Link href="/receptionist/walk-in" className="btn-primary">
          <UserPlus className="w-5 h-5" />
          Tiếp nhận mới
        </Link>
      </div>

      {/* Search */}
      <div className="card-base">
        <div className="search-input w-full max-w-md">
          <Search className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
          <input
            type="text"
            placeholder="Tìm theo tên, SĐT, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="table-base">
          <thead>
            <tr>
              <th>Bệnh nhân</th>
              <th>Liên hệ</th>
              <th>Tuổi / Giới tính</th>
              <th>Địa chỉ</th>
              <th>Trạng thái</th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-[hsl(var(--primary))]" />
                  <p className="text-small mt-2">Đang tải...</p>
                </td>
              </tr>
            ) : patients.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12">
                  <User className="w-12 h-12 mx-auto text-[hsl(var(--muted-foreground))] opacity-50" />
                  <p className="text-[hsl(var(--muted-foreground))] mt-2">
                    {searchQuery ? "Không tìm thấy bệnh nhân phù hợp" : "Chưa có bệnh nhân nào"}
                  </p>
                </td>
              </tr>
            ) : (
              patients.map((patient) => (
                <tr key={patient.id}>
                  {/* Patient Info */}
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        {patient.fullName?.charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="font-medium">{patient.fullName}</p>
                        <p className="text-small">ID: {patient.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td>
                    <div className="space-y-1">
                      {patient.phoneNumber && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                          {patient.phoneNumber}
                        </div>
                      )}
                      {patient.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                          {patient.email}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Age/Gender */}
                  <td>
                    <p>{calculateAge(patient.dateOfBirth)} tuổi</p>
                    <p className="text-small">
                      {patient.gender === "MALE" ? "Nam" : patient.gender === "FEMALE" ? "Nữ" : "-"}
                    </p>
                  </td>

                  {/* Address */}
                  <td>
                    {patient.address ? (
                      <div className="flex items-center gap-1 text-sm max-w-[200px] truncate">
                        <MapPin className="w-4 h-4 text-[hsl(var(--muted-foreground))] flex-shrink-0" />
                        {patient.address}
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>

                  {/* Status */}
                  <td>
                    <span className="badge badge-info">
                      Hồ sơ
                    </span>
                  </td>

                  {/* Actions */}
                  <td>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="btn-icon w-8 h-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/receptionist/patients/${patient.id}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            Xem chi tiết
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/receptionist/appointments/new?patientId=${patient.id}`}>
                            <Calendar className="w-4 h-4 mr-2" />
                            Đặt lịch hẹn
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
