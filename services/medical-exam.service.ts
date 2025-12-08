import api from "@/config/axios";
import {
  MedicalExam,
  MedicalExamCreateRequest,
  MedicalExamUpdateRequest,
  MedicalExamListItem,
  MedicalExamListParams,
  PrescriptionCreateRequest,
  Prescription,
  PrescriptionListItem,
  PaginatedResponse,
  ExamStatus,
} from "@/interfaces/medical-exam";

const BASE_URL = "/api/exams";

// ============ Medical Exam Service ============

const medicalExamService = {
  // Create medical exam
  create: (data: MedicalExamCreateRequest) =>
    api.post<{ status: string; data: MedicalExam }>(BASE_URL, data),

  // Get exam by ID
  getById: (id: string) =>
    api.get<{ status: string; data: MedicalExam }>(`${BASE_URL}/${id}`),

  // Get exam by appointment ID
  getByAppointment: (appointmentId: string) =>
    api.get<{ status: string; data: MedicalExam }>(
      `${BASE_URL}/by-appointment/${appointmentId}`
    ),

  // List exams with filters
  getList: (params: MedicalExamListParams) =>
    api.get<{ status: string; data: PaginatedResponse<MedicalExamListItem> }>(
      BASE_URL,
      { params }
    ),

  // Update exam (within 24 hours)
  update: (id: string, data: MedicalExamUpdateRequest) =>
    api.patch<{ status: string; data: MedicalExam }>(`${BASE_URL}/${id}`, data),

  // Create prescription for exam
  createPrescription: (examId: string, data: PrescriptionCreateRequest) =>
    api.post<{ status: string; data: Prescription }>(
      `${BASE_URL}/${examId}/prescriptions`,
      data
    ),

  // Get prescription by exam ID
  getPrescriptionByExam: (examId: string) =>
    api.get<{ status: string; data: Prescription }>(
      `${BASE_URL}/${examId}/prescription`
    ),

  // Get prescription by ID
  getPrescriptionById: (prescriptionId: string) =>
    api.get<{ status: string; data: Prescription }>(
      `${BASE_URL}/prescriptions/${prescriptionId}`
    ),

  // Get prescriptions by patient
  getPrescriptionsByPatient: (
    patientId: string,
    params?: { page?: number; size?: number }
  ) =>
    api.get<{ status: string; data: PaginatedResponse<PrescriptionListItem> }>(
      `${BASE_URL}/prescriptions/by-patient/${patientId}`,
      { params }
    ),
};

export default medicalExamService;

// ============ Mock Data for Development - IDs synced with patient.service.ts ============

