import {
  MedicalExam,
  MedicalExamCreateRequest,
  MedicalExamUpdateRequest,
  MedicalExamListParams,
  PrescriptionCreateRequest,
  Prescription,
  ExamStatus,
} from "@/interfaces/medical-exam";
import { mockMedicalExams } from "@/lib/mocks/data/medical-exams"; // IMPORT THE CENTRAL MOCK DATA
import { invoices } from "@/mocks/handlers/billing"; // Import invoices for auto-generation

// Helper to simulate delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ============ Mock Functions for Development ============

export const getMedicalExams = async (params?: MedicalExamListParams) => {
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
  await delay(300);
  return mockMedicalExams.find((e) => e.id === id);
};

export const getMedicalExamByAppointment = async (appointmentId: string) => {
  await delay(300);
  return mockMedicalExams.find((e) => e.appointment.id === appointmentId);
};

export const createMedicalExam = async (
  data: MedicalExamCreateRequest,
  doctorInfo?: { id: string; fullName: string },
  patientInfo?: { id: string; fullName: string }
) => {
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockMedicalExams[examIndex] = {
    ...exam,
    hasPrescription: true,
    prescription: newPrescription,
    updatedAt: new Date().toISOString(),
  };

  // AUTO-GENERATE INVOICE when prescription is created
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
  await delay(300);
  const exam = mockMedicalExams.find((e) => e.id === examId);
  if (!exam || !exam.prescription) {
    // In a real API, this would be a 404
    return undefined;
  }
  return { data: exam.prescription };
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
  // Add other mock implementations as needed
};

export default medicalExamService;
