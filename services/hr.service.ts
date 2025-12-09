import {
  Department,
  DepartmentRequest,
  Employee,
  EmployeeRequest,
  EmployeeSchedule,
  ScheduleRequest,
} from "@/interfaces/hr";
import { mockDepartments, mockEmployees, mockSchedules } from "@/lib/mocks";
import { USE_MOCK } from "@/lib/mocks/toggle";

const BASE_URL = "/api/hr";
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Local mutable copies for mocks
const LOCAL_STORAGE_DEPARTMENTS_KEY = "mockDeptData";

const loadDepartmentsFromLocalStorage = (): Department[] => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(LOCAL_STORAGE_DEPARTMENTS_KEY);
    if (stored) {
      try {
        return JSON.parse(stored) as Department[];
      } catch (e) {
        console.error("Error parsing stored departments from localStorage", e);
      }
    }
  }
  return [...mockDepartments];
};

const saveDepartmentsToLocalStorage = (departments: Department[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(
      LOCAL_STORAGE_DEPARTMENTS_KEY,
      JSON.stringify(departments),
    );
  }
};

const deptData: Department[] = loadDepartmentsFromLocalStorage();
const employeeData: Employee[] = [...mockEmployees];
const scheduleData: (EmployeeSchedule & {
  departmentId?: string;
  shift?: string;
})[] = [...mockSchedules];