const mockExams: MedicalExam[] = [
  {
    id: "exam001",
    appointment: { id: "apt-001", appointmentTime: "2025-12-05T09:00:00" },
    patient: {
      id: "p001",
      fullName: "Nguyen Van An",
      dateOfBirth: "1990-05-15",
      gender: "Male",
      phoneNumber: "0901234567",
    },
    doctor: {
      id: "emp-101",
      fullName: "Dr. John Smith",
      specialization: "Cardiology",
      phoneNumber: "0912345678",
    },
    status: "FINALIZED",
    diagnosis: "Hypertension Stage 1",
    symptoms: "Headache, dizziness",
    treatment: "Lifestyle changes, medication",
    vitals: {
      temperature: 36.8,
      bloodPressureSystolic: 145,
      bloodPressureDiastolic: 95,
      heartRate: 78,
      weight: 75.5,
      height: 175.0,
    },
    notes: "Follow-up in 2 weeks",
    examDate: "2025-12-05T10:30:00Z",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    hasPrescription: true,
    prescription: {
      id: "rx001",
      notes: "Take with food. Monitor blood pressure daily.",
      items: [
        {
          medicineId: "med001",
          medicineName: "Amlodipine 5mg",
          quantity: 30,
          dosage: "1 tablet",
          frequency: "Once daily",
          duration: "30 days",
          instructions: "Take in the morning",
        },
        {
          medicineId: "med002",
          medicineName: "Losartan 50mg",
          quantity: 30,
          dosage: "1 tablet",
          frequency: "Once daily",
          duration: "30 days",
          instructions: "Take in the evening",
        },
      ],
      createdAt: "2025-12-05T10:45:00Z",
    },
  },
  {
    id: "exam002",
    appointment: { id: "apt-002", appointmentTime: "2025-12-04T14:00:00" },
    patient: {
      id: "p002",
      fullName: "Tran Thi Mai",
      dateOfBirth: "1985-08-20",
      gender: "Female",
      phoneNumber: "0912345678",
    },
    doctor: {
      id: "emp-102",
      fullName: "Dr. Sarah Johnson",
      specialization: "Pediatrics",
      phoneNumber: "0914567890",
    },
    status: "FINALIZED",
    diagnosis: "Common Cold",
    symptoms: "Runny nose, sore throat, mild fever",
    treatment: "Rest, fluids, paracetamol as needed",
    vitals: {
      temperature: 37.8,
      bloodPressureSystolic: 110,
      bloodPressureDiastolic: 70,
      heartRate: 82,
      weight: 55,
      height: 160,
    },
    notes: "Return if symptoms worsen",
    examDate: "2025-12-04T14:30:00Z",
    createdAt: "2025-12-04T14:30:00Z",
    updatedAt: "2025-12-04T14:30:00Z",
    hasPrescription: true,
    prescription: {
      id: "rx002",
      notes: "Get plenty of rest and drink fluids",
      items: [
        {
          medicineId: "med004",
          medicineName: "Paracetamol 500mg",
          quantity: 20,
          dosage: "1-2 tablets",
          frequency: "Every 6 hours as needed",
          duration: "5 days",
          instructions: "Take with water after meals",
        },
        {
          medicineId: "med005",
          medicineName: "Vitamin C 1000mg",
          quantity: 30,
          dosage: "1 tablet",
          frequency: "Once daily",
          duration: "30 days",
          instructions: "Take after breakfast",
        },
      ],
      createdAt: "2025-12-04T14:45:00Z",
    },
  },
  {
    id: "exam003",
    appointment: { id: "apt-003", appointmentTime: "2025-12-03T10:00:00" },
    patient: {
      id: "p003",
      fullName: "Le Hoang Phuc",
      dateOfBirth: "1978-12-01",
      gender: "Male",
      phoneNumber: "0923456789",
    },
    doctor: {
      id: "emp-101",
      fullName: "Dr. John Smith",
      specialization: "Cardiology",
      phoneNumber: "0912345678",
    },
    status: "FINALIZED",
    diagnosis: "Diabetes Type 2",
    symptoms: "Frequent urination, increased thirst, fatigue",
    treatment: "Metformin, dietary changes, regular monitoring",
    vitals: {
      temperature: 36.5,
      bloodPressureSystolic: 130,
      bloodPressureDiastolic: 85,
      heartRate: 76,
      weight: 85,
      height: 170,
    },
    notes: "Lab work required in 3 months",
    examDate: "2025-12-03T10:45:00Z",
    createdAt: "2025-12-03T10:45:00Z",
    updatedAt: "2025-12-03T10:45:00Z",
    hasPrescription: true,
    prescription: {
      id: "rx003",
      notes: "Avoid sugary foods, monitor blood sugar regularly",
      items: [
        {
          medicineId: "med003",
          medicineName: "Metformin 500mg",
          quantity: 60,
          dosage: "1 tablet",
          frequency: "Twice daily",
          duration: "30 days",
          instructions: "Take with meals",
        },
      ],
      createdAt: "2025-12-03T11:00:00Z",
    },
  },
  {
    id: "exam004",
    appointment: { id: "apt-004", appointmentTime: "2025-11-28T09:00:00" },
    patient: {
      id: "p001",
      fullName: "Nguyen Van An",
      dateOfBirth: "1990-05-15",
      gender: "Male",
      phoneNumber: "0901234567",
    },
    doctor: {
      id: "emp-103",
      fullName: "Dr. Emily Carter",
      specialization: "Emergency Medicine",
      phoneNumber: "0915678901",
    },
    status: "FINALIZED",
    diagnosis: "Acute Bronchitis",
    symptoms: "Cough with mucus, chest discomfort, fatigue",
    treatment: "Antibiotics, cough suppressant, rest",
    vitals: {
      temperature: 38.2,
      bloodPressureSystolic: 125,
      bloodPressureDiastolic: 82,
      heartRate: 88,
      weight: 75.5,
      height: 175.0,
    },
    notes: "Follow-up if not improved in 7 days",
    examDate: "2025-11-28T09:30:00Z",
    createdAt: "2025-11-28T09:30:00Z",
    updatedAt: "2025-11-28T09:30:00Z",
    hasPrescription: true,
    prescription: {
      id: "rx004",
      notes: "Complete full course of antibiotics",
      items: [
        {
          medicineId: "med006",
          medicineName: "Amoxicillin 500mg",
          quantity: 21,
          dosage: "1 tablet",
          frequency: "Three times daily",
          duration: "7 days",
          instructions: "Take every 8 hours",
        },
        {
          medicineId: "med007",
          medicineName: "Dextromethorphan Syrup",
          quantity: 1,
          dosage: "10ml",
          frequency: "Three times daily",
          duration: "5 days",
          instructions: "Take after meals",
        },
      ],
      createdAt: "2025-11-28T09:45:00Z",
    },
  },
];

