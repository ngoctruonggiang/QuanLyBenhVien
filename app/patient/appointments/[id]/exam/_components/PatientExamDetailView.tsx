"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MedicalExam } from "@/interfaces/medical-exam";
import { format } from "date-fns";
import {
  Stethoscope,
  HeartPulse,
  Pill,
  FileText,
  TriangleAlert,
} from "lucide-react";

interface PatientExamDetailViewProps {
  medicalExam: MedicalExam;
}

const DetailItem = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div>
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="font-medium">{value || "-"}</p>
  </div>
);

export function PatientExamDetailView({
  medicalExam,
}: PatientExamDetailViewProps) {
  const vitals = [
    { label: "Temp (°C)", value: medicalExam.vitals.temperature },
    {
      label: "BP (sys/dia)",
      value: `${medicalExam.vitals.bloodPressureSystolic || "-"}/${medicalExam.vitals.bloodPressureDiastolic || "-"}`,
    },
    { label: "Heart Rate (bpm)", value: medicalExam.vitals.heartRate },
    { label: "Weight (kg)", value: medicalExam.vitals.weight },
    { label: "Height (cm)", value: medicalExam.vitals.height },
  ].filter((v) => v.value && v.value !== "undefined/undefined");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-6 w-6" />
            Medical Exam Summary
          </CardTitle>
          <p className="text-muted-foreground">
            Exam performed on{" "}
            {format(new Date(medicalExam.examDate), "MMMM d, yyyy")} with{" "}
            <strong>Dr. {medicalExam.doctor.fullName}</strong>
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-base">Symptoms</h3>
            <p className="text-muted-foreground">{medicalExam.symptoms}</p>
          </div>
          <Separator />
          <div className="space-y-2">
            <h3 className="font-semibold text-base">Diagnosis</h3>
            <p className="text-primary font-medium">{medicalExam.diagnosis}</p>
          </div>
          <Separator />
          <div className="space-y-2">
            <h3 className="font-semibold text-base">Treatment Plan</h3>
            <p className="text-muted-foreground">{medicalExam.treatment}</p>
          </div>
        </CardContent>
      </Card>

      {vitals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <HeartPulse className="h-5 w-5" /> Vitals
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {vitals.map(
              (v) =>
                v.value && (
                  <DetailItem key={v.label} label={v.label} value={v.value} />
                ),
            )}
          </CardContent>
        </Card>
      )}

      {medicalExam.prescription &&
        medicalExam.prescription.items.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Pill className="h-5 w-5" /> Prescription
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medicine</TableHead>
                    <TableHead>Dosage</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {medicalExam.prescription.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {item.medicineName}
                      </TableCell>
                      <TableCell>{item.dosage}</TableCell>
                      <TableCell>{item.duration}</TableCell>
                      <TableCell>{item.instructions || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {medicalExam.prescription.notes && (
                <div className="pt-4 mt-4 border-t">
                  <h4 className="font-semibold mb-1">
                    General Prescription Notes:
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {medicalExam.prescription.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

      <Card className="border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
        <CardHeader className="flex-row items-center gap-3 space-y-0">
          <TriangleAlert className="h-5 w-5 text-amber-600" />
          <CardTitle className="text-amber-700 dark:text-amber-400 text-lg">
            Disclaimer
          </CardTitle>
        </CardHeader>
        <CardContent className="text-amber-700 dark:text-amber-500 text-sm">
          This summary is for your reference only. Please contact your doctor
          directly if you have any questions about your diagnosis, treatment, or
          prescription.
        </CardContent>
      </Card>
    </div>
  );
}
