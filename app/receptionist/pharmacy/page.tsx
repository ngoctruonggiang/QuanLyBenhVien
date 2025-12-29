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
import type { Prescription } from "@/interfaces/medical-exam";
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

export default function ReceptionistPharmacyPage() {
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
  };

  const calculateTotal = (rx: Prescription) => {
    return rx.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const handleDispense = async () => {
    if (!dispensingId) return;

    try {
      setProcessing(true);
      await medicalExamService.dispensePrescription(dispensingId);
      toast.success("Đã phát thuốc thành công");
      setDispensingId(null);
      fetchPrescriptions();
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
          <h1 className="text-display">Phát thuốc</h1>
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

      {/* Table */}
      <div className="table-container">
        <table className="table-base">
          <thead>
            <tr>
              <th>Bệnh nhân</th>
              <th>Bác sĩ</th>
              <th>Thời gian kê</th>
              <th>Số thuốc</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th className="w-32"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-[hsl(var(--primary))]" />
                </td>
              </tr>
            ) : filteredPrescriptions.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12">
                  <Pill className="w-12 h-12 mx-auto text-[hsl(var(--muted-foreground))] opacity-50" />
                  <p className="text-[hsl(var(--muted-foreground))] mt-2">
                    Không có đơn thuốc nào
                  </p>
                </td>
              </tr>
            ) : (
              filteredPrescriptions.map((rx) => (
                <tr key={rx.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="avatar w-8 h-8 text-sm">{rx.patient.fullName.charAt(0)}</div>
                      {rx.patient.fullName}
                    </div>
                  </td>
                  <td>{rx.doctor.fullName}</td>
                  <td className="text-sm">{formatDateTime(rx.prescribedAt)}</td>
                  <td>
                    <span className="badge badge-secondary">{rx.items.length} loại</span>
                  </td>
                  <td className="font-semibold text-[hsl(var(--primary))]">
                    {formatCurrency(calculateTotal(rx))}
                  </td>
                  <td>
                    <span className={`badge ${rx.status === "ACTIVE" ? "badge-warning" : "badge-success"}`}>
                      {rx.status === "ACTIVE" ? (
                        <><Clock className="w-3 h-3" /> Chờ phát</>
                      ) : (
                        <><CheckCircle className="w-3 h-3" /> Đã phát</>
                      )}
                    </span>
                  </td>
                  <td>
                    {rx.status === "ACTIVE" && (
                      <button
                        onClick={() => setDispensingId(rx.id)}
                        className="btn-primary text-sm py-1"
                      >
                        <Pill className="w-4 h-4" />
                        Phát
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
