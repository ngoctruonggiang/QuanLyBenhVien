"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  ArrowLeft,
  FileText,
  Download,
  ImageIcon,
  CheckCircle,
  Clock,
  AlertTriangle,
  ZoomIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useLabResult } from "@/hooks/queries/useLab";
import { ResultStatus, DiagnosticImage } from "@/services/lab.service";

const statusConfig: Record<ResultStatus, { label: string; icon: React.ElementType; color: string }> = {
  PENDING: { label: "Chờ xử lý", icon: Clock, color: "bg-yellow-100 text-yellow-800" },
  PROCESSING: { label: "Đang thực hiện", icon: Clock, color: "bg-blue-100 text-blue-800" },
  COMPLETED: { label: "Hoàn thành", icon: CheckCircle, color: "bg-green-100 text-green-800" },
  CANCELLED: { label: "Đã hủy", icon: AlertTriangle, color: "bg-red-100 text-red-800" },
};

export default function PatientLabResultDetailPage() {
  const params = useParams();
  const router = useRouter();
  const resultId = params.id as string;

  const { data: result, isLoading } = useLabResult(resultId);

  // Image viewer state
  const [viewingImage, setViewingImage] = useState<DiagnosticImage | null>(null);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Không tìm thấy kết quả xét nghiệm</p>
        <Link href="/patient/lab-results">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </Link>
      </div>
    );
  }

  const statusInfo = statusConfig[result.status];
  const StatusIcon = statusInfo.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/patient/lab-results">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6 text-teal-500" />
              {result.labTestName}
            </h1>
            <p className="text-muted-foreground">
              Mã xét nghiệm: {result.labTestCode}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status & Result */}
          <Card>
            <CardHeader>
              <CardTitle>Kết quả Xét nghiệm</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Trạng thái</Label>
                  <Badge className={statusInfo.color}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusInfo.label}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Bất thường</Label>
                  <Badge variant={result.isAbnormal ? "destructive" : "secondary"}>
                    {result.isAbnormal ? "Bất thường" : "Bình thường"}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Giá trị kết quả</Label>
                <p className="text-lg font-medium">{result.resultValue || "Chưa có kết quả"}</p>
              </div>

              {result.interpretation && (
                <div className="space-y-2">
                  <Label>Nhận định của bác sĩ</Label>
                  <p className="text-sm bg-muted p-3 rounded-lg">{result.interpretation}</p>
                </div>
              )}

              {result.notes && (
                <div className="space-y-2">
                  <Label>Ghi chú</Label>
                  <p className="text-sm text-muted-foreground">{result.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Hình ảnh chẩn đoán</CardTitle>
              <CardDescription>
                {result.images?.length || 0} hình ảnh
              </CardDescription>
            </CardHeader>
            <CardContent>
              {result.images?.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {result.images.map((image) => (
                    <div
                      key={image.id}
                      className="relative group aspect-square rounded-lg overflow-hidden border bg-muted cursor-pointer"
                      onClick={() => setViewingImage(image)}
                    >
                      {image.downloadUrl ? (
                        <img
                          src={image.downloadUrl}
                          alt={image.fileName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button variant="secondary" size="icon">
                          <ZoomIn className="h-4 w-4" />
                        </Button>
                        {image.downloadUrl && (
                          <a 
                            href={image.downloadUrl} 
                            download 
                            target="_blank" 
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button variant="secondary" size="icon">
                              <Download className="h-4 w-4" />
                            </Button>
                          </a>
                        )}
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/40 p-2">
                        <p className="text-white text-xs truncate">{image.fileName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Chưa có hình ảnh nào</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Loại xét nghiệm</Label>
                <p>{result.labTestName}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Ngày tạo</Label>
                <p>{formatDate(result.createdAt)}</p>
              </div>
              {result.performedBy && (
                <div>
                  <Label className="text-sm text-muted-foreground">Thực hiện bởi</Label>
                  <p>{result.performedBy}</p>
                </div>
              )}
              {result.performedAt && (
                <div>
                  <Label className="text-sm text-muted-foreground">Thời gian thực hiện</Label>
                  <p>{formatDate(result.performedAt)}</p>
                </div>
              )}
              {result.completedAt && (
                <div>
                  <Label className="text-sm text-muted-foreground">Thời gian hoàn thành</Label>
                  <p>{formatDate(result.completedAt)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Image Viewer Dialog */}
      <Dialog open={!!viewingImage} onOpenChange={() => setViewingImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{viewingImage?.fileName}</DialogTitle>
            {viewingImage?.description && (
              <DialogDescription>{viewingImage.description}</DialogDescription>
            )}
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            {viewingImage?.downloadUrl && (
              <img
                src={viewingImage.downloadUrl}
                alt={viewingImage.fileName}
                className="max-h-[70vh] object-contain"
              />
            )}
            {viewingImage?.downloadUrl && (
              <a href={viewingImage.downloadUrl} download target="_blank" rel="noreferrer">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Tải xuống
                </Button>
              </a>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