// Helper to simulate delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ============ Mock Functions for Development ============

export const getMedicalExams = async (params?: MedicalExamListParams) => {
  await delay(500);
  let filtered = [...mockExams];

  if (params?.patientId) {
    filtered = filtered.filter((e) => e.patient.id === params.patientId);
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
    // Return full exam data including prescription for patient detail modal
    content: filtered.slice(start, end).map((exam) => ({
      id: exam.id,
      appointment: exam.appointment,
      patient: exam.patient,
      doctor: exam.doctor,
      status: exam.status,
      diagnosis: exam.diagnosis,
      symptoms: exam.symptoms,
      treatment: exam.treatment,
      vitals: exam.vitals,
      notes: exam.notes,
      examDate: exam.examDate,
      hasPrescription: exam.hasPrescription,
      prescription: exam.prescription,
    })),
    page,
    size,
    totalElements: filtered.length,
    totalPages: Math.ceil(filtered.length / size),
    last: end >= filtered.length,
  };
};

export const getMedicalExam = async (id: string) => {
  await delay(300);
  return mockExams.find((e) => e.id === id);
};

export const getMedicalExamByAppointment = async (appointmentId: string) => {
  await delay(300);
  return mockExams.find((e) => e.appointment.id === appointmentId);
};

export const createMedicalExam = async (data: MedicalExamCreateRequest) => {
  await delay(500);
  const status: ExamStatus = data.status || "PENDING";
  const newExam: MedicalExam = {
    id: `exam${String(mockExams.length + 1).padStart(3, "0")}`,
    appointment: {
      id: data.appointmentId,
      appointmentTime: new Date().toISOString(),
    },
    patient: { id: "p001", fullName: "New Patient" },
    doctor: { id: "emp001", fullName: "Dr. Current User" },
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
  mockExams.push(newExam);
  return newExam;
};

export const updateMedicalExam = async (
  id: string,
  data: MedicalExamUpdateRequest
) => {
  await delay(500);
  const index = mockExams.findIndex((e) => e.id === id);
  if (index === -1) throw new Error("Medical Exam not found");

  // Check 24-hour window
  const createdAt = new Date(mockExams[index].createdAt);
  const now = new Date();
  const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
  if (hoursDiff > 24) {
    throw new Error("Cannot modify exam after 24 hours");
  }

  mockExams[index] = {
    ...mockExams[index],
    status: data.status ?? mockExams[index].status,
    diagnosis: data.diagnosis ?? mockExams[index].diagnosis,
    symptoms: data.symptoms ?? mockExams[index].symptoms,
    treatment: data.treatment ?? mockExams[index].treatment,
    vitals: {
      temperature: data.temperature ?? mockExams[index].vitals.temperature,
      bloodPressureSystolic:
        data.bloodPressureSystolic ??
        mockExams[index].vitals.bloodPressureSystolic,
      bloodPressureDiastolic:
        data.bloodPressureDiastolic ??
        mockExams[index].vitals.bloodPressureDiastolic,
      heartRate: data.heartRate ?? mockExams[index].vitals.heartRate,
      weight: data.weight ?? mockExams[index].vitals.weight,
      height: data.height ?? mockExams[index].vitals.height,
    },
    notes: data.notes ?? mockExams[index].notes,
    updatedAt: new Date().toISOString(),
  };

  return mockExams[index];
};

export const createPrescriptionMock = async (
  examId: string,
  data: PrescriptionCreateRequest
) => {
  await delay(500);
  const examIndex = mockExams.findIndex((e) => e.id === examId);
  if (examIndex === -1) throw new Error("Medical exam not found");

  if (mockExams[examIndex].hasPrescription) {
    throw new Error("Prescription already exists for this exam");
  }

  const newPrescription: Prescription = {
    id: `rx${String(Date.now()).slice(-6)}`,
    medicalExam: { id: examId },
    patient: mockExams[examIndex].patient,
    doctor: mockExams[examIndex].doctor,
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

  mockExams[examIndex].hasPrescription = true;

  return newPrescription;
};
