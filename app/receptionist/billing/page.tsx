"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Eye,
  Receipt,
  Loader2,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import { getInvoiceList, createCashPayment, InvoiceListParams, PageResponse } from "@/services/billing.service";
import { Invoice } from "@/interfaces/billing";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const STATUS_CONFIG = {
  UNPAID: { label: "Chờ thanh toán", class: "badge-warning", icon: Clock },
  PAID: { label: "Đã thanh toán", class: "badge-success", icon: CheckCircle },
  PARTIALLY_PAID: { label: "Thanh toán một phần", class: "badge-info", icon: Clock },
  OVERDUE: { label: "Quá hạn", class: "badge-danger", icon: Clock },
  CANCELLED: { label: "Đã hủy", class: "badge-danger", icon: XCircle },
};

export default function ReceptionistBillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, [searchQuery, statusFilter]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params: InvoiceListParams = {
        search: searchQuery || undefined,
        status: statusFilter || undefined,
      };
      const response = await getInvoiceList(params);
      setInvoices(response.data.data.content || []);
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
      toast.error("Không thể tải danh sách hóa đơn");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (invoice: Invoice) => {
    try {
      setProcessing(true);
      await createCashPayment(invoice.id);
      toast.success("Đã xác nhận thanh toán thành công!");
      setSelectedInvoice(null);
      fetchInvoices();
    } catch (error) {
      toast.error("Không thể xử lý thanh toán");
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const pendingCount = invoices.filter(i => i.status === "UNPAID" || i.status === "OVERDUE").length;
  const totalPending = invoices
    .filter(i => i.status === "UNPAID" || i.status === "OVERDUE")
    .reduce((sum, i) => sum + i.balanceDue, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-display">Quản lý thanh toán</h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">
            {invoices.length} hóa đơn
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="stat-card-header">
            <p className="text-card-title">Chờ thanh toán</p>
            <div className="stat-arrow-icon bg-[hsl(var(--warning))]">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="stat-number">{pendingCount}</p>
          <p className="text-small">hóa đơn</p>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <p className="text-card-title">Tổng tiền chờ thu</p>
            <div className="stat-arrow-icon">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="stat-number text-lg">{formatCurrency(totalPending)}</p>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <p className="text-card-title">Đã thu hôm nay</p>
            <div className="stat-arrow-icon bg-green-500">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="stat-number text-lg">
            {formatCurrency(
              invoices
                .filter(i => i.status === "PAID")
                .reduce((sum, i) => sum + i.totalAmount, 0)
            )}
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
                placeholder="Tìm theo tên bệnh nhân..."
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
            <option value="UNPAID">Chờ thanh toán</option>
            <option value="PAID">Đã thanh toán</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="table-base">
          <thead>
            <tr>
              <th>Mã hóa đơn</th>
              <th>Ngày tạo</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-[hsl(var(--primary))]" />
                  <p className="text-small mt-2">Đang tải...</p>
                </td>
              </tr>
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12">
                  <Receipt className="w-12 h-12 mx-auto text-[hsl(var(--muted-foreground))] opacity-50" />
                  <p className="text-[hsl(var(--muted-foreground))] mt-2">
                    Không có hóa đơn nào
                  </p>
                </td>
              </tr>
            ) : (
              invoices.map((invoice) => {
                const status = STATUS_CONFIG[invoice.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.UNPAID;
                const StatusIcon = status.icon;
                return (
                  <tr key={invoice.id}>
                    {/* ID */}
                    <td>
                      <p className="font-medium">#{invoice.id.slice(0, 8)}</p>
                      <p className="text-small">Khám: {invoice.appointmentId?.slice(0, 8) || "-"}</p>
                    </td>

                    {/* Date */}
                    <td className="text-sm">{formatDate(invoice.createdAt || invoice.invoiceDate)}</td>

                    {/* Amount */}
                    <td className="font-semibold text-[hsl(var(--primary))]">
                      {formatCurrency(invoice.totalAmount)}
                    </td>

                    {/* Status */}
                    <td>
                      <span className={`badge ${status.class}`}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
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
                          <DropdownMenuItem onClick={() => setSelectedInvoice(invoice)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          {invoice.status === "UNPAID" && (
                            <DropdownMenuItem 
                              className="text-green-600"
                              onClick={() => handlePayment(invoice)}
                            >
                              <CreditCard className="w-4 h-4 mr-2" />
                              Thu tiền
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Invoice Detail Modal */}
      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Chi tiết hóa đơn</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[hsl(var(--secondary))]">
                <p className="font-semibold text-lg">Mã: #{selectedInvoice.id.slice(0, 8)}</p>
                <p className="text-small">Ngày: {formatDate(selectedInvoice.createdAt || selectedInvoice.invoiceDate)}</p>
              </div>

              {selectedInvoice.items && selectedInvoice.items.length > 0 && (
                <div className="space-y-2">
                  <p className="text-label">Chi tiết dịch vụ</p>
                  {selectedInvoice.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>{item.description} x{item.quantity}</span>
                      <span>{formatCurrency(item.amount || (item.unitPrice * item.quantity))}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-[hsl(var(--border))]">
                <span className="font-semibold">Tổng cộng</span>
                <span className="text-xl font-bold text-[hsl(var(--primary))]">
                  {formatCurrency(selectedInvoice.totalAmount)}
                </span>
              </div>

              {selectedInvoice.status === "UNPAID" && (
                <button
                  onClick={() => handlePayment(selectedInvoice)}
                  disabled={processing}
                  className="btn-primary w-full"
                >
                  {processing && <Loader2 className="w-4 h-4 animate-spin" />}
                  Xác nhận thanh toán
                </button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
