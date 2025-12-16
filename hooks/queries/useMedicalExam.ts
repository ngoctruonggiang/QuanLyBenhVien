"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createMedicalExam,
  createPrescriptionMock,
  getMedicalExam,
  getMedicalExamByAppointment,
  getMedicalExams,
  getPrescriptionByExam,
  updateMedicalExam,
  updatePrescriptionMock,
} from "@/services/medical-exam.service";
import {
  MedicalExam,
  MedicalExamCreateRequest,
  MedicalExamUpdateRequest,
  ExamStatus,
  Prescription,
  PrescriptionCreateRequest,
} from "@/interfaces/medical-exam";
import { PrescriptionFormValues } from "@/lib/schemas/medical-exam";

function parseDurationDays(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return undefined;
  const match = value.match(/\d+/);
  if (!match) return undefined;
  const parsed = Number.parseInt(match[0], 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

type PrescriptionItemPayload = {
  medicineId: string;
  quantity: number;
  dosage: string;
  duration?: string;
  durationDays?: number;
  notes?: string;
  instructions?: string;
};

type PrescriptionPayload = {
  items: PrescriptionItemPayload[];
  notes?: string;
};

function mapPrescriptionPayloadToRequest(
  payload: PrescriptionPayload | PrescriptionFormValues
): PrescriptionCreateRequest {
  return {
    notes: payload.notes,
    items: payload.items.map((item) => ({
      medicineId: String(item.medicineId),
      quantity: item.quantity,
      dosage: item.dosage,
      durationDays:
        ("durationDays" in item ? item.durationDays : undefined) ??
        parseDurationDays(item.duration),
      instructions:
        ("instructions" in item ? item.instructions : undefined) ??
        item.notes ??
        item.duration ??
        undefined,
    })),
  };
}

export function useMedicalExamList(params: {
  patientId?: string;
  doctorId?: string;
  startDate?: string;
  endDate?: string;
  status?: ExamStatus;
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
}) {
  return useQuery({
    queryKey: ["medical-exams", params],
    queryFn: () => getMedicalExams(params),
  });
}

export function useMedicalExam(id: string) {
  return useQuery<MedicalExam | undefined, Error>({
    queryKey: ["medical-exam", id],
    queryFn: () => getMedicalExam(id),
    enabled: !!id,
  });
}

export function useMedicalExamByAppointment(appointmentId: string) {
  return useQuery<MedicalExam | undefined, Error>({
    queryKey: ["medical-exam", "appointment", appointmentId],
    queryFn: () => getMedicalExamByAppointment(appointmentId),
    enabled: !!appointmentId,
  });
}

export function useCreateMedicalExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      data: MedicalExamCreateRequest;
      doctorInfo?: { id: string; fullName: string };
      patientInfo?: { id: string; fullName: string };
    }) => createMedicalExam(params.data, params.doctorInfo, params.patientInfo),
    onSuccess: (createdExam) => {
      toast.success("Medical exam created successfully");
      queryClient.invalidateQueries({ queryKey: ["medical-exams"] });
      queryClient.invalidateQueries({
        queryKey: ["medical-exam", createdExam.id],
      });
    },
    onError: (error: any) => {
      toast.error(error?.message ?? "Failed to create medical exam");
    },
  });
}

export function useUpdateMedicalExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MedicalExamUpdateRequest }) =>
      updateMedicalExam(id, data),
    onSuccess: (updatedExam, { id }) => {
      toast.success("Medical exam updated successfully");
      queryClient.invalidateQueries({ queryKey: ["medical-exams"] });
      queryClient.invalidateQueries({ queryKey: ["medical-exam", id] });
      queryClient.setQueryData(["medical-exam", id], updatedExam);
    },
    onError: (error: any) => {
      toast.error(error?.message ?? "Failed to update medical exam");
    },
  });
}

export function useCreatePrescription(examId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      input:
        | PrescriptionFormValues
        | { examId: string; data: PrescriptionPayload | PrescriptionFormValues }
    ) => {
      const resolvedExamId =
        typeof examId === "string"
          ? examId
          : "examId" in input
            ? input.examId
            : "";

      if (!resolvedExamId) {
        throw new Error("Missing examId for prescription creation");
      }

      const payload = "examId" in input ? input.data : input;
      return createPrescriptionMock(
        resolvedExamId,
        mapPrescriptionPayloadToRequest(payload)
      );
    },
    onSuccess: (_, variables) => {
      const resolvedExamId =
        typeof examId === "string"
          ? examId
          : typeof variables === "object" && variables && "examId" in variables
            ? (variables.examId as string)
            : undefined;

      toast.success("Prescription created successfully");
      if (resolvedExamId) {
        queryClient.invalidateQueries({
          queryKey: ["medical-exam", resolvedExamId],
        });
      }
      queryClient.invalidateQueries({ queryKey: ["medical-exams"] });
      // Invalidate billing queries since invoice is auto-generated
      queryClient.invalidateQueries({ queryKey: ["billing"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to create prescription"
      );
    },
  });
}

export function useUpdatePrescription(examId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      input:
        | PrescriptionFormValues
        | { examId: string; data: PrescriptionPayload | PrescriptionFormValues }
    ) => {
      const resolvedExamId =
        typeof examId === "string"
          ? examId
          : "examId" in input
            ? input.examId
            : "";

      if (!resolvedExamId) {
        throw new Error("Missing examId for prescription update");
      }

      const payload = "examId" in input ? input.data : input;
      return updatePrescriptionMock(
        resolvedExamId,
        mapPrescriptionPayloadToRequest(payload)
      );
    },
    onSuccess: (_, variables) => {
      const resolvedExamId =
        typeof examId === "string"
          ? examId
          : typeof variables === "object" && variables && "examId" in variables
            ? (variables.examId as string)
            : undefined;

      toast.success("Prescription updated successfully");
      if (resolvedExamId) {
        queryClient.invalidateQueries({
          queryKey: ["medical-exam", resolvedExamId],
        });
      }
      queryClient.invalidateQueries({ queryKey: ["medical-exams"] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update prescription"
      );
    },
  });
}

export function usePrescriptionByExam(examId: string) {
  return useQuery<
    { data: Prescription } | undefined,
    any,
    Prescription | undefined
  >({
    queryKey: ["prescription", examId],
    queryFn: () => getPrescriptionByExam(examId) as any,
    enabled: !!examId,
    select: (data) => data?.data,
  });
}
