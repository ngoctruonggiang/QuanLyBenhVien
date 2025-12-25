import {
  MedicalExam,
  MedicalExamCreateRequest,
  MedicalExamUpdateRequest,
  MedicalExamListParams,
  PrescriptionCreateRequest,
  Prescription,
  ExamStatus,
  PrescriptionStatus,
} from "@/interfaces/medical-exam";
import { mockMedicalExams } from "@/lib/mocks/data/medical-exams"; // IMPORT THE CENTRAL MOCK DATA
import { invoices } from "@/mocks/handlers/billing"; // Import invoices for auto-generation
import axiosInstance from "@/config/axios";
import { USE_MOCK } from "@/lib/mocks/toggle";

const BASE_URL_EXAMS = "/exams";
const BASE_URL_PRESCRIPTIONS = "/prescriptions";

// Helper to simulate delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ============ Mock Functions for Development ============

export const getMedicalExams = async (params?: MedicalExamListParams) => {
  if (!USE_MOCK) {
    // Build RSQL filter for backend
    const filters: string[] = [];
    
    if (params?.doctorId) {
      filters.push(`doctorId==${params.doctorId}`);
    }
    if (params?.patientId) {
      filters.push(`patientId==${params.patientId}`);
    }
    if (params?.status) {
      filters.push(`status==${params.status}`);
    }
    // Date range filter - use ISO 8601 format with Z suffix for Instant fields
    if (params?.startDate) {
      filters.push(`examDate=ge=${params.startDate}T00:00:00Z`);
    }
    if (params?.endDate) {
      filters.push(`examDate=le=${params.endDate}T23:59:59Z`);
    }

    // Add search filter for patientName
    if (params?.search) {
      // RSQL uses ==*value* for LIKE queries (not =like=)
      filters.push(`patientName==*${params.search}*`);
    }

    const apiParams: Record<string, any> = {
      page: params?.page,
      size: params?.size,
      sort: params?.sort,
    };

    if (filters.length > 0) {
      apiParams.filter = filters.join(";");
    }

    console.log("[MedicalExamService] API params:", apiParams);
    const response = await axiosInstance.get(`${BASE_URL_EXAMS}/all`, { params: apiParams });
    // Backend returns ApiResponse<PageResponse<T>> - extract data.data
    return response.data.data;
  }

  await delay(500);
  let filtered = [...mockMedicalExams];

  if (params?.search) {
    const searchTerm = params.search.toLowerCase();
    filtered = filtered.filter((e) =>
      e.patient.fullName.toLowerCase().includes(searchTerm)
    );
  }

  if (params?.doctorId) {
    filtered = filtered.filter((e) => e.doctor.id === params.doctorId);
  }

  if (params?.status) {
    filtered = filtered.filter((e) => e.status === params.status);
  }

  if (params?.startDate) {
    filtered = filtered.filter(
      (e) => new Date(e.examDate) >= new Date(params.startDate!)
    );
  }

  if (params?.endDate) {
    filtered = filtered.filter(
      (e) => new Date(e.examDate) <= new Date(params.endDate!)
    );
  }

  const page = params?.page || 0;
  const size = params?.size || 20;
  const start = page * size;
  const end = start + size;

  return {
    data: {
      content: filtered.slice(start, end),
      page,
      size,
      totalElements: filtered.length,
      totalPages: Math.ceil(filtered.length / size),
      last: end >= filtered.length,
    },
  };
};

export const getMedicalExam = async (id: string) => {
  if (!USE_MOCK) {
    const response = await axiosInstance.get(`${BASE_URL_EXAMS}/${id}`);
    return response.data.data;
  }

  await delay(300);
  return mockMedicalExams.find((e) => e.id === id);
};

export const getMedicalExamByAppointment = async (appointmentId: string) => {
  if (!USE_MOCK) {
    const response = await axiosInstance.get(`${BASE_URL_EXAMS}/by-appointment/${appointmentId}`);
    return response.data.data;
  }

  await delay(300);
  return mockMedicalExams.find((e) => e.appointment.id === appointmentId);
};

export const createMedicalExam = async (
  data: MedicalExamCreateRequest,
  doctorInfo?: { id: string; fullName: string },
  patientInfo?: { id: string; fullName: string }
) => {
  if (!USE_MOCK) {
    console.log("📞 [MedicalExamService] Creating medical exam with payload:", data);
    try {
      const response = await axiosInstance.post(BASE_URL_EXAMS, data);
      console.log("✅ [MedicalExamService] Created successfully:", response.data);
      return response.data.data;
    } catch (error: any) {
      console.error("❌ [MedicalExamService] Error creating medical exam:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        errorData: error.response?.data,
        payload: data,
      });
      throw error;
    }
  }

  await delay(500);
  const status: ExamStatus = data.status || "PENDING";
  const newExam: MedicalExam = {
    id: `exam${String(mockMedicalExams.length + 1).padStart(3, "0")}`,
    appointment: {
      id: data.appointmentId,
      appointmentTime: new Date().toISOString(),
    },
    patient: patientInfo || { id: "p001", fullName: "New Patient" },
    doctor: doctorInfo || { id: "emp001", fullName: "Dr. Current User" },
    status,
    diagnosis: data.diagnosis,
    symptoms: data.symptoms,
    treatment: data.treatment,
    vitals: {
      temperature: data.temperature,
      bloodPressureSystolic: data.bloodPressureSystolic,
      bloodPressureDiastolic: data.bloodPressureDiastolic,
      heartRate: data.heartRate,
      weight: data.weight,
      height: data.height,
    },
    notes: data.notes,
    examDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    hasPrescription: false,
  };
  mockMedicalExams.push(newExam);
  return newExam;
};

