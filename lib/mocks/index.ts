import { Invoice } from "@/interfaces/billing";
import { EmployeeSchedule } from "@/interfaces/hr";
import { Patient, PatientStatus } from "@/interfaces/patient";
import { Appointment } from "@/interfaces/appointment";

export const mockDepartments = [
  {
    id: "dep-1",
    name: "Cardiology",
    description: "Heart and cardiovascular system",
    headDoctorId: "emp-101",
    headDoctorName: "Dr. John Smith",
    location: "Building A, Floor 3",
    phoneExtension: "1001",
    status: "ACTIVE" as const,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "dep-2",
    name: "Pediatrics",
    description: "Medical care for children",
    headDoctorId: "emp-102",
    headDoctorName: "Dr. Sarah Johnson",
    location: "Building B, Floor 2",
    phoneExtension: "2001",
    status: "ACTIVE" as const,
    createdAt: "2025-01-02T00:00:00Z",
    updatedAt: "2025-01-02T00:00:00Z",
  },
  {
    id: "dep-3",
    name: "Emergency",
    description: "24/7 Emergency care",
    headDoctorId: "emp-103",
    headDoctorName: "Dr. Emily Carter",
    location: "Building C, Ground",
    phoneExtension: "3001",
    status: "ACTIVE" as const,
    createdAt: "2025-01-03T00:00:00Z",
    updatedAt: "2025-01-03T00:00:00Z",
  },
] as const;

export const mockEmployees: Employee[] = [
  {
    id: "emp-101",
    fullName: "Dr. John Smith",
    role: "DOCTOR",
    departmentId: "dep-1",
    departmentName: "Cardiology",
    specialization: "Cardiology",
    email: "john.smith@hospital.com",
    phoneNumber: "555-0101",
    status: "ACTIVE",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "emp-102",
    fullName: "Dr. Sarah Johnson",
    role: "DOCTOR",
    departmentId: "dep-2",
    departmentName: "Pediatrics",
    specialization: "Pediatrics",
    email: "sarah.johnson@hospital.com",
    phoneNumber: "555-0102",
    status: "ACTIVE",
    createdAt: "2025-01-02T00:00:00Z",
    updatedAt: "2025-01-02T00:00:00Z",
  },
  {
    id: "emp-103",
    fullName: "Dr. Emily Carter",
    role: "DOCTOR",
    departmentId: "dep-3",
    departmentName: "Emergency",
    specialization: "Emergency Medicine",
    email: "emily.carter@hospital.com",
    phoneNumber: "555-0103",
    status: "ACTIVE",
    createdAt: "2025-01-03T00:00:00Z",
    updatedAt: "2025-01-03T00:00:00Z",
  },
  {
    id: "emp-104",
    fullName: "Nurse Mary Williams",
    role: "NURSE",
    departmentId: "dep-1",
    departmentName: "Cardiology",
    email: "mary.williams@hospital.com",
    phoneNumber: "555-0104",
    status: "ON_LEAVE",
    createdAt: "2025-01-04T00:00:00Z",
    updatedAt: "2025-01-04T00:00:00Z",
  },
  {
    id: "emp-105",
    fullName: "Receptionist Anna Lee",
    role: "RECEPTIONIST",
    departmentId: "dep-3",
    departmentName: "Emergency",
    email: "anna.lee@hospital.com",
    phoneNumber: "555-0105",
    status: "ACTIVE",
    createdAt: "2025-01-05T00:00:00Z",
    updatedAt: "2025-01-05T00:00:00Z",
  },
  {
    id: "emp-new-doctor-001",
    fullName: "Dr. New Test",
    role: "DOCTOR",
    departmentId: "dep-1",
    departmentName: "Cardiology",
    specialization: "General",
    email: "newdoctor@hms.com",
    phoneNumber: "555-0106",
    status: "ACTIVE",
    createdAt: "2025-12-06T00:00:00Z",
    updatedAt: "2025-12-06T00:00:00Z",
  },
];

const patientStatuses: PatientStatus[] = [
  "New",
  "Waiting",
  "In Visit",
  "Completed",
  "Active",
  "Inactive",
];

