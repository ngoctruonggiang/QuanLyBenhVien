"use client";

import { useState, useEffect } from "react";
import { 
  Search,
  FileText,
  Calendar,
  Eye,
  Loader2,
  Stethoscope,
} from "lucide-react";
import { toast } from "sonner";
import medicalExamService from "@/services/medical-exam.service";
import type { MedicalExamListItem } from "@/interfaces/medical-exam";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function NurseExamsPage() {
  const [exams, setExams] = useState<MedicalExamListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedExam, setSelectedExam] = useState<MedicalExamListItem | null>(null);

  useEffect(() => {
    fetchExams();
  }, [statusFilter]);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await medicalExamService.getList({
        status: statusFilter as any || undefined,
        size: 50,
      });
      setExams(response.content || []);
    } catch (error) {
      console.error("Failed to fetch exams:", error);
      toast.error("Không thể tải danh sách phiếu khám");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const STATUS_CONFIG = {
    PENDING: { label: "Chờ khám", class: "badge-warning" },
    IN_PROGRESS: { label: "Đang khám", class: "badge-info" },
    FINALIZED: { label: "Hoàn thành", class: "badge-success" },
    CANCELLED: { label: "Đã hủy", class: "badge-danger" },
  };

  const filteredExams = exams.filter(exam =>
    exam.patient.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exam.doctor.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-display">Phiếu khám</h1>
        <p className="text-[hsl(var(--muted-foreground))] mt-1">
          Xem thông tin phiếu khám bệnh
        </p>
      </div>

      {/* Filters */}
      <div className="card-base">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="search-input w-full max-w-none">
              <Search className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
              <input
                type="text"
                placeholder="Tìm theo tên bệnh nhân, bác sĩ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {[
              { value: "", label: "Tất cả" },
              { value: "IN_PROGRESS", label: "Đang khám" },
              { value: "FINALIZED", label: "Hoàn thành" },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === f.value
                    ? "bg-[hsl(var(--primary))] text-white"
                    : "bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary))]/80"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Exams Table */}
      <div className="table-container">
        <table className="table-base">
          <thead>
            <tr>
              <th>Bệnh nhân</th>
              <th>Bác sĩ</th>
              <th>Ngày khám</th>
              <th>Chẩn đoán</th>
              <th>Đơn thuốc</th>
              <th>Trạng thái</th>
              <th className="w-24"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-[hsl(var(--primary))]" />
                </td>
              </tr>
            ) : filteredExams.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto text-[hsl(var(--muted-foreground))] opacity-50" />
                  <p className="text-[hsl(var(--muted-foreground))] mt-2">
                    Không có phiếu khám nào
                  </p>
                </td>
              </tr>
            ) : (
              filteredExams.map((exam) => {
                const status = STATUS_CONFIG[exam.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PENDING;
                return (
                  <tr key={exam.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="avatar w-8 h-8 text-sm">{exam.patient.fullName.charAt(0)}</div>
                        {exam.patient.fullName}
                      </div>
                    </td>
                    <td>{exam.doctor.fullName}</td>
                    <td>
                      <div className="text-sm">
                        <div>{formatDate(exam.examDate)}</div>
                        <div className="text-[hsl(var(--muted-foreground))]">{formatTime(exam.examDate)}</div>
                      </div>
                    </td>
                    <td className="max-w-[200px] truncate">
                      {exam.diagnosis || "-"}
                    </td>
                    <td>
                      {exam.hasPrescription ? (
                        <span className="badge badge-success">Có</span>
                      ) : (
                        <span className="badge badge-secondary">Không</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${status.class}`}>
                        {status.label}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => setSelectedExam(exam)}
                        className="btn-icon"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selectedExam} onOpenChange={() => setSelectedExam(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Chi tiết phiếu khám</DialogTitle>
          </DialogHeader>
          {selectedExam && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-[hsl(var(--secondary))]">
                  <p className="text-label">Bệnh nhân</p>
                  <p className="font-semibold">{selectedExam.patient.fullName}</p>
                </div>
                <div className="p-3 rounded-lg bg-[hsl(var(--secondary))]">
                  <p className="text-label">Bác sĩ</p>
                  <p className="font-semibold">{selectedExam.doctor.fullName}</p>
                </div>
              </div>
              
              <div className="p-3 rounded-lg bg-[hsl(var(--secondary))]">
                <p className="text-label">Ngày khám</p>
                <p className="font-semibold">{formatDate(selectedExam.examDate)} {formatTime(selectedExam.examDate)}</p>
              </div>
              
              {selectedExam.diagnosis && (
                <div className="p-3 rounded-lg bg-[hsl(var(--secondary))]">
                  <p className="text-label">Chẩn đoán</p>
                  <p>{selectedExam.diagnosis}</p>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <span>Có đơn thuốc:</span>
                {selectedExam.hasPrescription ? (
                  <span className="badge badge-success">Có</span>
                ) : (
                  <span className="badge badge-secondary">Không</span>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