export const hrService = {
  // --- Departments ---
  getDepartments: async (params?: {
    page?: number;
    size?: number;
    sort?: string;
    status?: string;
    search?: string;
  }) => {
    await delay(500);
    let filtered = [...deptData];
    if (params?.search) {
      const lowerSearch = params.search.toLowerCase();
      filtered = filtered.filter((d) =>
        d.name.toLowerCase().includes(lowerSearch),
      );
    }
    if (params?.status) {
      filtered = filtered.filter((d) => d.status === params.status);
    }

    // Sorting logic
    if (params?.sort) {
      const [field, direction] = params.sort.split(',');
      filtered.sort((a, b) => {
        const valA = a[field as keyof Department];
        const valB = b[field as keyof Department];
        
        if (valA === undefined || valB === undefined) return 0;

        if (direction === 'asc') {
          return valA < valB ? -1 : 1;
        } else {
          return valA > valB ? -1 : 1;
        }
      });
    }

    const page = params?.page || 0;
    const size = params?.size || 10;
    const start = page * size;
    const end = start + size;
    
    return {
      content: filtered.slice(start, end),
      totalPages: Math.ceil(filtered.length / size),
      totalElements: filtered.length,
      size: size,
      number: page,
    };
  },

  getDepartment: async (id: string) => {
    await delay(300);
    return deptData.find((d) => d.id === id);
  },

  createDepartment: async (data: DepartmentRequest) => {
    await delay(500);
    const newDept: Department = {
      id: Math.random().toString(36).substr(2, 9),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    deptData.push(newDept);
    saveDepartmentsToLocalStorage(deptData); // Save to localStorage
    return newDept;
  },

  updateDepartment: async (id: string, data: Partial<DepartmentRequest>) => {
    await delay(500);
    const index = deptData.findIndex((d) => d.id === id);
    if (index !== -1) {
      const updatedData = { ...data };
      
      // If headDoctorId is being updated, also update headDoctorName
      if (data.headDoctorId) {
        const headDoctor = employeeData.find(e => e.id === data.headDoctorId);
        updatedData.headDoctorName = headDoctor?.fullName;
      } else if (data.headDoctorId === undefined || data.headDoctorId === null) {
        // Handle case where head doctor is removed
        updatedData.headDoctorName = undefined;
      }

      deptData[index] = { ...deptData[index], ...updatedData };
      saveDepartmentsToLocalStorage(deptData); // Save to localStorage
      return deptData[index];
    }
    throw new Error("Department not found");
  },

  deleteDepartment: async (id: string) => {
    await delay(500);
    const index = deptData.findIndex((d) => d.id === id);
    if (index !== -1) {
      deptData.splice(index, 1);
      saveDepartmentsToLocalStorage(deptData); // Save to localStorage
    }
  },

  // --- Employees ---
  getEmployees: async (params?: {
    page?: number;
    size?: number;
    sort?: string;
    departmentId?: string;
    role?: string;
    status?: string;
    search?: string;
  }) => {
    await delay(500);
    let filtered = [...employeeData];
    if (params?.search) {
      const lowerSearch = params.search.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.fullName.toLowerCase().includes(lowerSearch) ||
          e.email.toLowerCase().includes(lowerSearch),
      );
    }
    if (params?.departmentId) {
      filtered = filtered.filter((e) => e.departmentId === params.departmentId);
    }
    if (params?.role) {
      filtered = filtered.filter((e) => e.role === params.role);
    }
    if (params?.status) {
      filtered = filtered.filter((e) => e.status === params.status);
    }

    return {
      content: filtered,
      totalPages: 1,
      totalElements: filtered.length,
      size: params?.size || 10,
      number: params?.page || 0,
    };
  },

  getDoctors: async (params?: {
    departmentId?: string;
    specialization?: string;
    status?: string;
    page?: number;
    size?: number;
  }) => {
    await delay(500);
    let filtered = employeeData.filter((e) => e.role === "DOCTOR");
    if (params?.departmentId) {
      filtered = filtered.filter((e) => e.departmentId === params.departmentId);
    }
    return {
      content: filtered,
      totalPages: 1,
      totalElements: filtered.length,
    };
  },

  getEmployee: async (id: string) => {
    await delay(300);
    return employeeData.find((e) => e.id === id);
  },

  createEmployee: async (data: EmployeeRequest) => {
    await delay(500);
    const newEmp: Employee = {
      id: Math.random().toString(36).substr(2, 9),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    employeeData.push(newEmp);
    return newEmp;
  },

  updateEmployee: async (id: string, data: Partial<EmployeeRequest>) => {
    await delay(500);
    const index = employeeData.findIndex((e) => e.id === id);
    if (index !== -1) {
      employeeData[index] = { ...employeeData[index], ...data };
      return employeeData[index];
    }
    throw new Error("Employee not found");
  },

  deleteEmployee: async (id: string) => {
    await delay(500);
    const index = employeeData.findIndex((e) => e.id === id);
    if (index !== -1) {
      employeeData.splice(index, 1);
    }
  },

  // --- Schedules ---
  getDoctorSchedules: async (params: {
    departmentId?: string;
    doctorId?: string;
    startDate: string;
    endDate: string;
    status?: string;
    page?: number;
    size?: number;
  }) => {
    await delay(500);
    let filtered = [...scheduleData];
    if (params.startDate) {
      filtered = filtered.filter((s) => s.workDate >= params.startDate);
    }
    if (params.endDate) {
      filtered = filtered.filter((s) => s.workDate <= params.endDate);
    }
    if (params.departmentId) {
      filtered = filtered.filter(
        (s) => (s as any).departmentId === params.departmentId,
      );
    }
    if (params.doctorId) {
      filtered = filtered.filter((s) => s.employeeId === params.doctorId);
    }
    if (params.status) {
      filtered = filtered.filter((s) => s.status === params.status);
    }

    return {
      content: filtered,
      totalPages: 1,
      totalElements: filtered.length,
      size: params.size || 10,
      number: params.page || 0,
    };
  },

  getMySchedules: async (params: {
    startDate: string;
    endDate: string;
    status?: string;
    doctorId?: string;
  }) => {
    await delay(500);
    // Mocking "me" as employee 101 (override with doctorId if provided)
    const myId = params.doctorId || "emp-101";
    let filtered = scheduleData.filter((s) => s.employeeId === myId);
    if (params.startDate) {
      filtered = filtered.filter((s) => s.workDate >= params.startDate);
    }
    if (params.endDate) {
      filtered = filtered.filter((s) => s.workDate <= params.endDate);
    }
    return {
      content: filtered,
    };
  },

  createSchedule: async (data: ScheduleRequest) => {
    await delay(500);
    const employee = employeeData.find((e) => e.id === data.employeeId);
    const newSchedule: EmployeeSchedule & { departmentId?: string } = {
      id: Math.random().toString(36).substr(2, 9),
      ...data,
      employeeName: employee?.fullName,
      departmentId: employee?.departmentId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    scheduleData.push(newSchedule);
    return newSchedule;
  },

  // Note: Edit/Delete schedule endpoints were not explicitly detailed in the snippet I read,
  // but usually exist. I'll add them if needed later or assume standard REST.
  // Assuming standard REST for now based on pattern:
  updateSchedule: async (id: string, data: Partial<ScheduleRequest>) => {
    await delay(500);
    const index = scheduleData.findIndex((s) => s.id === id);
    if (index !== -1) {
      scheduleData[index] = { ...scheduleData[index], ...data };
      return scheduleData[index];
    }
    throw new Error("Schedule not found");
  },

  deleteSchedule: async (id: string) => {
    await delay(500);
    const index = scheduleData.findIndex((s) => s.id === id);
    if (index !== -1) {
      scheduleData.splice(index, 1);
    }
  },
};
