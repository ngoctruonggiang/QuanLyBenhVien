"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyVNPayReturn } from "@/services/billing.service";
import { Payment } from "@/interfaces/billing";
import { CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get all VNPay params from URL
        const params: Record<string, string> = {};
        searchParams.forEach((value, key) => {
          params[key] = value;
        });

        // Check if we have VNPay response
        if (!params.vnp_ResponseCode) {
          setError("Không tìm thấy thông tin thanh toán");
          setLoading(false);
          return;
        }

        // Call backend to verify and update payment
        const response = await verifyVNPayReturn(params);
        setPayment(response.data.data);
      } catch (err: any) {
        console.error("Payment verification error:", err);
        setError(
          err.response?.data?.message || "Có lỗi xảy ra khi xác nhận thanh toán"
        );
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  const getStatusIcon = () => {
    if (loading) {
      return <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />;
    }
    if (payment?.status === "COMPLETED") {
      return <CheckCircle className="h-16 w-16 text-green-500" />;
    }
    if (payment?.status === "CANCELLED") {
      return <AlertCircle className="h-16 w-16 text-yellow-500" />;
    }
    return <XCircle className="h-16 w-16 text-red-500" />;
  };

  const getStatusMessage = () => {
    if (loading) return "Đang xác nhận thanh toán...";
    if (payment?.status === "COMPLETED") return "Thanh toán thành công!";
    if (payment?.status === "CANCELLED") return "Giao dịch đã bị hủy";
    if (payment?.status === "FAILED") return "Thanh toán thất bại";
    if (error) return error;
    return "Không xác định được trạng thái";
  };

  const getStatusDescription = () => {
    if (loading) return "Vui lòng đợi trong giây lát...";
    if (payment?.status === "COMPLETED") {
      return `Hóa đơn ${payment.invoice.invoiceNumber} đã được thanh toán ${formatCurrency(payment.amount)}`;
    }
    if (payment?.status === "CANCELLED") {
      return "Bạn đã hủy giao dịch thanh toán";
    }
    if (payment?.vnpResponseCode) {
      return getVNPayErrorMessage(payment.vnpResponseCode);
    }
    return "Vui lòng thử lại hoặc liên hệ hỗ trợ";
  };

  const getVNPayErrorMessage = (code: string): string => {
    const messages: Record<string, string> = {
      "00": "Giao dịch thành công",
      "07": "Trừ tiền thành công. Giao dịch bị nghi ngờ",
      "09": "Thẻ/Tài khoản chưa đăng ký Internet Banking",
      "10": "Xác thực thông tin thẻ/tài khoản không đúng quá 3 lần",
      "11": "Đã hết thời gian chờ thanh toán",
      "12": "Thẻ/Tài khoản bị khóa",
      "13": "Nhập sai mật khẩu xác thực (OTP)",
      "24": "Khách hàng hủy giao dịch",
      "51": "Tài khoản không đủ số dư",
      "65": "Vượt quá hạn mức giao dịch trong ngày",
      "75": "Ngân hàng thanh toán đang bảo trì",
      "79": "Nhập sai mật khẩu quá số lần quy định",
      "99": "Lỗi không xác định",
    };
    return messages[code] || `Lỗi không xác định: ${code}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">{getStatusIcon()}</div>
          <CardTitle className="text-2xl">{getStatusMessage()}</CardTitle>
          <CardDescription className="text-base">
            {getStatusDescription()}
          </CardDescription>
        </CardHeader>

        {payment && !loading && (
          <CardContent className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Mã giao dịch:</span>
                <span className="font-medium">{payment.txnRef}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Số hóa đơn:</span>
                <span className="font-medium">
                  {payment.invoice.invoiceNumber}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Số tiền:</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(payment.amount)}
                </span>
              </div>
              {payment.vnpBankCode && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ngân hàng:</span>
                  <span className="font-medium">{payment.vnpBankCode}</span>
                </div>
              )}
              {payment.paymentDate && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Thời gian:</span>
                  <span className="font-medium">
                    {new Date(payment.paymentDate).toLocaleString("vi-VN")}
                  </span>
                </div>
              )}
            </div>

            {payment.status === "COMPLETED" &&
              payment.invoice.status !== "PAID" && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                  <strong>Lưu ý:</strong> Hóa đơn còn số dư chưa thanh toán.
                  Bạn có thể tiếp tục thanh toán phần còn lại.
                </div>
              )}
          </CardContent>
        )}

        <CardFooter className="flex gap-2 justify-center">
          {payment?.status === "COMPLETED" ? (
            <>
              <Button
                variant="outline"
                onClick={() => router.push(`/admin/billing/${payment.invoice.id}`)}
              >
                Xem hóa đơn
              </Button>
              <Button onClick={() => router.push("/admin/billing")}>
                Danh sách hóa đơn
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => router.push("/admin/billing")}
              >
                Quay lại
              </Button>
              <Button onClick={() => router.back()}>Thử lại</Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

// Wrapper with Suspense for useSearchParams (required for static generation)
export default function PaymentResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
              </div>
              <CardTitle className="text-2xl">Đang tải...</CardTitle>
            </CardHeader>
          </Card>
        </div>
      }
    >
      <PaymentResultContent />
    </Suspense>
  );
}
