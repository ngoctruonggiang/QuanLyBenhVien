"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const role = user?.role;

  useEffect(() => {
    // Redirect based on role - each portal has its own profile page with sidebar
    if (!role) {
      router.replace("/login");
    } else if (role === "PATIENT") {
      router.replace("/patient/profile");
    } else if (role === "DOCTOR") {
      router.replace("/doctor/profile");
    } else if (role === "ADMIN") {
      router.replace("/admin/profile");
    }
  }, [role, router]);

  // While redirecting, show loading
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner size="lg" variant="muted" />
    </div>
  );
}