export const updateMedicalExam = async (
  id: string,
  data: MedicalExamUpdateRequest
) => {
  if (!USE_MOCK) {
    const response = await axiosInstance.patch(`${BASE_URL_EXAMS}/${id}`, data);
    return response.data.data;
  }

  await delay(500);
  const index = mockMedicalExams.findIndex((e) => e.id === id);
  if (index === -1) throw new Error("Medical Exam not found");

  const examToUpdate = mockMedicalExams[index];

  // Check 24-hour window
  const createdAt = new Date(examToUpdate.createdAt);
  const now = new Date();
  const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
  if (hoursDiff > 24) {
    throw new Error("Cannot modify exam after 24 hours");
  }

  const updatedExam = {
    ...examToUpdate,
    status: data.status ?? examToUpdate.status,
    diagnosis: data.diagnosis ?? examToUpdate.diagnosis,
    symptoms: data.symptoms ?? examToUpdate.symptoms,
    treatment: data.treatment ?? examToUpdate.treatment,
    vitals: {
      temperature: data.temperature ?? examToUpdate.vitals.temperature,
      bloodPressureSystolic:
        data.bloodPressureSystolic ?? examToUpdate.vitals.bloodPressureSystolic,
      bloodPressureDiastolic:
        data.bloodPressureDiastolic ??
        examToUpdate.vitals.bloodPressureDiastolic,
      heartRate: data.heartRate ?? examToUpdate.vitals.heartRate,
      weight: data.weight ?? examToUpdate.vitals.weight,
      height: data.height ?? examToUpdate.vitals.height,
    },
    notes: data.notes ?? examToUpdate.notes,
    updatedAt: new Date().toISOString(),
  };

  mockMedicalExams[index] = updatedExam;
  return updatedExam;
};

