"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  FileText,
  Search,
  Eye,
  ImageIcon,
  CheckCircle,
  Clock,
  AlertTriangle,
  Download,
  ZoomIn,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useLabResultsByPatient } from "@/hooks/queries/useLab";
import { useMyProfile } from "@/hooks/queries/usePatient";
import { LabTestResult, ResultStatus, DiagnosticImage } from "@/services/lab.service";

const statusConfig: Record<ResultStatus, { label: string; icon: React.ElementType; color: string }> = {
  PENDING: { label: "Chờ xử lý", icon: Clock, color: "bg-yellow-100 text-yellow-800" },
  PROCESSING: { label: "Đang thực hiện", icon: Clock, color: "bg-blue-100 text-blue-800" },
  COMPLETED: { label: "Hoàn thành", icon: CheckCircle, color: "bg-green-100 text-green-800" },
  CANCELLED: { label: "Đã hủy", icon: AlertTriangle, color: "bg-red-100 text-red-800" },
};

export default function PatientLabResultsPage() {
  const router = useRouter();
  const { data: profile, isLoading: profileLoading } = useMyProfile();
  const patientId = profile?.id;

  const { data: results, isLoading } = useLabResultsByPatient(patientId || "");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ResultStatus | "ALL">("ALL");
  const [expandedResult, setExpandedResult] = useState<string | null>(null);
  const [viewingImage, setViewingImage] = useState<DiagnosticImage | null>(null);

  const labResults: LabTestResult[] = results || [];

  // Filter results
  const filteredResults = labResults.filter((result) => {
    const matchesSearch = result.labTestName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || result.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
  };

  if (profileLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <h1>
          <FileText className="h-6 w-6 text-teal-500" />
          Kết quả Xét nghiệm
        </h1>
        <p>Xem kết quả xét nghiệm và hình ảnh chẩn đoán của bạn</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tên xét nghiệm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as ResultStatus | "ALL")}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả</SelectItem>
                <SelectItem value="PENDING">Chờ xử lý</SelectItem>
                <SelectItem value="PROCESSING">Đang thực hiện</SelectItem>
                <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : filteredResults.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Bạn chưa có kết quả xét nghiệm nào</p>
          </CardContent>
        </Card>
      ) : (
        <Accordion type="single" collapsible className="space-y-4">
          {filteredResults.map((result) => {
            const statusInfo = statusConfig[result.status];
            const StatusIcon = statusInfo.icon;

            return (
              <AccordionItem
                key={result.id}
                value={result.id}
                className="border rounded-lg px-4 bg-card"
              >
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-4">
                      <div className="text-left">
                        <p className="font-medium">{result.labTestName}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(result.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {result.isAbnormal && result.status === "COMPLETED" && (
                        <Badge variant="destructive">Bất thường</Badge>
                      )}
                      <Badge className={statusInfo.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusInfo.label}
                      </Badge>
                      {result.images?.length > 0 && (
                        <Badge variant="outline">
                          <ImageIcon className="h-3 w-3 mr-1" />
                          {result.images.length}
                        </Badge>
                      )}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pt-4 space-y-4">
                    {/* Result Value */}
                    {result.status === "COMPLETED" && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Kết quả</p>
                            <p className="text-lg font-semibold">
                              {result.resultValue || "Không xác định"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Trạng thái</p>
                            <Badge variant={result.isAbnormal ? "destructive" : "secondary"}>
                              {result.isAbnormal ? "Bất thường" : "Bình thường"}
                            </Badge>
                          </div>
                        </div>

                        {result.interpretation && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">
                              Nhận định của bác sĩ
                            </p>
                            <p className="text-sm bg-muted p-3 rounded-lg">
                              {result.interpretation}
                            </p>
                          </div>
                        )}

                        <Separator />
                      </>
                    )}

                    {/* Images */}
                    {result.images?.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-3">Hình ảnh chẩn đoán</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {result.images.map((image) => (
                            <div
                              key={image.id}
                              className="relative aspect-square rounded-lg overflow-hidden border cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                              onClick={() => setViewingImage(image)}
                            >
                              {image.downloadUrl ? (
                                <img
                                  src={image.downloadUrl}
                                  alt={image.fileName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-muted">
                                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
                                <ZoomIn className="h-6 w-6 text-white opacity-0 hover:opacity-100" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Timestamps */}
                    <div className="text-xs text-muted-foreground">
                      {result.performedAt && (
                        <span>Thực hiện: {formatDate(result.performedAt)}</span>
                      )}
                      {result.completedAt && (
                        <span className="ml-4">Hoàn thành: {formatDate(result.completedAt)}</span>
                      )}
                    </div>

                    {/* View Detail Button */}
                    <div className="flex justify-end pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/patient/lab-results/${result.id}`)}
                      >
                        Xem chi tiết
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}

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
