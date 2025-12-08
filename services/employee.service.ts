import { Employee } from "@/interfaces/employee";
import { USE_MOCK } from "@/lib/mocks/toggle";

// Mock Data
let mockEmployees: Employee[] = [
  {
    id: 1,
    avatar: null,
    fullName: "Nguyen Van A",
    dateOfBirth: "1990-01-01",
    gender: "Male",
    department: "Cardiology",
    position: "Doctor",
    status: "Active",
    idCard: "123456789",
    phoneNumber: "0901234567",
    email: "nguyenvana@example.com",
    address: "Hanoi",
    baseSalary: 10000000,
    startingDay: "2020-01-01",
  },
  {
    id: 2,
    avatar: null,
    fullName: "Tran Thi B",
    dateOfBirth: "1995-05-05",
    gender: "Female",
    department: "Neurology",
    position: "Nurse",
    status: "Active",
    idCard: "987654321",
    phoneNumber: "0909876543",
    email: "tranthib@example.com",
    address: "Hanoi",
    baseSalary: 8000000,
    startingDay: "2021-06-15",
  },
];

const mockDepartments = [
  { id: "1", name: "Cardiology" },
  { id: "2", name: "Neurology" },
  { id: "3", name: "Pediatrics" },
  { id: "4", name: "Orthopedics" },
];

const mockPositions = [
  "Doctor",
  "Nurse",
  "Admin",
  "Receptionist",
  "Pharmacist",
];

// Helper to simulate delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getEmployees = async (params?: any) => {
  if (!USE_MOCK) {
    throw new Error("Employee API not implemented");
  }
  await delay(500);
  let filtered = [...mockEmployees];

  if (params?.search) {
    const lowerSearch = params.search.toLowerCase();
    filtered = filtered.filter(
      (e) =>
        e.fullName.toLowerCase().includes(lowerSearch) ||
        e.email.toLowerCase().includes(lowerSearch)
    );
  }

  // Pagination logic if needed, for now return all
  return {
    data: filtered,
    total: filtered.length,
    page: params?.page || 1,
    limit: params?.limit || 10,
  };
};

export const getDepartments = () => {
  if (!USE_MOCK) {
    throw new Error("Employee API not implemented");
  }
  // AddEmployeeModal expects this to be synchronous or returning data directly?
  // If it was async, the component would need await.
  // Based on component code: const departments = getDepartments();
  // It seems it expects an array.
  return mockDepartments;
};

export const getPositions = () => {
  if (!USE_MOCK) {
    throw new Error("Employee API not implemented");
  }
  return mockPositions;
};

export const createEmployee = async (data: Omit<Employee, "id">) => {
  if (!USE_MOCK) {
    throw new Error("Employee API not implemented");
  }
  await delay(500);
  const newEmployee: Employee = {
    ...data,
    id: Math.floor(Math.random() * 10000),
  };
  mockEmployees.push(newEmployee);
  return newEmployee;
};

export const updateEmployee = async (id: number, data: Partial<Employee>) => {
  if (!USE_MOCK) {
    throw new Error("Employee API not implemented");
  }
  await delay(500);
  const index = mockEmployees.findIndex((e) => e.id === id);
  if (index !== -1) {
    mockEmployees[index] = { ...mockEmployees[index], ...data };
    return mockEmployees[index];
  }
  throw new Error("Employee not found");
};

export const deleteEmployee = async (id: number) => {
  if (!USE_MOCK) {
    throw new Error("Employee API not implemented");
  }
  await delay(500);
  mockEmployees = mockEmployees.filter((e) => e.id !== id);
  return true;
};

// --- Scheduling ---

interface ScheduleItem {
  day: string; // "DD/MM/YYYY"
  shift: string; // "Morning", "Afternoon", etc.
  employees: Employee[];
}

const mockSchedule: ScheduleItem[] = [];

export const getAllEmployees = async () => {
  if (!USE_MOCK) {
    throw new Error("Employee API not implemented");
  }
  await delay(500);
  return mockEmployees;
};

export const getEmployeeSchedule = async () => {
  if (!USE_MOCK) {
    throw new Error("Employee API not implemented");
  }
  await delay(500);
  return mockSchedule;
};

export const addEmployeeToShift = async (data: {
  day: string;
  shift: string;
  employeeId: number;
}) => {
  if (!USE_MOCK) {
    throw new Error("Employee API not implemented");
  }
  await delay(300);
  const employee = mockEmployees.find((e) => e.id === data.employeeId);
  if (!employee) throw new Error("Employee not found");

  let scheduleItem = mockSchedule.find(
    (s) => s.day === data.day && s.shift === data.shift
  );

  if (!scheduleItem) {
    scheduleItem = {
      day: data.day,
      shift: data.shift,
      employees: [],
    };
    mockSchedule.push(scheduleItem);
  }

  if (!scheduleItem.employees.find((e) => e.id === employee.id)) {
    scheduleItem.employees.push(employee);
  }

  return scheduleItem;
};

export const removeEmployeeFromShift = async (data: {
  day: string;
  shift: string;
  employeeId: number;
}) => {
  if (!USE_MOCK) {
    throw new Error("Employee API not implemented");
  }
  await delay(300);
  const scheduleItem = mockSchedule.find(
    (s) => s.day === data.day && s.shift === data.shift
  );

  if (scheduleItem) {
    scheduleItem.employees = scheduleItem.employees.filter(
      (e) => e.id !== data.employeeId
    );
  }
  return true;
};

// Attendance Types & Mock Data
export type AttendanceStatus = "Present" | "Absent" | "Leave";

interface EmployeeAttendance {
  id: number;
  name: string;
  department: string;
  position: string;
  attendance: Record<string, AttendanceStatus>;
  sum: number;
}

const mockAttendanceData: EmployeeAttendance[] = mockEmployees.map((emp) => ({
  id: emp.id,
  name: emp.fullName,
  department: emp.department,
  position: emp.position,
  attendance: {},
  sum: 0,
}));

export const getEmployeeAttendance = async (): Promise<
  EmployeeAttendance[]
> => {
  if (!USE_MOCK) {
    throw new Error("Attendance API not implemented");
  }
  await delay(200);
  return mockAttendanceData;
};

export const updateAttendance = async (
  employeeId: number,
  date: string,
  status: AttendanceStatus | null
): Promise<boolean> => {
  if (!USE_MOCK) {
    throw new Error("Attendance API not implemented");
  }
  await delay(200);
  const employee = mockAttendanceData.find((e) => e.id === employeeId);
  if (employee) {
    if (status === null) {
      delete employee.attendance[date];
    } else {
      employee.attendance[date] = status;
    }
    // Recalculate sum
    employee.sum = Object.values(employee.attendance).filter(
      (s) => s === "Present"
    ).length;
  }
  return true;
};