export const createPrescriptionMock = async (
  examId: string,
  data: PrescriptionCreateRequest
) => {
  if (!USE_MOCK) {
    // Backend expects POST /exams/{examId}/prescriptions (nested resource pattern)
    // Not POST /prescriptions with examId in body
    const response = await axiosInstance.post(
      `${BASE_URL_EXAMS}/${examId}/prescriptions`,
      data
    );
    return response.data.data;
  }

  await delay(500);
  const examIndex = mockMedicalExams.findIndex((e) => e.id === examId);
  if (examIndex === -1) throw new Error("Medical exam not found");

  const exam = mockMedicalExams[examIndex];

  if (exam.hasPrescription) {
    throw new Error("Prescription already exists for this exam");
  }

  const newPrescription: Prescription = {
    id: `rx${String(Date.now()).slice(-6)}`,
    medicalExam: { id: examId },
    patient: exam.patient,
    doctor: exam.doctor,
    prescribedAt: new Date().toISOString(),
    notes: data.notes,
    items: data.items.map((item, idx) => ({
      id: `rxi${idx + 1}`,
      medicine: { id: item.medicineId, name: `Medicine ${item.medicineId}` },
      quantity: item.quantity,
      unitPrice: 10000,
      dosage: item.dosage,
      durationDays: item.durationDays,
      instructions: item.instructions,
    })),
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockMedicalExams[examIndex] = {
    ...exam,
    hasPrescription: true,
    prescription: newPrescription,
    updatedAt: new Date().toISOString(),
  };

  // AUTO-GENERATE INVOICE when prescription is created (Backend handles this)
  const consultationFee = 200000; // Base consultation fee
  const medicineItems = newPrescription.items.map((item) => ({
    id: `item-${Date.now()}-${item.id}`,
    invoiceId: `inv-${examId}`,
    type: "MEDICINE" as const,
    description: item.medicine.name,
    referenceId: item.medicine.id,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    amount: item.quantity * item.unitPrice,
  }));

  const consultationItem = {
    id: `item-${Date.now()}-consult`,
    invoiceId: `inv-${examId}`,
    type: "CONSULTATION" as const,
    description: "Phí khám bệnh",
    referenceId: examId,
    quantity: 1,
    unitPrice: consultationFee,
    amount: consultationFee,
  };

  const allItems = [consultationItem, ...medicineItems];
  const subtotal = allItems.reduce((sum, item) => sum + item.amount, 0);
  const tax = Math.round(subtotal * 0.1); // 10% tax
  const totalAmount = subtotal + tax;

  const newInvoice = {
    id: `inv-${examId}`,
    invoiceNumber: `INV-${new Date().toISOString().split("T")[0].replace(/-/g, "")}-${String(invoices.length + 1).padStart(4, "0")}`,
    patientId: exam.patient.id,
    patientName: exam.patient.fullName,
    invoiceDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    appointmentId: exam.appointment.id,
    medicalExamId: examId, // Store exam ID for linking
    subtotal,
    discount: 0,
    tax,
    totalAmount,
    paidAmount: 0,
    balance: totalAmount,
    status: "UNPAID",
    notes: `Invoice for prescription ${newPrescription.id}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: allItems,
    payments: [],
  };

  invoices.push(newInvoice);

  return newPrescription;
};

export const updatePrescriptionMock = async (
  examId: string,
  data: PrescriptionCreateRequest
) => {
  if (!USE_MOCK) {
    // Current Backend PrescriptionController likely DOES NOT support update.
    // I will try standard PATCH /prescriptions/{id} if I can find ID.
    // But if controller doesn't have it, it will 404.
    // Let's assume for now we cannot update or we try a hypothetical endpoint.
    // If user didn't ask to implement missing backend features, I should just try best guess or throw.
    // Throwing is safer to avoid confusion.
    throw new Error("Update prescription not implemented in backend yet");
  }

  await delay(500);
  const examIndex = mockMedicalExams.findIndex((e) => e.id === examId);
  if (examIndex === -1) throw new Error("Medical exam not found");

  const exam = mockMedicalExams[examIndex];
  if (!exam.prescription) {
    throw new Error("Prescription not found for this exam");
  }

  const updatedPrescription: Prescription = {
    ...exam.prescription,
    notes: data.notes,
    items: data.items.map((item, idx) => ({
      id: exam.prescription!.items[idx]?.id ?? `rxi${idx + 1}`,
      medicine: { id: item.medicineId, name: `Medicine ${item.medicineId}` },
      quantity: item.quantity,
      unitPrice: exam.prescription!.items[idx]?.unitPrice ?? 10000,
      dosage: item.dosage,
      durationDays: item.durationDays,
      instructions: item.instructions,
    })),
    updatedAt: new Date().toISOString(),
  };

  mockMedicalExams[examIndex] = {
    ...exam,
    hasPrescription: true,
    prescription: updatedPrescription,
    updatedAt: new Date().toISOString(),
  };

  return updatedPrescription;
};

export const getPrescriptionByExam = async (examId: string) => {
  if (!USE_MOCK) {
    // Correct Path: GET /exams/{examId}/prescription
    const response = await axiosInstance.get(`${BASE_URL_EXAMS}/${examId}/prescription`);
    return { data: response.data.data }; // Match mock structure return { data: ... }
  }

  await delay(300);
  const exam = mockMedicalExams.find((e) => e.id === examId);
  if (!exam || !exam.prescription) {
    // In a real API, this would be a 404
    return undefined;
  }
  return { data: exam.prescription };
};

/**
 * Dispense a prescription.
 * This marks the prescription as DISPENSED and triggers invoice generation.
 * @param prescriptionId - The prescription ID to dispense
 * @returns The updated prescription
 */
export const dispensePrescription = async (prescriptionId: string): Promise<Prescription> => {
  if (!USE_MOCK) {
    // Backend endpoint: POST /exams/prescriptions/{id}/dispense
    const response = await axiosInstance.post(`${BASE_URL_EXAMS}/prescriptions/${prescriptionId}/dispense`);
    return response.data.data;
  }

  // Mock implementation
  await delay(500);
  
  // Find the exam with this prescription
  const examIndex = mockMedicalExams.findIndex((e) => e.prescription?.id === prescriptionId);
  if (examIndex === -1) throw new Error("Prescription not found");
  
  const exam = mockMedicalExams[examIndex];
  if (!exam.prescription) throw new Error("Prescription not found");
  
  if (exam.prescription.status === "DISPENSED") {
    throw new Error("Prescription already dispensed");
  }
  
  if (exam.prescription.status === "CANCELLED") {
    throw new Error("Cannot dispense cancelled prescription");
  }
  
  // Update prescription status
  const updatedPrescription: Prescription = {
    ...exam.prescription,
    status: "DISPENSED" as PrescriptionStatus,
    dispensedAt: new Date().toISOString(),
    dispensedBy: "current-user-id", // In real app, get from auth context
    updatedAt: new Date().toISOString(),
  };
  
  mockMedicalExams[examIndex] = {
    ...exam,
    prescription: updatedPrescription,
    updatedAt: new Date().toISOString(),
  };
  
  return updatedPrescription;
};

// ============ Medical Exam Service ============

const medicalExamService = {
  create: createMedicalExam,
  getById: getMedicalExam,
  getByAppointment: getMedicalExamByAppointment,
  getList: getMedicalExams,
  update: updateMedicalExam,
  createPrescription: createPrescriptionMock,
  updatePrescription: updatePrescriptionMock,
  getPrescriptionByExam: getPrescriptionByExam,
  dispensePrescription: dispensePrescription,
};

export default medicalExamService;
