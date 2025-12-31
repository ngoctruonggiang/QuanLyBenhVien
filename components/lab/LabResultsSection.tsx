"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  FlaskConical,
  Clock,
  CheckCircle,
  AlertTriangle,
  Image,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLabResultsByExam } from "@/hooks/queries/useLab";
import { ResultStatus } from "@/services/lab.service";

interface LabResultsSectionProps {
  medicalExamId: string;
  patientName?: string;
  basePath?: string; // Base path for lab result detail links (default: /doctor/lab-results)
}

const statusConfig: Record<ResultStatus, { label: string; icon: React.ElementType; color: string }> = {
  PENDING: { label: "Chờ xử lý", icon: Clock, color: "bg-yellow-100 text-yellow-800" },
  PROCESSING: { label: "Đang thực hiện", icon: Clock, color: "bg-blue-100 text-blue-800" },
  COMPLETED: { label: "Hoàn thành", icon: CheckCircle, color: "bg-green-100 text-green-800" },
  CANCELLED: { label: "Đã hủy", icon: AlertTriangle, color: "bg-red-100 text-red-800" },
};

export function LabResultsSection({ 
  medicalExamId, 
  patientName,
  basePath = "/doctor/lab-results" 
}: LabResultsSectionProps) {
  const { data: labResults, isLoading, refetch, isFetching } = useLabResultsByExam(medicalExamId);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  const hasResults = labResults && labResults.length > 0;
  const completedCount = labResults?.filter(r => r.status === "COMPLETED").length || 0;
  const pendingCount = labResults?.filter(r => r.status === "PENDING" || r.status === "PROCESSING").length || 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-teal-500" />
            Kết quả Xét nghiệm
          </CardTitle>
          <CardDescription>
            {hasResults ? (
              <>
                {labResults.length} xét nghiệm • {completedCount} hoàn thành
                {pendingCount > 0 && `, ${pendingCount} đang chờ`}
              </>
            ) : (
              "Chưa có xét nghiệm nào"
            )}
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {hasResults ? (
          <div className="space-y-3">
            {labResults.map((result) => {
              const statusInfo = statusConfig[result.status];
              const StatusIcon = statusInfo?.icon || Clock;
              const hasImages = result.images && result.images.length > 0;

              return (
                <Link
                  key={result.id}
                  href={`${basePath}/${result.id}`}
                  className="block"
                >
                  <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium truncate">{result.labTestName}</span>
                        <Badge className={statusInfo?.color || ""} variant="secondary">
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo?.label || result.status}
                        </Badge>
                        {result.isAbnormal && (
                          <Badge variant="destructive">Bất thường</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Mã: {result.labTestCode}</span>
                        <span>•</span>
                        <span>{formatDate(result.createdAt)}</span>
                        {hasImages && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Image className="h-3 w-3" />
                              {result.images.length} ảnh
                            </span>
                          </>
                        )}
                      </div>
                      {result.resultValue && (
                        <p className="text-sm mt-1 text-foreground">
                          Kết quả: <span className="font-medium">{result.resultValue}</span>
                        </p>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <FlaskConical className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Chưa có xét nghiệm nào được chỉ định</p>
            <p className="text-sm">Sử dụng nút "Order Xét nghiệm" để chỉ định xét nghiệm</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
