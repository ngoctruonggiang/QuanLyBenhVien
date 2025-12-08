import { useEffect, useState } from "react";

export type UserRole =
  | "ADMIN"
  | "DOCTOR"
  | "PATIENT"
  | "RECEPTIONIST"
  | "NURSE"
  | "UNKNOWN";

type AuthUser = {
  email: string | null;
  role: UserRole;
  employeeId?: string; // Added employeeId
};

function normalizeRole(role: string | null): UserRole {
  switch (role) {
    case "ADMIN":
    case "DOCTOR":
    case "PATIENT":
    case "RECEPTIONIST":
    case "NURSE":
      return role;
    default:
      return "UNKNOWN";
  }
}

function readAuthFromStorage(): AuthUser | null {
  if (typeof window === "undefined") return null;

  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) return null;

  const role = normalizeRole(localStorage.getItem("userRole"));
  const email = localStorage.getItem("userEmail");
  const employeeId = localStorage.getItem("userEmployeeId"); // Retrieve employeeId

  return { email, role, employeeId };
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(() => readAuthFromStorage());
  const [isLoading, setIsLoading] = useState(false);

  return {
    user,
    isAuthenticated: Boolean(user?.role && user.role !== "UNKNOWN"),
    isLoading,
  };
}
