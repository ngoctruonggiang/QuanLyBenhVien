"use client";

import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  Clock,
  Edit,
  Loader2,
  Pill,
  Plus,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { useMedicalExam } from "@/hooks/queries/useMedicalExam";

const formatDate = (value: string) =>
  new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

// Check if exam is within 24-hour edit window
const isEditable = (createdAt: string) => {
  const created = new Date(createdAt);
  const now = new Date();
  const diffHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
  return diffHours <= 24;
};

// Calculate remaining time for edit window
const getTimeRemaining = (createdAt: string) => {
  const created = new Date(createdAt);
  const deadline = new Date(created.getTime() + 24 * 60 * 60 * 1000);
  const now = new Date();
  const diff = deadline.getTime() - now.getTime();
  if (diff <= 0) return null;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
};

export default function MedicalExamDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: exam, isLoading, error } = useMedicalExam(params.id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">
          Loading exam details...
        </span>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <p className="text-muted-foreground">Exam not found</p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  const canEdit = isEditable(exam.createdAt);
  const timeRemaining = getTimeRemaining(exam.createdAt);

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Medical Examination
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <CalendarClock className="h-4 w-4" />
              {formatDate(exam.examDate)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && timeRemaining && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeRemaining} left to edit
            </Badge>
          )}
          <Button variant="outline" disabled={!canEdit} asChild={canEdit}>
            {canEdit ? (
              <Link href={`/admin/exams/${exam.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Link>
            ) : (
              <>
                <Edit className="mr-2 h-4 w-4" /> Edit (Locked)
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Patient & Doctor Info */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Patient Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Name</span>
              <span className="font-medium">{exam.patient.fullName}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Date of Birth
              </span>
              <span>{exam.patient.dateOfBirth || "—"}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Gender</span>
              <span>{exam.patient.gender || "—"}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Phone</span>
              <span>{exam.patient.phoneNumber || "—"}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Doctor Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Name</span>
              <span className="font-medium">{exam.doctor.fullName}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Specialization
              </span>
              <span>{exam.doctor.specialization || "General"}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Phone</span>
              <span>{exam.doctor.phoneNumber || "—"}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vitals */}
      {exam.vitals && (
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Vital Signs</CardTitle>
            <CardDescription>Recorded at examination</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              <div className="rounded-lg bg-blue-50 p-3 text-center">
                <p className="text-xs text-muted-foreground">Temperature</p>
                <p className="text-lg font-semibold text-blue-700">
                  {exam.vitals.temperature
                    ? `${exam.vitals.temperature}°C`
                    : "—"}
                </p>
              </div>
              <div className="rounded-lg bg-red-50 p-3 text-center">
                <p className="text-xs text-muted-foreground">Blood Pressure</p>
                <p className="text-lg font-semibold text-red-700">
                  {exam.vitals.bloodPressureSystolic &&
                  exam.vitals.bloodPressureDiastolic
                    ? `${exam.vitals.bloodPressureSystolic}/${exam.vitals.bloodPressureDiastolic}`
                    : "—"}
                </p>
              </div>
              <div className="rounded-lg bg-pink-50 p-3 text-center">
                <p className="text-xs text-muted-foreground">Heart Rate</p>
                <p className="text-lg font-semibold text-pink-700">
                  {exam.vitals.heartRate ? `${exam.vitals.heartRate} bpm` : "—"}
                </p>
              </div>
              <div className="rounded-lg bg-green-50 p-3 text-center">
                <p className="text-xs text-muted-foreground">Weight</p>
                <p className="text-lg font-semibold text-green-700">
                  {exam.vitals.weight ? `${exam.vitals.weight} kg` : "—"}
                </p>
              </div>
              <div className="rounded-lg bg-purple-50 p-3 text-center">
                <p className="text-xs text-muted-foreground">Height</p>
                <p className="text-lg font-semibold text-purple-700">
                  {exam.vitals.height ? `${exam.vitals.height} cm` : "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clinical Findings */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Clinical Findings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Symptoms
            </p>
            <p className="text-sm whitespace-pre-wrap bg-muted/50 rounded-md p-3">
              {exam.symptoms || "No symptoms recorded"}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Diagnosis
            </p>
            <p className="text-sm whitespace-pre-wrap bg-muted/50 rounded-md p-3">
              {exam.diagnosis || "No diagnosis recorded"}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Notes
            </p>
            <p className="text-sm whitespace-pre-wrap bg-muted/50 rounded-md p-3">
              {exam.notes || "No additional notes"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Prescription */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Pill className="h-4 w-4" /> Prescription
            </CardTitle>
            <CardDescription>Prescribed medications</CardDescription>
          </div>
          {!exam.prescription && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/admin/exams/${exam.id}/prescription`}>
                <Plus className="mr-2 h-3 w-3" /> Add Prescription
              </Link>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {exam.prescription ? (
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Prescription Date</span>
                <span>{formatDate(exam.prescription.createdAt)}</span>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medicine</TableHead>
                    <TableHead className="text-center">Quantity</TableHead>
                    <TableHead>Dosage</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exam.prescription.items.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">
                        {item.medicineName}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.quantity}
                      </TableCell>
                      <TableCell>{item.dosage}</TableCell>
                      <TableCell>{item.frequency}</TableCell>
                      <TableCell>{item.duration}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {exam.prescription.notes && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Prescription Notes
                  </p>
                  <p className="text-sm bg-muted/50 rounded-md p-3">
                    {exam.prescription.notes}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <Pill className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p>No prescription added yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
