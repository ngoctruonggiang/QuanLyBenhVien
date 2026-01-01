"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FlaskConical, 
  FileText, 
  ClipboardList,
  Clock,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  RefreshCw,
  Image as ImageIcon,
} from "lucide-react";
import { UserRole } from "@/contexts/AuthContext";
import { LabOrdersSection } from "./LabOrdersSection";
import { OrderLabOrderDialog } from "./OrderLabOrderDialog";
import { useLabOrdersByExam } from "@/hooks/queries/useLabOrder";
import { useLabResultsByExam } from "@/hooks/queries/useLab";
import { ResultStatus } from "@/services/lab.service";

interface LabSectionProps {
  medicalExamId: string;
  patientId: string;
  patientName: string;
  userRole?: UserRole;
  labOrdersBasePath?: string;
  labResultsBasePath?: string;
}

const statusConfig: Record<ResultStatus, { label: string; icon: React.ElementType; color: string }> = {
  PENDING: { label: "Chờ xử lý", icon: Clock, color: "bg-yellow-100 text-yellow-800" },
  PROCESSING: { label: "Đang thực hiện", icon: Clock, color: "bg-blue-100 text-blue-800" },
  COMPLETED: { label: "Hoàn thành", icon: CheckCircle, color: "bg-green-100 text-green-800" },
  CANCELLED: { label: "Đã hủy", icon: AlertTriangle, color: "bg-red-100 text-red-800" },
};

/**
 * Unified Lab Section component với 2 tabs:
 * - Tab "Chỉ định" (Lab Orders): Danh sách phiếu xét nghiệm bác sĩ chỉ định
 * - Tab "Kết quả" (Lab Results): Kết quả xét nghiệm đã hoàn thành
 */
export function LabSection({
  medicalExamId,
  patientId,
  patientName,
  userRole,
  labOrdersBasePath = "/admin/lab-orders",
  labResultsBasePath = "/admin/lab-results",
}: LabSectionProps) {
  const [activeTab, setActiveTab] = useState("orders");

  // Fetch counts for badge display
  const { data: labOrders } = useLabOrdersByExam(medicalExamId);
  const { data: labResults, isLoading: isLoadingResults, refetch, isFetching } = useLabResultsByExam(medicalExamId);

  const ordersCount = labOrders?.length || 0;
  const resultsCount = labResults?.length || 0;
  const pendingResultsCount = labResults?.filter(
    r => r.status === "PENDING" || r.status === "PROCESSING"
  ).length || 0;
  const completedResultsCount = labResults?.filter(
    r => r.status === "COMPLETED"
  ).length || 0;

  // Check if user can create lab orders
  const canCreateOrder = userRole === "ADMIN" || userRole === "DOCTOR";

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
  };

  return (
    <Card className="border-2 border-slate-200 shadow-md rounded-xl">
      <CardHeader className="bg-slate-50 border-b pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-teal-600" />
            Xét nghiệm
          </CardTitle>
          {canCreateOrder && (
            <OrderLabOrderDialog
              medicalExamId={medicalExamId}
              patientId={patientId}
              patientName={patientName}
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b bg-slate-50/50 px-4">
            <TabsList className="h-12 bg-transparent gap-4">
              <TabsTrigger 
                value="orders" 
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2 px-4"
              >
                <ClipboardList className="h-4 w-4" />
                Phiếu Xét nghiệm
                {ordersCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] px-1.5">
                    {ordersCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="results" 
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2 px-4"
              >
                <FileText className="h-4 w-4" />
                Kết quả Xét nghiệm
                {resultsCount > 0 && (
                  <Badge 
                    variant={pendingResultsCount > 0 ? "default" : "secondary"} 
                    className={`ml-1 h-5 min-w-[20px] px-1.5 ${
                      pendingResultsCount > 0 
                        ? "bg-amber-500 hover:bg-amber-600" 
                        : completedResultsCount > 0 
                          ? "bg-emerald-500 hover:bg-emerald-600 text-white" 
                          : ""
                    }`}
                  >
                    {resultsCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="orders" className="m-0">
            <LabOrdersSection 
              medicalExamId={medicalExamId} 
              basePath={labOrdersBasePath}
            />
          </TabsContent>

          <TabsContent value="results" className="m-0 p-4">
            {/* Inline Lab Results Content - no Card wrapper */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-muted-foreground">
                {resultsCount > 0 ? (
                  <>
                    {resultsCount} xét nghiệm • {completedResultsCount} hoàn thành
                    {pendingResultsCount > 0 && `, ${pendingResultsCount} đang chờ`}
                  </>
                ) : (
                  "Chưa có xét nghiệm nào"
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
              </Button>
            </div>

            {isLoadingResults ? (
              <div className="animate-pulse space-y-3">
                <div className="h-16 bg-slate-100 rounded-lg" />
                <div className="h-16 bg-slate-100 rounded-lg" />
              </div>
            ) : resultsCount > 0 ? (
              <div className="space-y-3">
                {labResults?.map((result) => {
                  const statusInfo = statusConfig[result.status];
                  const StatusIcon = statusInfo?.icon || Clock;
                  const hasImages = result.images && result.images.length > 0;

                  return (
                    <Link
                      key={result.id}
                      href={`${labResultsBasePath}/${result.id}`}
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
                                  <ImageIcon className="h-3 w-3" />
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
              <div className="text-center py-12 text-muted-foreground">
                <FlaskConical className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">Chưa có kết quả xét nghiệm nào</p>
                <p className="text-sm mt-1">
                  Kết quả sẽ xuất hiện sau khi kỹ thuật viên nhập liệu
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
