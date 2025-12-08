"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { useAppointment } from "@/hooks/queries/useAppointment";
import { useMedicalExamByAppointment } from "@/hooks/queries/useMedicalExam";

export default function PatientExamPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const appointmentId = params.id;
  const [patientId, setPatientId] = useState<string | null>(() => {
    const pid = typeof window !== "undefined" ? localStorage.getItem("patientId") : null;
    return pid || "p001";
  });

  const { data: appointment, isLoading: loadingAppointment } = useAppointment(appointmentId);
  const { data: exam, isLoading: loadingExam, error } = useMedicalExamByAppointment(appointmentId);

  const forbidden = useMemo(() => {
    if (!appointment || !patientId) return false;
    return appointment.patient.id !== patientId;
  }, [appointment, patientId]);

  if (loadingAppointment || loadingExam) {
    return <p className="p-6 text-muted-foreground">Đang tải kết quả khám...</p>;
  }

  if (forbidden) {
    return (
      <div className="page-shell py-10 space-y-3 text-center">
        <p className="text-lg font-semibold text-destructive">Bạn không có quyền xem kết quả này (403)</p>
        <Button variant="outline" onClick={() => router.push("/patient/appointments")}>
          Về danh sách lịch hẹn
        </Button>
      </div>
    );
  }

  if (!exam || error) {
    return (
      <div className="page-shell py-10 space-y-3 text-center">
        <p className="text-lg font-semibold text-muted-foreground">Exam not available yet</p>
        <p className="text-sm text-muted-foreground">
          Bác sĩ chưa hoàn tất hồ sơ khám cho lịch hẹn này. Vui lòng quay lại sau.
        </p>
        <Button variant="outline" onClick={() => router.push("/patient/appointments")}>
          Về danh sách lịch hẹn
        </Button>
      </div>
    );
  }

  return (
    <div className="page-shell space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Kết quả khám bệnh</h1>
          <p className="text-muted-foreground">Lịch hẹn #{appointmentId}</p>
        </div>
        {exam.status ? (
          <Badge variant="outline" className="uppercase">{exam.status}</Badge>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin chung</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Bệnh nhân</p>
            <p className="font-medium">{exam.patient.fullName}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Bác sĩ</p>
            <p className="font-medium">
              {exam.doctor.fullName} {exam.doctor.specialization ? `• ${exam.doctor.specialization}` : ""}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Thời gian khám</p>
            <p className="font-medium">
              {exam.examDate ? new Date(exam.examDate).toLocaleString("vi-VN") : "—"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Lịch hẹn</p>
            <p className="font-medium">{exam.appointment?.appointmentTime ? new Date(exam.appointment.appointmentTime).toLocaleString("vi-VN") : "—"}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dấu hiệu sinh tồn</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            <VitalBox label="Nhiệt độ" value={exam.vitals?.temperature ? `${exam.vitals.temperature}°C` : "—"} />
            <VitalBox
              label="Huyết áp"
              value={
                exam.vitals?.bloodPressureSystolic && exam.vitals?.bloodPressureDiastolic
                  ? `${exam.vitals.bloodPressureSystolic}/${exam.vitals.bloodPressureDiastolic}`
                  : "—"
              }
            />
            <VitalBox label="Nhịp tim" value={exam.vitals?.heartRate ? `${exam.vitals.heartRate} bpm` : "—"} />
            <VitalBox label="Cân nặng" value={exam.vitals?.weight ? `${exam.vitals.weight} kg` : "—"} />
            <VitalBox label="Chiều cao" value={exam.vitals?.height ? `${exam.vitals.height} cm` : "—"} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Kết quả lâm sàng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SectionBox title="Triệu chứng" content={exam.symptoms || "—"} />
          <SectionBox title="Chẩn đoán" content={exam.diagnosis || "—"} />
          <SectionBox title="Phác đồ điều trị" content={exam.treatment || "—"} />
          {exam.notes ? <SectionBox title="Ghi chú" content={exam.notes} /> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Đơn thuốc</CardTitle>
          {exam.prescription ? (
            <Badge variant="secondary">Có đơn thuốc</Badge>
          ) : (
            <Badge variant="outline">Chưa có đơn thuốc</Badge>
          )}
        </CardHeader>
        <CardContent>
          {exam.prescription ? (
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Ngày kê</span>
                <span>{new Date(exam.prescription.createdAt).toLocaleString("vi-VN")}</span>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Thuốc</TableHead>
                    <TableHead>Liều dùng</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead className="text-center">Số lượng</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exam.prescription.items.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{item.medicineName}</TableCell>
                      <TableCell>{item.dosage}</TableCell>
                      <TableCell>{item.duration}</TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {exam.prescription.notes ? (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Ghi chú đơn thuốc</p>
                  <p className="text-sm bg-muted/40 rounded-md p-3 whitespace-pre-wrap">
                    {exam.prescription.notes}
                  </p>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Chưa có đơn thuốc cho lượt khám này.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-2">
          <p className="text-sm font-semibold">Lưu ý</p>
          <p className="text-sm text-muted-foreground">
            Thông tin khám chỉ mang tính tham khảo. Vui lòng tuân thủ hướng dẫn của bác sĩ và liên hệ bệnh viện nếu có
            câu hỏi hoặc triệu chứng bất thường.
          </p>
        </CardContent>
      </Card>

      <Separator />
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => router.push("/patient/appointments")}>
          Quay lại lịch hẹn
        </Button>
      </div>
    </div>
  );
}

function VitalBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}

function SectionBox({ title, content }: { title: string; content: string }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p className="text-sm bg-muted/40 rounded-md p-3 whitespace-pre-wrap">{content}</p>
    </div>
  );
}
