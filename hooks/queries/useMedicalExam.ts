import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import medicalExamService from "@/services/medical-exam.service";
import {
  MedicalExamCreateRequest,
  MedicalExamUpdateRequest,
  MedicalExamListParams,
  PrescriptionCreateRequest,
} from "@/interfaces/medical-exam";
import {
  getMedicalExamErrorMessage,
  getPrescriptionErrorMessage,
} from "@/lib/utils/error";

export const medicalExamKeys = {
  all: ["medical-exam"] as const,
  lists: () => [...medicalExamKeys.all, "list"] as const,
  list: (params: MedicalExamListParams) =>
    [...medicalExamKeys.lists(), params] as const,
  details: () => [...medicalExamKeys.all, "detail"] as const,
  detail: (id: string) => [...medicalExamKeys.details(), id] as const,
  byAppointment: (appointmentId: string) =>
    [...medicalExamKeys.details(), "by-appointment", appointmentId] as const,

  // Prescription Keys
  prescriptions: () => [...medicalExamKeys.all, "prescriptions"] as const,
  prescription: (examId: string) => [...medicalExamKeys.prescriptions(), "exam", examId] as const,
  prescriptionById: (id: string) => [...medicalExamKeys.prescriptions(), 'detail', id] as const,
  prescriptionsByPatient: (patientId: string) => [...medicalExamKeys.prescriptions(), 'patient', patientId] as const,
};

// Get exam list
export const useMedicalExamList = (params: MedicalExamListParams) => {
  return useQuery({
    queryKey: medicalExamKeys.list(params),
    queryFn: () => medicalExamService.getList(params),
  });
};

// ... (other query hooks are unchanged)

// Get exam by ID
export const useMedicalExam = (id: string) => {
  return useQuery({
    queryKey: medicalExamKeys.detail(id),
    queryFn: () => medicalExamService.getById(id),
    enabled: !!id,
  });
};

export const useMedicalExamByAppointment = (appointmentId: string) => {
  return useQuery({
    queryKey: medicalExamKeys.byAppointment(appointmentId),
    queryFn: () => medicalExamService.getByAppointment(appointmentId),
    enabled: !!appointmentId,
  });
};

// Create exam
export const useCreateMedicalExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MedicalExamCreateRequest) =>
      medicalExamService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: medicalExamKeys.lists() });
      toast.success("Medical exam created successfully");
      return response.data;
    },
    onError: (error: any) => {
      const message = getMedicalExamErrorMessage(
        error.response?.data?.error?.code || error.message,
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
    }) => medicalExamService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: medicalExamKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: medicalExamKeys.lists() });
      toast.success("Medical exam updated successfully");
    },
    onError: (error: any) => {
      const message = getMedicalExamErrorMessage(
        error.response?.data?.error?.code || error.message,
      );
      toast.error(message);
    },
  });
};

// Get prescription by exam
export const usePrescriptionByExam = (examId: string) => {
  return useQuery({
    queryKey: medicalExamKeys.prescription(examId),
    queryFn: () => medicalExamService.getPrescriptionByExam(examId),
    enabled: !!examId,
  });
};

// Get prescription by ID
export const usePrescriptionById = (id: string) => {
  return useQuery({
    queryKey: medicalExamKeys.prescriptionById(id),
    queryFn: () => medicalExamService.getPrescriptionById(id),
    enabled: !!id,
  });
};

// Get prescriptions by patient
export const usePrescriptionsByPatient = (
  patientId: string,
  params?: { page?: number; size?: number },
) => {
  return useQuery({
    queryKey: medicalExamKeys.prescriptionsByPatient(patientId),
    queryFn: () =>
      medicalExamService.getPrescriptionsByPatient(patientId, params),
    enabled: !!patientId,
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
    }) => medicalExamService.createPrescription(examId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: medicalExamKeys.prescription(variables.examId),
      });
      queryClient.invalidateQueries({
        queryKey: medicalExamKeys.detail(variables.examId),
      });
      toast.success(
        "Prescription created successfully. Invoice has been generated.",
      );
    },
    onError: (error: any) => {
      const message = getPrescriptionErrorMessage(
        error.response?.data?.error?.code || error.message,
      );
      toast.error(message);
    },
  });
};

// Update prescription
export const useUpdatePrescription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      examId,
      data,
    }: {
      examId: string;
      data: PrescriptionCreateRequest;
    }) => medicalExamService.updatePrescription(examId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: medicalExamKeys.detail(variables.examId),
      });
      toast.success("Prescription updated successfully.");
    },
    onError: (error: any) => {
      const message = getPrescriptionErrorMessage(
        error.response?.data?.error?.code || error.message,
      );
      toast.error(message);
    },
  });
};

// ... (Error message mappings are unchanged)
