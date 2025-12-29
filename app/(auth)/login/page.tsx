"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      toast.success("Đăng nhập thành công!");
      // Redirect based on role will be handled by AuthContext
    } catch (error: any) {
      const message = error.response?.data?.message || "Email hoặc mật khẩu không đúng";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Mobile Logo */}
      <div className="lg:hidden text-center mb-8">
        <div className="inline-flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[hsl(173,58%,35%)] to-[hsl(173,58%,28%)] rounded-xl flex items-center justify-center text-white font-bold">
            HMS
          </div>
          <div>
            <h1 className="text-xl font-semibold text-[hsl(var(--foreground))]">CarePoint</h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Hospital Management</p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="text-center lg:text-left">
        <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">Chào mừng trở lại!</h2>
        <p className="text-[hsl(var(--muted-foreground))] mt-2">
          Đăng nhập để tiếp tục vào hệ thống
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div className="space-y-2">
          <label className="text-label">Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--muted-foreground))]" />
            <input
              type="email"
              placeholder="your@email.com"
              className="input-base pl-12"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-label">Mật khẩu</label>
            <Link
              href="/forgot-password"
              className="text-xs text-[hsl(var(--primary))] hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--muted-foreground))]" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="input-base pl-12 pr-12"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Remember Me */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="remember"
            className="w-4 h-4 rounded border-[hsl(var(--border))] text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))]"
          />
          <label htmlFor="remember" className="text-sm text-[hsl(var(--muted-foreground))]">
            Ghi nhớ đăng nhập
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full h-12 text-base"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Đăng nhập
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[hsl(var(--border))]" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-4 bg-[hsl(var(--background))] text-[hsl(var(--muted-foreground))]">
            Hoặc
          </span>
        </div>
      </div>

      {/* Register Link */}
      <p className="text-center text-sm text-[hsl(var(--muted-foreground))]">
        Chưa có tài khoản?{" "}
        <Link
          href="/register"
          className="text-[hsl(var(--primary))] font-medium hover:underline"
        >
          Đăng ký ngay
        </Link>
      </p>

      {/* Demo Accounts */}
      <div className="pt-4 border-t border-[hsl(var(--border))]">
        <p className="text-xs text-[hsl(var(--muted-foreground))] text-center mb-3">
          Tài khoản demo:
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            { role: "Admin", email: "admin@hms.com" },
            { role: "Doctor", email: "doctor1@hms.com" },
            { role: "Nurse", email: "nurse1@hms.com" },
            { role: "Reception", email: "reception1@hms.com" },
          ].map((acc) => (
            <button
              key={acc.role}
              type="button"
              onClick={() => setFormData({ email: acc.email, password: "Admin123!@" })}
              className="px-3 py-2 rounded-lg border border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-light))] transition-colors text-left"
            >
              <span className="font-medium text-[hsl(var(--foreground))]">{acc.role}</span>
              <br />
              <span className="text-[hsl(var(--muted-foreground))]">{acc.email}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
