import axiosInstance from "@/config/axios";

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  email: string;
  role: string;
};

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
};