// Use consistent patient IDs matching patient.service.ts (p001, p002, etc.)
export const mockPatients: Patient[] = [
  {
    id: "p001",
    avatar: null,
    fullName: "Nguyen Van An",
    dateOfBirth: "1990-05-15",
    gender: "MALE",
    status: "Active",
  },
  {
    id: "p002",
    avatar: null,
    fullName: "Tran Thi Mai",
    dateOfBirth: "1985-08-20",
    gender: "FEMALE",
    status: "Active",
  },
  {
    id: "p003",
    avatar: null,
    fullName: "Le Hoang Phuc",
    dateOfBirth: "1978-12-01",
    gender: "MALE",
    status: "In Visit",
  },
  {
    id: "p004",
    avatar: null,
    fullName: "Pham Minh Duc",
    dateOfBirth: "1995-03-25",
    gender: "MALE",
    status: "Waiting",
  },
  {
    id: "p005",
    avatar: null,
    fullName: "Vo Thi Hong",
    dateOfBirth: "2000-07-10",
    gender: "FEMALE",
    status: "New",
  },
];

export const mockAppointments: AppointmentResponse[] = [
  {
    id: "apt-001",
    patient: "Nguyen Van An",
    doctor: "Dr. John Smith",
    datetime: "2025-12-05T10:00:00Z",
    type: "CONSULTATION",
    status: "SCHEDULED",
    reason: "Annual checkup",
  },
  {
    id: "apt-002",
    patient: "Tran Thi Mai",
    doctor: "Dr. Sarah Johnson",
    datetime: "2025-12-04T14:30:00Z",
    type: "FOLLOW_UP",
    status: "COMPLETED",
    reason: "Flu symptoms",
  },
  {
    id: "apt-003",
    patient: "Le Hoang Phuc",
    doctor: "Dr. Emily Carter",
    datetime: "2025-12-06T09:00:00Z",
    type: "CONSULTATION",
    status: "SCHEDULED",
    reason: "Blood pressure consult",
  },
];

// Shifts per department for HR schedule view
const staticSchedules: (EmployeeSchedule & {
  departmentId?: string;
  shift?: "MORNING" | "AFTERNOON" | "EVENING";
})[] = [
  // Dr. John Smith (emp-101) schedules
  {
    id: "sch-1",
    employeeId: "emp-101",
    employeeName: "Dr. John Smith",
    departmentId: "dep-1",
    workDate: "2025-12-01",
    startTime: "07:00",
    endTime: "12:00",
    shift: "MORNING",
    status: "AVAILABLE",
    createdAt: "2025-11-25T00:00:00Z",
    updatedAt: "2025-11-25T00:00:00Z",
  },
  // Dr. Sarah Johnson (emp-102) schedules
  {
    id: "sch-2",
    employeeId: "emp-102",
    employeeName: "Dr. Sarah Johnson",
    departmentId: "dep-2",
    workDate: "2025-12-02",
    startTime: "13:00",
    endTime: "18:00",
    shift: "AFTERNOON",
    status: "BOOKED",
    createdAt: "2025-11-25T00:00:00Z",
    updatedAt: "2025-11-25T00:00:00Z",
  },
  // Dr. Emily Carter (emp-103) schedules
  {
    id: "sch-3",
    employeeId: "emp-103",
    employeeName: "Dr. Emily Carter",
    departmentId: "dep-3",
    workDate: "2025-12-03",
    startTime: "18:00",
    endTime: "23:00",
    shift: "EVENING",
    status: "AVAILABLE",
    createdAt: "2025-11-25T00:00:00Z",
    updatedAt: "2025-11-25T00:00:00Z",
  },
];

