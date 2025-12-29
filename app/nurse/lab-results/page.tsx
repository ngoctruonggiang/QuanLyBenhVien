"use client";

import { useState, useEffect } from "react";
import { 
  Search,
  TestTube,
  FileText,
  Loader2,
  CheckCircle,
  Clock,
  AlertCircle,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { labResultService, LabTestResult, ResultStatus, LabTestResultUpdateRequest } from "@/services/lab.service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const STATUS_CONFIG: Record<ResultStatus, { label: string; class: string; icon: typeof Clock }> = {
  PENDING: { label: "Chờ xử lý", class: "badge-warning", icon: Clock },
  PROCESSING: { label: "Đang làm", class: "badge-info", icon: Loader2 },
  COMPLETED: { label: "Hoàn thành", class: "badge-success", icon: CheckCircle },
  CANCELLED: { label: "Đã hủy", class: "badge-danger", icon: Clock },
};

export default function NurseLabResultsPage() {
  const [labResults, setLabResults] = useState<LabTestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedResult, setSelectedResult] = useState<LabTestResult | null>(null);
  const [inputModalOpen, setInputModalOpen] = useState(false);
  const [selectedForInput, setSelectedForInput] = useState<LabTestResult | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state for input modal
  const [formData, setFormData] = useState({
    resultValue: "",
    isAbnormal: false,
    interpretation: "",
    notes: "",
    performedBy: "",
  });

  useEffect(() => {
    fetchLabResults();
  }, []);

  const fetchLabResults = async () => {
    try {
      setLoading(true);
      const response = await labResultService.getAll();
      setLabResults(response.content || []);
    } catch (error) {
      console.error("Failed to fetch lab results:", error);
      toast.error("Không thể tải danh sách kết quả xét nghiệm");
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = labResults.filter(result => {
    const matchesSearch = result.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         result.labTestName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || result.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleInputResults = (result: LabTestResult) => {
    setSelectedForInput(result);
    setFormData({
      resultValue: result.resultValue || "",
      isAbnormal: result.isAbnormal || false,
      interpretation: result.interpretation || "",
      notes: result.notes || "",
      performedBy: result.performedBy || "",
    });
    setInputModalOpen(true);
  };

  const handleSaveResults = async () => {
    if (!selectedForInput) return;
    
    try {
      setSaving(true);
      const updateData: LabTestResultUpdateRequest = {
        resultValue: formData.resultValue,
        isAbnormal: formData.isAbnormal,
        interpretation: formData.interpretation || undefined,
        notes: formData.notes || undefined,
        performedBy: formData.performedBy || undefined,
        status: "COMPLETED",
      };
      
      await labResultService.update(selectedForInput.id, updateData);
      toast.success("Đã lưu kết quả xét nghiệm");
      setInputModalOpen(false);
      setSelectedForInput(null);
      fetchLabResults(); // Refresh list
    } catch (error) {
      console.error("Failed to save lab result:", error);
      toast.error("Không thể lưu kết quả");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-display">Kết quả xét nghiệm</h1>
        <p className="text-[hsl(var(--muted-foreground))] mt-1">
          Quản lý và nhập kết quả xét nghiệm
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
                placeholder="Tìm theo tên bệnh nhân, xét nghiệm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <select
            className="dropdown"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">Chờ xử lý</option>
            <option value="PROCESSING">Đang làm</option>
            <option value="COMPLETED">Hoàn thành</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="table-base">
          <thead>
            <tr>
              <th>Bệnh nhân</th>
              <th>Xét nghiệm</th>
              <th>Danh mục</th>
              <th>Trạng thái</th>
              <th>Kết quả</th>
              <th className="w-32"></th>
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
            ) : filteredResults.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12">
                  <TestTube className="w-12 h-12 mx-auto text-[hsl(var(--muted-foreground))] opacity-50" />
                  <p className="text-[hsl(var(--muted-foreground))] mt-2">
                    Không có xét nghiệm nào
                  </p>
                </td>
              </tr>
            ) : (
              filteredResults.map((result) => {
                const status = STATUS_CONFIG[result.status] || STATUS_CONFIG.PENDING;
                const StatusIcon = status.icon;
                return (
                  <tr key={result.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar">{result.patientName.charAt(0)}</div>
                        <p className="font-medium">{result.patientName}</p>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <TestTube className="w-4 h-4 text-[hsl(var(--primary))]" />
                        {result.labTestName}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-secondary">{result.labTestCategory}</span>
                    </td>
                    <td>
                      <span className={`badge ${status.class}`}>
                        <StatusIcon className={`w-3 h-3 ${result.status === "PROCESSING" ? "animate-spin" : ""}`} />
                        {status.label}
                      </span>
                    </td>
                    <td>
                      {result.resultValue ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm truncate max-w-[120px]">{result.resultValue}</span>
                          {result.isAbnormal && (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                      ) : (
                        <span className="text-[hsl(var(--muted-foreground))]">-</span>
                      )}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        {result.status === "COMPLETED" ? (
                          <button
                            onClick={() => setSelectedResult(result)}
                            className="btn-secondary text-sm py-1"
                          >
                            <FileText className="w-4 h-4" />
                            Xem
                          </button>
                        ) : (
                          <button
                            onClick={() => handleInputResults(result)}
                            className="btn-primary text-sm py-1"
                          >
                            <Upload className="w-4 h-4" />
                            Nhập KQ
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* View Results Modal */}
      <Dialog open={!!selectedResult} onOpenChange={() => setSelectedResult(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Kết quả xét nghiệm</DialogTitle>
          </DialogHeader>
          {selectedResult && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[hsl(var(--secondary))]">
                <p className="font-semibold">{selectedResult.patientName}</p>
                <p className="text-small mt-1">{selectedResult.labTestName}</p>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-label">Kết quả</p>
                  <p className={`font-semibold ${selectedResult.isAbnormal ? "text-red-600" : ""}`}>
                    {selectedResult.resultValue || "Chưa có kết quả"}
                    {selectedResult.isAbnormal && " (Bất thường)"}
                  </p>
                </div>

                {selectedResult.interpretation && (
                  <div>
                    <p className="text-label">Diễn giải</p>
                    <p>{selectedResult.interpretation}</p>
                  </div>
                )}

                {selectedResult.notes && (
                  <div>
                    <p className="text-label">Ghi chú</p>
                    <p>{selectedResult.notes}</p>
                  </div>
                )}

                {selectedResult.performedBy && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-label">Người thực hiện</p>
                      <p>{selectedResult.performedBy}</p>
                    </div>
                    {selectedResult.performedAt && (
                      <div>
                        <p className="text-label">Thời gian</p>
                        <p>{formatDateTime(selectedResult.performedAt)}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Input Results Modal */}
      <Dialog open={inputModalOpen} onOpenChange={setInputModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nhập kết quả xét nghiệm</DialogTitle>
          </DialogHeader>
          {selectedForInput && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[hsl(var(--secondary))]">
                <p className="font-semibold">{selectedForInput.patientName}</p>
                <p className="text-small mt-1">{selectedForInput.labTestName}</p>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-label">Kết quả *</label>
                  <textarea
                    className="input-base min-h-[80px] resize-none"
                    placeholder="Nhập kết quả xét nghiệm..."
                    value={formData.resultValue}
                    onChange={(e) => setFormData({ ...formData, resultValue: e.target.value })}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isAbnormal"
                    checked={formData.isAbnormal}
                    onChange={(e) => setFormData({ ...formData, isAbnormal: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="isAbnormal" className="text-sm font-medium">Kết quả bất thường</label>
                </div>

                <div className="space-y-2">
                  <label className="text-label">Diễn giải</label>
                  <textarea
                    className="input-base min-h-[60px] resize-none"
                    placeholder="Diễn giải kết quả..."
                    value={formData.interpretation}
                    onChange={(e) => setFormData({ ...formData, interpretation: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-label">Người thực hiện</label>
                  <input
                    type="text"
                    className="input-base"
                    placeholder="Tên kỹ thuật viên..."
                    value={formData.performedBy}
                    onChange={(e) => setFormData({ ...formData, performedBy: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-label">Ghi chú</label>
                  <textarea
                    className="input-base min-h-[60px] resize-none"
                    placeholder="Ghi chú thêm..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[hsl(var(--border))]">
                <button onClick={() => setInputModalOpen(false)} className="btn-secondary">
                  Hủy
                </button>
                <button onClick={handleSaveResults} disabled={saving} className="btn-primary">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Lưu kết quả
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
