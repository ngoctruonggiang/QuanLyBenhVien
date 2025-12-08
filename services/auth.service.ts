import axiosInstance from "@/config/axios";
import { PaginatedResponse } from "@/interfaces/pagination";

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  email: string;
  role: string;
  employeeId?: string;
  patientId?: string;
};

export interface Account {
  id: string;
  email: string;
  role: string;
}

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await axiosInstance.post<LoginRequest, LoginResponse>(
      "/auth-service/auth/login",
      credentials
    );
    return response;
  },

  logout: async (refreshToken: string): Promise<void> => {
    await axiosInstance.post("/auth-service/auth/logout", { refreshToken });
  },

  register: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await axiosInstance.post<LoginRequest, LoginResponse>(
      "/auth-service/auth/register",
      credentials
    );
    return response;
  },

  getAccounts: async (
    search?: string
  ): Promise<PaginatedResponse<Account>> => {
    const response = await axiosInstance.get<
      never,
      PaginatedResponse<Account>
    >("/auth-service/auth/accounts", {
      params: { search },
    });
    return response;
  },
};