const generateDynamicSchedules = () => {
  const schedules: any[] = [...staticSchedules];
  const doctors = mockEmployees.filter(emp => emp.role === 'DOCTOR');
  const today = new Date(); // Use the actual current date

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const workDate = date.toISOString().split('T')[0];

    doctors.forEach(doctor => {
      // Morning Shift
      schedules.push({
        id: `sch-${doctor.id}-morning-${i}`,
        employeeId: doctor.id,
        employeeName: doctor.fullName,
        departmentId: doctor.departmentId,
        workDate: workDate,
        startTime: "08:00",
        endTime: "12:00",
        shift: "MORNING",
        status: "AVAILABLE",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      // Afternoon Shift
      schedules.push({
        id: `sch-${doctor.id}-afternoon-${i}`,
        employeeId: doctor.id,
        employeeName: doctor.fullName,
        departmentId: doctor.departmentId,
        workDate: workDate,
        startTime: "13:00",
        endTime: "17:00",
        shift: "AFTERNOON",
        status: "AVAILABLE",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });
  }
  return schedules;
};

export const mockSchedules = generateDynamicSchedules();


// Use consistent patient IDs (p001, p002, etc.) matching patient.service.ts
export const mockInvoices: Invoice[] = [
  {
    id: "INV-001",
    invoiceNumber: "INV-001",
    patientId: "p001",
    patientName: "Nguyen Van An",
    appointmentId: "apt-001",
    status: "UNPAID",
    subtotal: 500000,
    discount: 0,
    tax: 0,
    totalAmount: 500000,
    paidAmount: 0,
    balance: 500000,
    invoiceDate: "2025-11-20T10:00:00Z",
    dueDate: "2025-12-01T00:00:00Z",
    createdAt: "2025-11-20T10:00:00Z",
    items: [
      {
        id: "ITEM-1",
        invoiceId: "INV-001",
        type: "CONSULTATION",
        description: "General Consultation",
        quantity: 1,
        unitPrice: 200000,
        amount: 200000,
      },
      {
        id: "ITEM-2",
        invoiceId: "INV-001",
        type: "MEDICINE",
        description: "Paracetamol",
        quantity: 2,
        unitPrice: 50000,
        amount: 100000,
      },
      {
        id: "ITEM-3",
        invoiceId: "INV-001",
        type: "TEST",
        description: "Blood Test",
        quantity: 1,
        unitPrice: 200000,
        amount: 200000,
      },
    ],
    payments: [],
  },
  {
    id: "INV-002",
    invoiceNumber: "INV-002",
    patientId: "p002",
    patientName: "Tran Thi Mai",
    appointmentId: "apt-002",
    status: "PARTIALLY_PAID",
    subtotal: 1500000,
    discount: 0,
    tax: 0,
    totalAmount: 1500000,
    paidAmount: 500000,
    balance: 1000000,
    invoiceDate: "2025-11-25T14:00:00Z",
    dueDate: "2025-12-05T00:00:00Z",
    createdAt: "2025-11-25T14:00:00Z",
    items: [
      {
        id: "ITEM-4",
        invoiceId: "INV-002",
        type: "CONSULTATION",
        description: "Specialist Consultation",
        quantity: 1,
        unitPrice: 500000,
        amount: 500000,
      },
      {
        id: "ITEM-5",
        invoiceId: "INV-002",
        type: "TEST",
        description: "MRI Scan",
        quantity: 1,
        unitPrice: 1000000,
        amount: 1000000,
      },
    ],
    payments: [
      {
        id: "PAY-1",
        invoiceId: "INV-002",
        amount: 500000,
        method: "CASH",
        status: "COMPLETED",
        paymentDate: "2025-11-25T14:30:00Z",
        notes: "Deposit",
      },
    ],
  },
  {
    id: "INV-003",
    invoiceNumber: "INV-003",
    patientId: "p003",
    patientName: "Le Hoang Phuc",
    appointmentId: "apt-003",
    status: "PAID",
    subtotal: 750000,
    discount: 50000,
    tax: 0,
    totalAmount: 700000,
    paidAmount: 700000,
    balance: 0,
    invoiceDate: "2025-12-01T09:00:00Z",
    dueDate: "2025-12-15T00:00:00Z",
    createdAt: "2025-12-01T09:00:00Z",
    items: [
      {
        id: "ITEM-6",
        invoiceId: "INV-003",
        type: "CONSULTATION",
        description: "Diabetes Checkup",
        quantity: 1,
        unitPrice: 350000,
        amount: 350000,
      },
      {
        id: "ITEM-7",
        invoiceId: "INV-003",
        type: "MEDICINE",
        description: "Metformin 500mg",
        quantity: 60,
        unitPrice: 5000,
        amount: 300000,
      },
      {
        id: "ITEM-8",
        invoiceId: "INV-003",
        type: "TEST",
        description: "HbA1c Test",
        quantity: 1,
        unitPrice: 100000,
        amount: 100000,
      },
    ],
    payments: [
      {
        id: "PAY-2",
        invoiceId: "INV-003",
        amount: 700000,
        method: "CARD",
        status: "COMPLETED",
        paymentDate: "2025-12-01T09:30:00Z",
        notes: "Full payment",
      },
    ],
  },
];
