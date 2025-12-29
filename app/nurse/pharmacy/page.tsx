"use client";

import { useState, useEffect } from "react";
import { 
  Search,
  Pill,
  CheckCircle,
  Clock,
  User,
  Package,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import medicalExamService from "@/services/medical-exam.service";
import type { Prescription, PrescriptionStatus } from "@/interfaces/medical-exam";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function NursePharmacyPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ACTIVE");
  const [dispensingId, setDispensingId] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      // Fetch all exams that have prescriptions
      const response = await medicalExamService.getList({ size: 100 });
      const exams = response.content || [];
      const rxList: Prescription[] = [];
      for (const exam of exams) {
        if (exam.hasPrescription && exam.prescription) {
          rxList.push(exam.prescription);
        }
      }
      setPrescriptions(rxList);
    } catch (error) {
      console.error("Failed to fetch prescriptions:", error);
      toast.error("Không thể tải danh sách đơn thuốc");
    } finally {
      setLoading(false);
    }
  };

  const filteredPrescriptions = prescriptions.filter(rx => {
    const matchesSearch = rx.patient.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         rx.doctor.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || rx.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDispense = async () => {
    if (!dispensingId) return;

    try {
      setProcessing(true);
      await medicalExamService.dispensePrescription(dispensingId);
      toast.success("Đã phát thuốc thành công");
      setDispensingId(null);
      fetchPrescriptions(); // Refresh list
    } catch (error) {
      console.error("Failed to dispense:", error);
      toast.error("Không thể phát thuốc");
    } finally {
      setProcessing(false);
    }
  };

  const pendingCount = prescriptions.filter(rx => rx.status === "ACTIVE").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-display">Nhà thuốc</h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">
            {pendingCount} đơn thuốc chờ phát
          </p>
        </div>
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
          <div className="flex gap-2">
            {[
              { value: "", label: "Tất cả" },
              { value: "ACTIVE", label: "Chờ phát" },
              { value: "DISPENSED", label: "Đã phát" },
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

      {/* Prescription Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="card-base text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[hsl(var(--primary))]" />
            <p className="text-small mt-2">Đang tải...</p>
          </div>
        ) : filteredPrescriptions.length === 0 ? (
          <div className="card-base text-center py-12">
            <Pill className="w-12 h-12 mx-auto text-[hsl(var(--muted-foreground))] opacity-50" />
            <p className="text-[hsl(var(--muted-foreground))] mt-2">
              {statusFilter === "ACTIVE" ? "Không có đơn thuốc chờ phát" : "Không có đơn thuốc nào"}
            </p>
          </div>
        ) : (
          filteredPrescriptions.map((rx) => (
            <div
              key={rx.id}
              className={`card-base ${rx.status === "ACTIVE" ? "border-l-4 border-l-[hsl(var(--warning))]" : ""}`}
            >
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-[hsl(var(--border))]">
                <div className="flex items-center gap-4">
                  <div className="avatar w-12 h-12">{rx.patient.fullName.charAt(0)}</div>
                  <div>
                    <p className="font-semibold text-lg">{rx.patient.fullName}</p>
                    <p className="text-small flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {rx.doctor.fullName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge ${rx.status === "ACTIVE" ? "badge-warning" : "badge-success"}`}>
                    {rx.status === "ACTIVE" ? (
                      <>
                        <Clock className="w-3 h-3" />
                        Chờ phát
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        Đã phát
                      </>
                    )}
                  </span>
                  <span className="text-small">{formatDateTime(rx.prescribedAt)}</span>
                </div>
              </div>

              {/* Medicine List */}
              <div className="space-y-2 mb-4">
                {rx.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[hsl(var(--secondary))]">
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-[hsl(var(--primary))]" />
                      <div>
                        <p className="font-medium">{item.medicine.name}</p>
                        <p className="text-small">{item.dosage}</p>
                      </div>
                    </div>
                    <span className="badge badge-info">
                      x{item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              {rx.status === "ACTIVE" && (
                <div className="flex justify-end">
                  <button
                    onClick={() => setDispensingId(rx.id)}
                    className="btn-primary"
                  >
                    <Pill className="w-4 h-4" />
                    Phát thuốc
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Dispense Confirmation */}
      <AlertDialog open={!!dispensingId} onOpenChange={() => setDispensingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận phát thuốc</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn đã phát đầy đủ thuốc cho bệnh nhân?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDispense} disabled={processing}>
              {processing && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
