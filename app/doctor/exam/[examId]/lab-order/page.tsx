"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft,
  Save,
  Loader2,
  TestTube,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { labTestService, LabTest, LabTestCategory } from "@/services/lab.service";

interface LabOrderItem {
  labTestId: string;
  labTestName: string;
  price: number;
}

const CATEGORIES: { value: LabTestCategory; label: string }[] = [
  { value: "LAB", label: "Xét nghiệm" },
  { value: "IMAGING", label: "Chẩn đoán hình ảnh" },
  { value: "PATHOLOGY", label: "Giải phẫu bệnh" },
];

const PRIORITIES = [
  { value: "NORMAL", label: "Bình thường" },
  { value: "URGENT", label: "Khẩn" },
  { value: "STAT", label: "Cấp cứu" },
];

export default function DoctorLabOrderPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.examId as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<LabTestCategory>("LAB");
  const [selectedItems, setSelectedItems] = useState<LabOrderItem[]>([]);
  const [priority, setPriority] = useState("NORMAL");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchLabTests();
  }, []);

  const fetchLabTests = async () => {
    try {
      setLoading(true);
      const data = await labTestService.getActive();
      setLabTests(data || []);
    } catch (error) {
      console.error("Failed to fetch lab tests:", error);
      toast.error("Không thể tải danh sách xét nghiệm");
    } finally {
      setLoading(false);
    }
  };

  const filteredTests = labTests.filter(t => t.category === selectedCategory);

  const toggleTest = (test: LabTest) => {
    const exists = selectedItems.some(item => item.labTestId === test.id);
    if (exists) {
      setSelectedItems(selectedItems.filter(item => item.labTestId !== test.id));
    } else {
      setSelectedItems([...selectedItems, {
        labTestId: test.id,
        labTestName: test.name,
        price: test.price,
      }]);
    }
  };

  const isSelected = (testId: string) => selectedItems.some(item => item.labTestId === testId);

  const handleSubmit = async () => {
    if (selectedItems.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 xét nghiệm");
      return;
    }

    try {
      setSaving(true);
      // TODO: Call actual API when endpoint is available
      // For now, simulate the request
      const labOrderData = {
        medicalExamId: examId,
        labTestIds: selectedItems.map(item => item.labTestId),
        priority,
        notes: notes || undefined,
      };
      
      console.log("Creating lab order:", labOrderData);
      await new Promise(r => setTimeout(r, 500)); // Simulate API call
      
      toast.success("Đã tạo yêu cầu xét nghiệm!");
      router.back();
    } catch (error) {
      console.error("Failed to create lab order:", error);
      toast.error("Không thể tạo yêu cầu xét nghiệm");
    } finally {
      setSaving(false);
    }
  };

  const totalAmount = selectedItems.reduce((sum, item) => sum + item.price, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
  };

  if (loading) {
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
        <button onClick={() => router.back()} className="btn-icon">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-display">Yêu cầu xét nghiệm</h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">
            Phiếu khám #{examId?.slice(0, 8)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lab Tests Selection */}
        <div className="lg:col-span-2 card-base">
          <h3 className="text-section mb-4">Chọn xét nghiệm</h3>
          
          {/* Category Tabs */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === cat.value
                    ? "bg-[hsl(var(--primary))] text-white"
                    : "bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary))]/80"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Tests List */}
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {filteredTests.length === 0 ? (
              <div className="text-center py-8">
                <TestTube className="w-12 h-12 mx-auto text-[hsl(var(--muted-foreground))] opacity-50" />
                <p className="text-[hsl(var(--muted-foreground))] mt-2">
                  Không có xét nghiệm nào trong danh mục này
                </p>
              </div>
            ) : (
              filteredTests.map((test) => (
                <button
                  key={test.id}
                  onClick={() => toggleTest(test)}
                  className={`w-full p-4 rounded-lg border text-left transition-colors flex items-center gap-3 ${
                    isSelected(test.id)
                      ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary-light))]"
                      : "border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]"
                  }`}
                >
                  <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                    isSelected(test.id)
                      ? "bg-[hsl(var(--primary))] border-[hsl(var(--primary))]"
                      : "border-[hsl(var(--border))]"
                  }`}>
                    {isSelected(test.id) && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{test.name}</p>
                    <p className="text-small">{test.code} • {test.description || "Không có mô tả"}</p>
                  </div>
                  <span className="font-semibold text-[hsl(var(--primary))]">
                    {formatCurrency(test.price)}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="card-base h-fit">
          <h3 className="text-section mb-4">Tóm tắt yêu cầu</h3>
          
          {/* Priority */}
          <div className="mb-4">
            <label className="text-label">Mức độ ưu tiên</label>
            <select
              className="input-base mt-1"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label className="text-label">Ghi chú</label>
            <textarea
              className="input-base mt-1 min-h-[80px] resize-none"
              placeholder="Ghi chú cho kỹ thuật viên..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Selected Items */}
          <div className="mb-4">
            <p className="text-label mb-2">Xét nghiệm đã chọn ({selectedItems.length})</p>
            {selectedItems.length === 0 ? (
              <p className="text-[hsl(var(--muted-foreground))] text-sm">
                Chưa chọn xét nghiệm nào
              </p>
            ) : (
              <div className="space-y-2">
                {selectedItems.map((item) => (
                  <div key={item.labTestId} className="flex justify-between text-sm">
                    <span className="truncate">{item.labTestName}</span>
                    <span className="font-medium">{formatCurrency(item.price)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Total */}
          <div className="pt-4 border-t border-[hsl(var(--border))] mb-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Tổng cộng</span>
              <span className="text-xl font-bold text-[hsl(var(--primary))]">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={() => router.back()} className="btn-secondary flex-1">
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving || selectedItems.length === 0}
              className="btn-primary flex-1"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              <Save className="w-4 h-4" />
              Tạo yêu cầu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
