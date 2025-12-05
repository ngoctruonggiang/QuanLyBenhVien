import axiosInstance from "@/config/axios";
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
let deptData: Department[] = [...mockDepartments];
let employeeData: Employee[] = [...mockEmployees];
let scheduleData: (EmployeeSchedule & { departmentId?: string; shift?: string })[] = [...mockSchedules];

export const hrService = {
  // --- Departments ---
  getDepartments: async (params?: {
    page?: number;
    size?: number;
    sort?: string;
    status?: string;
    search?: string;
  }) => {
    // const response = await axiosInstance.get(`${BASE_URL}/departments`, {
    //   params,
    // });
    // return response.data.data;

    if (!USE_MOCK) {
      const response = await axiosInstance.get(`${BASE_URL}/departments`, { params });
      return response.data.data;
    }

    await delay(500);
    let filtered = [...deptData];
    if (params?.search) {
      const lowerSearch = params.search.toLowerCase();
      filtered = filtered.filter((d) =>
        d.name.toLowerCase().includes(lowerSearch)
      );
    }
    if (params?.status) {
      filtered = filtered.filter((d) => d.status === params.status);
    }

    return {
      content: filtered,
      totalPages: 1,
      totalElements: filtered.length,
      size: params?.size || 10,
      number: params?.page || 0,
    };
  },

  getDepartment: async (id: string) => {
    // const response = await axiosInstance.get(`${BASE_URL}/departments/${id}`);
    // return response.data.data;

    await delay(300);
    if (!USE_MOCK) {
      const response = await axiosInstance.get(`${BASE_URL}/departments/${id}`);
      return response.data.data;
    }

    await delay(300);
    return deptData.find((d) => d.id === id);
  },

  createDepartment: async (data: DepartmentRequest) => {
    // const response = await axiosInstance.post(`${BASE_URL}/departments`, data);
    // return response.data.data;

    if (!USE_MOCK) {
      const response = await axiosInstance.post(`${BASE_URL}/departments`, data);
      return response.data.data;
    }

    await delay(500);
    const newDept: Department = {
      id: Math.random().toString(36).substr(2, 9),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    deptData.push(newDept);
    return newDept;
  },

  updateDepartment: async (id: string, data: Partial<DepartmentRequest>) => {
    // const response = await axiosInstance.patch(
    //   `${BASE_URL}/departments/${id}`,
    //   data
    // );
    // return response.data.data;

    if (!USE_MOCK) {
      const response = await axiosInstance.patch(`${BASE_URL}/departments/${id}`, data);
      return response.data.data;
    }

    await delay(500);
    const index = deptData.findIndex((d) => d.id === id);
    if (index !== -1) {
      deptData[index] = { ...deptData[index], ...data };
      return deptData[index];
    }
    throw new Error("Department not found");
  },

  deleteDepartment: async (id: string) => {
    // await axiosInstance.delete(`${BASE_URL}/departments/${id}`);

    if (!USE_MOCK) {
      await axiosInstance.delete(`${BASE_URL}/departments/${id}`);
      return;
    }

    await delay(500);
    const index = deptData.findIndex((d) => d.id === id);
    if (index !== -1) {
      deptData.splice(index, 1);
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
    // const response = await axiosInstance.get(`${BASE_URL}/employees`, {
    //   params,
    // });
    // return response.data.data;

    if (!USE_MOCK) {
      const response = await axiosInstance.get(`${BASE_URL}/employees`, { params });
      return response.data.data;
    }

    await delay(500);
    let filtered = [...employeeData];
    if (params?.search) {
      const lowerSearch = params.search.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.fullName.toLowerCase().includes(lowerSearch) ||
          e.email.toLowerCase().includes(lowerSearch)
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
    // const response = await axiosInstance.get(`${BASE_URL}/doctors`, { params });
    // return response.data.data;

    if (!USE_MOCK) {
      const response = await axiosInstance.get(`${BASE_URL}/doctors`, { params });
      return response.data.data;
    }

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
    // const response = await axiosInstance.get(`${BASE_URL}/employees/${id}`);
    // return response.data.data;

    if (!USE_MOCK) {
      const response = await axiosInstance.get(`${BASE_URL}/employees/${id}`);
      return response.data.data;
    }

    await delay(300);
    return employeeData.find((e) => e.id === id);
  },

  createEmployee: async (data: EmployeeRequest) => {
    // const response = await axiosInstance.post(`${BASE_URL}/employees`, data);
    // return response.data.data;

    if (!USE_MOCK) {
      const response = await axiosInstance.post(`${BASE_URL}/employees`, data);
      return response.data.data;
    }

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
    // const response = await axiosInstance.patch(
    //   `${BASE_URL}/employees/${id}`,
    //   data
    // );
    // return response.data.data;

    if (!USE_MOCK) {
      const response = await axiosInstance.patch(`${BASE_URL}/employees/${id}`, data);
      return response.data.data;
    }

    await delay(500);
    const index = employeeData.findIndex((e) => e.id === id);
    if (index !== -1) {
      employeeData[index] = { ...employeeData[index], ...data };
      return employeeData[index];
    }
    throw new Error("Employee not found");
  },

  deleteEmployee: async (id: string) => {
    // const response = await axiosInstance.delete(`${BASE_URL}/employees/${id}`);
    // return response.data.data; // Returns deleted info

    if (!USE_MOCK) {
      await axiosInstance.delete(`${BASE_URL}/employees/${id}`);
      return;
    }

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
    // const response = await axiosInstance.get(`${BASE_URL}/schedules/doctors`, {
    //   params,
    // });
    // return response.data.data;

    if (!USE_MOCK) {
      const response = await axiosInstance.get(`${BASE_URL}/schedules/doctors`, { params });
      return response.data.data;
    }

    await delay(500);
    let filtered = [...scheduleData];
    if (params.startDate) {
      filtered = filtered.filter((s) => s.workDate >= params.startDate);
    }
    if (params.endDate) {
      filtered = filtered.filter((s) => s.workDate <= params.endDate);
    }
    if (params.departmentId) {
      filtered = filtered.filter((s) => (s as any).departmentId === params.departmentId);
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
    // const response = await axiosInstance.get(`${BASE_URL}/schedules/me`, {
    //   params,
    // });
    // return response.data.data;

    if (!USE_MOCK) {
      const response = await axiosInstance.get(`${BASE_URL}/schedules/me`, { params });
      return response.data.data;
    }

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
    // const response = await axiosInstance.post(`${BASE_URL}/schedules`, data);
    // return response.data.data;

    if (!USE_MOCK) {
      const response = await axiosInstance.post(`${BASE_URL}/schedules`, data);
      return response.data.data;
    }

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
    // const response = await axiosInstance.patch(
    //   `${BASE_URL}/schedules/${id}`,
    //   data
    // );
    // return response.data.data;

    if (!USE_MOCK) {
      const response = await axiosInstance.patch(`${BASE_URL}/schedules/${id}`, data);
      return response.data.data;
    }

    await delay(500);
    const index = scheduleData.findIndex((s) => s.id === id);
    if (index !== -1) {
      scheduleData[index] = { ...scheduleData[index], ...data };
      return scheduleData[index];
    }
    throw new Error("Schedule not found");
  },

  deleteSchedule: async (id: string) => {
    // await axiosInstance.delete(`${BASE_URL}/schedules/${id}`);

    if (!USE_MOCK) {
      await axiosInstance.delete(`${BASE_URL}/schedules/${id}`);
      return;
    }

    await delay(500);
    const index = scheduleData.findIndex((s) => s.id === id);
    if (index !== -1) {
      scheduleData.splice(index, 1);
    }
  },
};
