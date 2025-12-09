import { LoginRequest, LoginResponse } from "./auth.service";

export type SignUpRequest = {
  username: string;
  email: string;
  password: string;
};

// Mock user database - Test accounts for each role
export const MOCK_USERS = [
  {
    username: "admin",
    email: "admin@hms.com",
    password: "admin123",
    role: "ADMIN",
    fullName: "Admin User",
    employeeId: "emp-admin-001",
    accessToken: "mock-access-token-admin",
    refreshToken: "mock-refresh-token-admin",
  },
  {
    username: "doctor",
    email: "doctor@hms.com",
    password: "doctor123",
    role: "DOCTOR",
    fullName: "Dr. John Smith",
    employeeId: "emp-101",
    department: "Cardiology",
    accessToken: "mock-access-token-doctor",
    refreshToken: "mock-refresh-token-doctor",
  },
  {
    username: "nurse",
    email: "nurse@hms.com",
    password: "nurse123",
    role: "NURSE",
    fullName: "Nurse Mary Johnson",
    employeeId: "emp-nurse-001",
    department: "General Ward",
    accessToken: "mock-access-token-nurse",
    refreshToken: "mock-refresh-token-nurse",
  },
  {
    username: "receptionist",
    email: "receptionist@hms.com",
    password: "receptionist123",
    role: "RECEPTIONIST",
    fullName: "Sarah Williams",
    employeeId: "emp-receptionist-001",
    accessToken: "mock-access-token-receptionist",
    refreshToken: "mock-refresh-token-receptionist",
  },
  {
    username: "patient",
    email: "patient@hms.com",
    password: "patient123",
    role: "PATIENT",
    fullName: "Patient Nguyen Van An",
    patientId: "p001",
    accessToken: "mock-access-token-patient",
    refreshToken: "mock-refresh-token-patient",
  },
  {
    username: "newdoctor",
    email: "newdoctor@hms.com",
    password: "password123",
    role: "DOCTOR",
    fullName: "Dr. New Test",
    employeeId: "emp-new-doctor-001",
    department: "General",
    accessToken: "mock-access-token-newdoctor",
    refreshToken: "mock-refresh-token-newdoctor",
  },
];

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockAuthService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    // Simulate network delay
    await delay(800);

    // Find user by email
    const user = MOCK_USERS.find((u) => u.email === credentials.email);

    // Check if user exists and password matches
    if (!user || user.password !== credentials.password) {
      throw new Error("Invalid email or password");
    }

    // Return successful login response
    return {
      accessToken: user.accessToken,
      refreshToken: user.refreshToken,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId,
      patientId: user.patientId,
    };
  },

  logout: async (refreshToken: string): Promise<void> => {
    // Simulate network delay
    await delay(500);

    // In a real implementation, you would invalidate the token on the server
    console.log("Logged out with refresh token:", refreshToken);
  },

  register: async (credentials: LoginRequest): Promise<LoginResponse> => {
    // Simulate network delay
    await delay(1000);

    // Check if user already exists
    const existingUser = MOCK_USERS.find((u) => u.email === credentials.email);
    if (existingUser) {
      throw new Error("User already exists");
    }

    // Return successful registration response
    return {
      accessToken: "mock-access-token-new-user",
      refreshToken: "mock-refresh-token-new-user",
      email: credentials.email,
      role: "PATIENT", // Default role for new users
    };
  },

  signup: async (credentials: SignUpRequest): Promise<LoginResponse> => {
    // Simulate network delay
    await delay(1000);

    // Check if user already exists by email
    const existingUserByEmail = MOCK_USERS.find(
      (u) => u.email === credentials.email,
    );
    if (existingUserByEmail) {
      throw new Error("Email already exists");
    }

    // Check if username already exists
    const existingUserByUsername = MOCK_USERS.find(
      (u) => u.username === credentials.username,
    );
    if (existingUserByUsername) {
      throw new Error("Username already exists");
    }

    // Create new user object
    const newUser = {
      username: credentials.username,
      email: credentials.email,
      password: credentials.password,
      role: "PATIENT", // Default role for new users
      fullName: credentials.username,
      patientId: `p-${Date.now()}`,
      accessToken: `mock-access-token-${credentials.username}`,
      refreshToken: `mock-refresh-token-${credentials.username}`,
    };

    // Add to mock database
    MOCK_USERS.push(newUser as any);

    // Return successful signup response
    return {
      accessToken: newUser.accessToken,
      refreshToken: newUser.refreshToken,
      email: newUser.email,
      role: newUser.role,
    };
  },
};
