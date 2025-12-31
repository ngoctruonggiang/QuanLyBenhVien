"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2, CheckCircle } from "lucide-react";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const passwordRequirements = [
    { met: formData.password.length >= 8, text: "Ít nhất 8 ký tự" },
    { met: /[A-Z]/.test(formData.password), text: "Có chữ hoa" },
    { met: /[a-z]/.test(formData.password), text: "Có chữ thường" },
    { met: /[0-9]/.test(formData.password), text: "Có số" },
    { met: /[!@#$%^&*]/.test(formData.password), text: "Có ký tự đặc biệt" },
  ];

  const isPasswordValid = passwordRequirements.every((req) => req.met);
  const doPasswordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isPasswordValid) {
      toast.error("Mật khẩu chưa đáp ứng yêu cầu");
      return;
    }
    
    if (!doPasswordsMatch) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Create account
      const accountResponse = await authService.register({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
      });
      
      // Step 2: Auto-create patient record linked to this account
      try {
        const { createPatient } = await import("@/services/patient.service");
        await createPatient({
          accountId: accountResponse.accountId,
          fullName: formData.fullName,
          email: formData.email,
          phoneNumber: "0000000000", // Placeholder - user updates in profile
        });
        console.log("[Register] Patient record created successfully");
      } catch (patientError) {
        // Don't block registration if patient creation fails
        // User can complete profile later
        console.warn("[Register] Failed to auto-create patient record:", patientError);
      }
      
      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      router.push("/login");
    } catch (error: any) {
      const message = error.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Mobile Logo */}
      <div className="lg:hidden text-center mb-6">
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
        <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">Tạo tài khoản mới</h2>
        <p className="text-[hsl(var(--muted-foreground))] mt-2">
          Đăng ký để sử dụng dịch vụ của chúng tôi
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-2">
          <label className="text-label">Họ và tên</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--muted-foreground))]" />
            <input
              type="text"
              placeholder="Nguyễn Văn A"
              className="input-base pl-12"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />
          </div>
        </div>

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
          <label className="text-label">Mật khẩu</label>
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
          
          {/* Password Requirements */}
          {formData.password && (
            <div className="grid grid-cols-2 gap-1 mt-2">
              {passwordRequirements.map((req, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-1 text-xs ${
                    req.met ? "text-green-600" : "text-[hsl(var(--muted-foreground))]"
                  }`}
                >
                  <CheckCircle className={`w-3 h-3 ${req.met ? "opacity-100" : "opacity-30"}`} />
                  {req.text}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <label className="text-label">Xác nhận mật khẩu</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--muted-foreground))]" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className={`input-base pl-12 ${
                formData.confirmPassword && !doPasswordsMatch
                  ? "border-red-500 focus:border-red-500"
                  : ""
              }`}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
            />
          </div>
          {formData.confirmPassword && !doPasswordsMatch && (
            <p className="text-xs text-red-500">Mật khẩu không khớp</p>
          )}
        </div>

        {/* Terms */}
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="terms"
            required
            className="w-4 h-4 rounded border-[hsl(var(--border))] text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))] mt-0.5"
          />
          <label htmlFor="terms" className="text-sm text-[hsl(var(--muted-foreground))]">
            Tôi đồng ý với{" "}
            <Link href="/terms" className="text-[hsl(var(--primary))] hover:underline">
              Điều khoản sử dụng
            </Link>{" "}
            và{" "}
            <Link href="/privacy" className="text-[hsl(var(--primary))] hover:underline">
              Chính sách bảo mật
            </Link>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !isPasswordValid || !doPasswordsMatch}
          className="btn-primary w-full h-12 text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Đăng ký
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </button>
      </form>

      {/* Login Link */}
      <p className="text-center text-sm text-[hsl(var(--muted-foreground))]">
        Đã có tài khoản?{" "}
        <Link
          href="/login"
          className="text-[hsl(var(--primary))] font-medium hover:underline"
        >
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
