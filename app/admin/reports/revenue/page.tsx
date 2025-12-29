"use client";

import { useState, useEffect } from "react";
import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  CreditCard,
  Banknote,
  Loader2,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { StatCard } from "@/components/dashboard";
import { reportsService } from "@/services/reports.service";
import type { RevenueReport } from "@/interfaces/reports";

export default function RevenueReportPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<RevenueReport | null>(null);
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
      const report = await reportsService.getRevenueReport({ startDate, endDate });
      setData(report);
    } catch (error) {
      console.error("Failed to fetch revenue report:", error);
      toast.error("Không thể tải báo cáo doanh thu");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const { startDate, endDate } = getDateRange();
      const blob = await reportsService.exportToCSV("revenue", { startDate, endDate });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `revenue-report-${startDate}-${endDate}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Đã xuất báo cáo");
    } catch (error) {
      toast.error("Không thể xuất báo cáo");
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  };

  const formatCurrencyFull = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  // Calculate values from report
  const totalRevenue = data?.totalRevenue || 0;
  const paidRevenue = data?.paidRevenue || 0;
  const pendingAmount = data?.unpaidRevenue || 0;
  const collectionRate = data?.collectionRate || (totalRevenue > 0 ? (paidRevenue / totalRevenue) * 100 : 0);
  
  const cashPayments = data?.revenueByPaymentMethod?.find(m => m.method === "CASH")?.amount || 0;
  const cardPayments = data?.revenueByPaymentMethod?.find(m => m.method === "VNPAY" || m.method === "CARD")?.amount || 0;

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
          <h1 className="text-display">Báo cáo doanh thu</h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">
            Tổng quan doanh thu và thanh toán
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="btn-secondary">
            <Download className="w-4 h-4" />
            Xuất báo cáo
          </button>
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
          title="Tổng doanh thu"
          value={formatCurrency(totalRevenue)}
          icon={<DollarSign className="w-5 h-5" />}
          trend={{ 
            value: `${data?.invoiceCount || 0} hóa đơn`, 
            direction: "neutral"
          }}
        />
        <StatCard
          title="Đã thu"
          value={formatCurrency(paidRevenue)}
          icon={<TrendingUp className="w-5 h-5" />}
          trend={{ 
            value: `${collectionRate.toFixed(0)}% tỷ lệ thu`, 
            direction: collectionRate >= 80 ? "up" : "down"
          }}
        />
        <StatCard
          title="Tiền mặt"
          value={formatCurrency(cashPayments)}
          icon={<Banknote className="w-5 h-5" />}
          trend={{ 
            value: totalRevenue > 0 ? `${((cashPayments / paidRevenue) * 100).toFixed(0)}%` : "0%", 
            direction: "neutral" 
          }}
        />
        <StatCard
          title="Chờ thanh toán"
          value={formatCurrency(pendingAmount)}
          icon={<Calendar className="w-5 h-5" />}
          trend={{ value: "Cần thu", direction: pendingAmount > 0 ? "up" : "neutral" }}
        />
      </div>

      {/* Revenue by Payment Method */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-base">
          <h3 className="text-section mb-4">Phân bổ phương thức thanh toán</h3>
          <div className="space-y-4">
            {data?.revenueByPaymentMethod?.map((method, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[hsl(var(--primary-light))] flex items-center justify-center">
                  {method.method === "CASH" ? <Banknote className="w-6 h-6 text-[hsl(var(--primary))]" /> : <CreditCard className="w-6 h-6 text-[hsl(var(--primary))]" />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{method.method === "CASH" ? "Tiền mặt" : method.method}</span>
                    <span className="font-bold">{formatCurrencyFull(method.amount)}</span>
                  </div>
                  <div className="mt-2 h-2 bg-[hsl(var(--secondary))] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[hsl(var(--primary))] rounded-full transition-all" 
                      style={{ width: `${method.percentage || 0}%` }} 
                    />
                  </div>
                  <div className="flex justify-between text-small mt-1">
                    <span>{method.count} giao dịch</span>
                    <span>{method.percentage?.toFixed(1) || 0}%</span>
                  </div>
                </div>
              </div>
            )) || (
              <p className="text-center text-[hsl(var(--muted-foreground))]">
                Chưa có dữ liệu
              </p>
            )}
          </div>
        </div>

        {/* Revenue by Department */}
        <div className="card-base">
          <h3 className="text-section mb-4">Doanh thu theo phòng ban</h3>
          <div className="space-y-3">
            {data?.revenueByDepartment?.slice(0, 5).map((dept, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[hsl(var(--secondary))]">
                <span className="font-medium">{dept.departmentName}</span>
                <span className="font-bold text-[hsl(var(--primary))]">
                  {formatCurrency(dept.revenue)}
                </span>
              </div>
            )) || (
              <p className="text-center text-[hsl(var(--muted-foreground))]">
                Chưa có dữ liệu
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Cache info */}
      {data?.cached && (
        <div className="text-center text-small">
          Dữ liệu được cập nhật lúc {new Date(data.generatedAt).toLocaleString("vi-VN")}
          {data.cacheExpiresAt && ` | Hết hạn: ${new Date(data.cacheExpiresAt).toLocaleString("vi-VN")}`}
        </div>
      )}
    </div>
  );
}
