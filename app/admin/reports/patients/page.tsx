"use client";

import { useState, useEffect } from "react";
import { 
  Users,
  UserPlus,
  Activity,
  Heart,
  Loader2,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { StatCard } from "@/components/dashboard";
import { reportsService } from "@/services/reports.service";
import type { PatientActivity } from "@/interfaces/reports";

export default function PatientReportPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PatientActivity | null>(null);
  const [period, setPeriod] = useState<"week" | "month" | "year">("month");

  useEffect(() => {
    fetchData();
  }, [period]);

  const getDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();
    
    if (period === "week") {
      startDate.setDate(endDate.getDate() - 7);
    } else if (period === "month") {
      startDate.setDate(endDate.getDate() - 30);
    } else {
      startDate.setFullYear(endDate.getFullYear() - 1);
    }
    
    return {
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    };
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const { startDate, endDate } = getDateRange();
      const stats = await reportsService.getPatientActivity({ startDate, endDate });
      setData(stats);
    } catch (error) {
      console.error("Failed to fetch patient stats:", error);
      toast.error("Không thể tải báo cáo bệnh nhân");
    } finally {
      setLoading(false);
    }
  };

  const GENDER_LABELS: Record<string, string> = {
    MALE: "Nam",
    FEMALE: "Nữ", 
    OTHER: "Khác",
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-display">Báo cáo bệnh nhân</h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">
            Thống kê bệnh nhân và hoạt động
          </p>
        </div>
      </div>

      {/* Period Filter */}
      <div className="card-base">
        <div className="flex gap-2">
          {[
            { value: "week", label: "7 ngày" },
            { value: "month", label: "30 ngày" },
            { value: "year", label: "12 tháng" },
          ].map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === p.value
                  ? "bg-[hsl(var(--primary))] text-white"
                  : "bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary))]/80"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tổng bệnh nhân"
          value={data?.totalPatients?.toString() || "0"}
          icon={<Users className="w-5 h-5" />}
          trend={{ value: "Trong hệ thống", direction: "neutral" }}
        />
        <StatCard
          title="Bệnh nhân mới"
          value={data?.newPatients?.toString() || "0"}
          icon={<UserPlus className="w-5 h-5" />}
          trend={{ value: "Trong kỳ", direction: "up" }}
        />
        <StatCard
          title="Đang hoạt động"
          value={data?.activePatients?.toString() || "0"}
          icon={<Activity className="w-5 h-5" />}
          trend={{ value: "Có lịch hẹn", direction: "neutral" }}
        />
        <StatCard
          title="Tái khám"
          value={data?.returningPatients?.toString() || "0"}
          icon={<Heart className="w-5 h-5" />}
          trend={{ value: "Trong kỳ", direction: "neutral" }}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gender Distribution */}
        <div className="card-base">
          <h3 className="text-section mb-4">Phân bổ theo giới tính</h3>
          <div className="space-y-3">
            {data?.patientsByGender?.map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{GENDER_LABELS[item.gender] || item.gender}</span>
                    <span className="font-bold">{item.count}</span>
                  </div>
                  <div className="mt-1 h-2 bg-[hsl(var(--secondary))] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[hsl(var(--primary))] rounded-full" 
                      style={{ width: `${item.percentage || 0}%` }} 
                    />
                  </div>
                  <span className="text-small">{item.percentage?.toFixed(1) || 0}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Blood Type Distribution */}
        <div className="card-base">
          <h3 className="text-section mb-4">Phân bổ theo nhóm máu</h3>
          <div className="grid grid-cols-2 gap-3">
            {data?.patientsByBloodType?.map((item, i) => (
              <div key={i} className="p-3 rounded-lg bg-[hsl(var(--secondary))] text-center">
                <span className="text-2xl font-bold text-[hsl(var(--primary))]">{item.bloodType}</span>
                <p className="text-sm mt-1">{item.count} ({item.percentage?.toFixed(1) || 0}%)</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Diagnoses */}
      {data?.topDiagnoses && data.topDiagnoses.length > 0 && (
        <div className="card-base">
          <h3 className="text-section mb-4">Chẩn đoán phổ biến</h3>
          <div className="space-y-2">
            {data.topDiagnoses.slice(0, 10).map((diag, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[hsl(var(--secondary))]">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[hsl(var(--primary))] text-white text-xs flex items-center justify-center font-bold">
                    {i + 1}
                  </span>
                  <div>
                    <span className="font-medium">{diag.diagnosis}</span>
                    {diag.icdCode && <span className="text-small ml-2">({diag.icdCode})</span>}
                  </div>
                </div>
                <span className="badge badge-info">{diag.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cache info */}
      {data?.cached && (
        <div className="text-center text-small">
          Dữ liệu được cập nhật lúc {new Date(data.generatedAt).toLocaleString("vi-VN")}
        </div>
      )}
    </div>
  );
}
