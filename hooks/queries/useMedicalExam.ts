import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getMedicalExams,
  createMedicalExam,
  getMedicalExam,
  updateMedicalExam,
  createPrescriptionMock,
} from "@/services/medical-exam.service";
import {
  MedicalExamCreateRequest,
  MedicalExamUpdateRequest,
  MedicalExamListParams,
  PrescriptionCreateRequest,
} from "@/interfaces/medical-exam";

// Query Keys
export const medicalExamKeys = {
  all: ["medicalExams"] as const,
  lists: () => [...medicalExamKeys.all, "list"] as const,
  list: (params: MedicalExamListParams) =>
    [...medicalExamKeys.lists(), params] as const,
  details: () => [...medicalExamKeys.all, "detail"] as const,
  detail: (id: string) => [...medicalExamKeys.details(), id] as const,
  byAppointment: (appointmentId: string) =>
    [...medicalExamKeys.all, "appointment", appointmentId] as const,
  prescriptions: () => ["prescriptions"] as const,
  prescription: (examId: string) =>
    [...medicalExamKeys.prescriptions(), "exam", examId] as const,
  prescriptionById: (id: string) =>
    [...medicalExamKeys.prescriptions(), "detail", id] as const,
  prescriptionsByPatient: (patientId: string) =>
    [...medicalExamKeys.prescriptions(), "patient", patientId] as const,
};

// Get exam list
export const useMedicalExamList = (params: MedicalExamListParams) => {
  return useQuery({
    queryKey: medicalExamKeys.list(params),
    queryFn: () => getMedicalExams(params),
  });
};

// Legacy hook for backwards compatibility
export const useMedicalExams = (
  page: number,
  size: number,
  search?: string
) => {
  return useQuery({
    queryKey: ["medical-exams", page, size, search],
    queryFn: () => getMedicalExams({ page: page - 1, size }),
  });
};

// Get exam by ID
export const useMedicalExam = (id: string) => {
  return useQuery({
    queryKey: medicalExamKeys.detail(id),
    queryFn: () => getMedicalExam(id),
    enabled: !!id,
  });
};

// Create exam
export const useCreateMedicalExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MedicalExamCreateRequest) => createMedicalExam(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: medicalExamKeys.lists() });
      toast.success("Medical exam created successfully");
    },
    onError: (error: any) => {
      const message = getMedicalExamErrorMessage(
        error.response?.data?.error?.code || error.message
      );
      toast.error(message);
    },
  });
};

// Update exam
export const useUpdateMedicalExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: MedicalExamUpdateRequest;
    }) => updateMedicalExam(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: medicalExamKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: medicalExamKeys.lists() });
      toast.success("Medical exam updated successfully");
    },
    onError: (error: any) => {
      const message = getMedicalExamErrorMessage(
        error.response?.data?.error?.code || error.message
      );
      toast.error(message);
    },
  });
};

// Create prescription
export const useCreatePrescription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      examId,
      data,
    }: {
      examId: string;
      data: PrescriptionCreateRequest;
    }) => createPrescriptionMock(examId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: medicalExamKeys.prescription(variables.examId),
      });
      queryClient.invalidateQueries({
        queryKey: medicalExamKeys.detail(variables.examId),
      });
      toast.success(
        "Prescription created successfully. Invoice has been generated."
      );
    },
    onError: (error: any) => {
      const message = getPrescriptionErrorMessage(
        error.response?.data?.error?.code || error.message
      );
      toast.error(message);
    },
  });
};

// Error message mappings
function getMedicalExamErrorMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    VALIDATION_ERROR: "Please check the form for errors",
    APPOINTMENT_NOT_FOUND: "Appointment not found",
    APPOINTMENT_NOT_COMPLETED:
      "Appointment must be completed before creating an exam",
    EXAM_EXISTS: "A medical exam already exists for this appointment",
    EXAM_NOT_FOUND: "Medical exam not found",
    EXAM_NOT_MODIFIABLE: "Cannot modify exam after 24 hours",
    "Cannot modify exam after 24 hours": "Cannot modify exam after 24 hours",
    FORBIDDEN: "You do not have permission to perform this action",
    UNAUTHORIZED: "Please log in to continue",
  };
  return (
    errorMessages[errorCode] ||
    "An unexpected error occurred. Please try again."
  );
}

function getPrescriptionErrorMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    VALIDATION_ERROR: "Please check the prescription for errors",
    EXAM_NOT_FOUND: "Medical exam not found",
    MEDICINE_NOT_FOUND: "One or more medicines not found",
    INSUFFICIENT_STOCK: "Insufficient stock for one or more medicines",
    PRESCRIPTION_EXISTS: "A prescription already exists for this exam",
    "Prescription already exists for this exam":
      "A prescription already exists for this exam",
    PRESCRIPTION_NOT_FOUND: "Prescription not found",
    FORBIDDEN: "You do not have permission to create this prescription",
    UNAUTHORIZED: "Please log in to continue",
  };
  return (
    errorMessages[errorCode] ||
    "An unexpected error occurred. Please try again."
  );
}
