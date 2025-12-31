"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarDays, FileText, Pill } from "lucide-react";
import { format } from "date-fns";
import { useMedicalExamList } from "@/hooks/queries/useMedicalExam";
import { useAuth } from "@/contexts/AuthContext";
import { useMyProfile } from "@/hooks/queries/usePatient";
import { Spinner } from "@/components/ui/spinner";
import { DataTablePagination } from "@/components/ui/data-table-pagination";

export default function PatientMedicalRecordsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [page, setPage] = useState(0);
  const pageSize = 10;

  // Fetch patient profile to get patientId
  const { data: profile, isLoading: isLoadingProfile } = useMyProfile();
  const patientId = profile?.id || "";

  const queryParams = useMemo(
    () => ({
      patientId: patientId || undefined, // Only pass if we have a valid patientId
      startDate: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
      endDate: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
      page,
      size: pageSize,
      sort: "examDate,desc",
    }),
    [patientId, startDate, endDate, page]
  );

  const { data, isLoading } = useMedicalExamList(queryParams);

  const exams = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;

  // Show loading while fetching profile
  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" variant="muted" />
      </div>
    );
  }

  if (!user || user.role !== "PATIENT") {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive">Truy cập bị từ chối</h2>
          <p className="text-muted-foreground mt-2">
            Chỉ bệnh nhân mới có thể xem hồ sơ bệnh án.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Hồ sơ bệnh án
        </h1>
        <p className="text-muted-foreground">
          Xem lịch sử khám bệnh và đơn thuốc của bạn
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lọc theo ngày</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[200px] justify-start">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "dd/MM/yyyy") : "Từ ngày"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => {
                    setStartDate(date);
                    setPage(0);
                  }}
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[200px] justify-start">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "dd/MM/yyyy") : "Đến ngày"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => {
                    setEndDate(date);
                    setPage(0);
                  }}
                />
              </PopoverContent>
            </Popover>

            {(startDate || endDate) && (
              <Button
                variant="ghost"
                onClick={() => {
                  setStartDate(undefined);
                  setEndDate(undefined);
                  setPage(0);
                }}
              >
                Xóa bộ lọc
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Medical Records List */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner size="lg" variant="muted" />
        </div>
      ) : exams.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Không có hồ sơ</h3>
            <p className="text-muted-foreground mt-2">
              Bạn chưa có lịch sử khám bệnh nào.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {exams.map((exam) => (
            <Card
              key={exam.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/patient/medical-records/${exam.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <span className="text-lg font-semibold">
                        {format(new Date(exam.examDate), "dd/MM/yyyy")}
                      </span>
                      {exam.prescription && (
                        <Pill className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {exam.doctor?.fullName || "Unknown Doctor"}
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">
                    Xem →
                  </Button>
                </div>
              </CardHeader>
              {exam.diagnosis && (
                <CardContent className="pt-0">
                  <div className="text-sm">
                    <span className="font-medium">Chẩn đoán: </span>
                    <span className="text-muted-foreground">
                      {exam.diagnosis}
                    </span>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalElements > 0 && (
        <DataTablePagination
          currentPage={page}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={pageSize}
          onPageChange={setPage}
          showRowsPerPage={false}
        />
      )}
    </div>
  );
}
