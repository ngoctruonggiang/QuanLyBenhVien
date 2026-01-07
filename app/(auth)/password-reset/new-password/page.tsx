"use client";

import { Suspense, useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Hospital, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Lock, 
  Check, 
  X,
  Loader2,
  ArrowLeft,
  KeyRound,
  Sparkles,
  Heart,
  Stethoscope
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const ResetPasswordPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [validations, setValidations] = useState({
    minLength: false,
    hasUpperLower: false,
    hasNumber: false,
    hasSpecial: false,
  });

  const validatePassword = (password: string) => {
    setValidations({
      minLength: password.length >= 8,
      hasUpperLower: /[a-z]/.test(password) && /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  };

  const handlePasswordChange = (field: "newPassword" | "confirmPassword", value: string) => {
    setPasswords((prev) => ({ ...prev, [field]: value }));
    if (field === "newPassword") {
      validatePassword(value);
    }
  };

  const passwordsMatch = passwords.newPassword === passwords.confirmPassword && passwords.confirmPassword.length > 0;
  const allValidations = Object.values(validations).every((v) => v);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    if (!passwordsMatch) {
      setErrorMessage("Mật khẩu không khớp");
      return;
    }

    if (!allValidations) {
      setErrorMessage("Vui lòng đáp ứng tất cả yêu cầu mật khẩu");
      return;
    }

    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      router.push("/password-reset/new-password/success");
    } catch (error) {
      setErrorMessage("Không thể đặt lại mật khẩu. Vui lòng thử lại.");
      console.error("Password reset error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const ValidationItem = ({ valid, text }: { valid: boolean; text: string }) => (
    <li className="flex items-center gap-2.5 text-xs">
      <div className={cn(
        "w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300",
        valid 
          ? "bg-emerald-100 text-emerald-600" 
          : "bg-slate-100 text-slate-400"
      )}>
        {valid ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
      </div>
      <span className={cn(
        "transition-colors duration-300",
        valid ? "text-emerald-600" : "text-slate-500"
      )}>
        {text}
      </span>
    </li>
  );

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Bright gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-teal-50" />
      
      <div 
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage: `
            radial-gradient(circle at 0% 0%, rgba(56, 189, 248, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 100% 100%, rgba(20, 184, 166, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(125, 211, 252, 0.1) 0%, transparent 60%)
          `,
        }}
      />
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-r from-sky-200/30 to-teal-200/30 blur-3xl" style={{ top: "-10%", left: "-10%" }} />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-gradient-to-r from-teal-200/30 to-emerald-200/30 blur-3xl" style={{ bottom: "-10%", right: "-10%" }} />
        <Heart className="absolute w-6 h-6 text-rose-300/40 animate-pulse" style={{ top: "20%", right: "25%", animationDuration: "2s" }} />
        <Stethoscope className="absolute w-6 h-6 text-sky-300/40 animate-pulse" style={{ bottom: "30%", left: "10%", animationDuration: "2.5s", animationDelay: "0.5s" }} />
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-8">
        {/* Header */}
        <div className="flex flex-col items-center gap-5">
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-sky-400/20 via-teal-400/20 to-sky-400/20 rounded-3xl blur-xl opacity-70 group-hover:opacity-100 transition duration-500" />
            <div className="relative bg-gradient-to-br from-sky-500 to-teal-500 rounded-2xl shadow-xl shadow-sky-500/20 w-16 h-16 flex items-center justify-center">
              <Hospital className="w-9 h-9 text-white drop-shadow" />
            </div>
          </div>
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-teal-600 bg-clip-text text-transparent">
              Hệ thống Quản lý Bệnh viện
            </h1>
            <p className="text-sm text-slate-500">HMS Healthcare Solution</p>
          </div>
        </div>

        {/* Card */}
        <div className="w-full max-w-[420px]">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-sky-500/10 via-teal-500/10 to-sky-500/10 rounded-3xl blur-lg" />
            
            <div className="relative bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-sky-500 via-teal-500 to-emerald-500" />
              
              <div className="px-8 pt-8 pb-4">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 rounded-xl bg-sky-100">
                    <KeyRound className="w-6 h-6 text-sky-600" />
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-slate-800 text-center mb-2">
                  Đặt lại mật khẩu
                </h2>
                <p className="text-sm text-slate-500 text-center">
                  Tạo mật khẩu mới mạnh mẽ và an toàn
                </p>
              </div>

              <div className="px-8 py-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {errorMessage && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-start gap-3">
                      <span className="shrink-0 mt-0.5">⚠️</span>
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* New Password */}
                  <div className="space-y-2">
                    <label htmlFor="newPassword" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <Lock className="w-4 h-4 text-sky-500" />
                      Mật khẩu mới
                    </label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        value={passwords.newPassword}
                        onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                        className="h-12 bg-slate-50 border-slate-200 rounded-xl px-4 pr-12 text-slate-800 placeholder:text-slate-400 focus:border-sky-500 focus:ring-sky-500/20"
                        placeholder="Nhập mật khẩu mới"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                        disabled={isLoading}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <Lock className="w-4 h-4 text-teal-500" />
                      Xác nhận mật khẩu
                      {passwordsMatch && <Check className="w-4 h-4 text-emerald-500 ml-auto" />}
                    </label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        value={passwords.confirmPassword}
                        onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                        className={cn(
                          "h-12 bg-slate-50 border-slate-200 rounded-xl px-4 pr-12 text-slate-800 placeholder:text-slate-400",
                          passwordsMatch && "border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/20",
                          passwords.confirmPassword && !passwordsMatch && "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                        )}
                        placeholder="Nhập lại mật khẩu mới"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Password Requirements */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <p className="text-xs font-medium text-slate-600">Yêu cầu mật khẩu:</p>
                    </div>
                    <ul className="space-y-2">
                      <ValidationItem valid={validations.minLength} text="Ít nhất 8 ký tự" />
                      <ValidationItem valid={validations.hasUpperLower} text="Chữ hoa và chữ thường" />
                      <ValidationItem valid={validations.hasNumber} text="Ít nhất một số" />
                      <ValidationItem valid={validations.hasSpecial} text="Ít nhất một ký tự đặc biệt" />
                    </ul>
                  </div>

                  {/* Strength indicator */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Độ mạnh mật khẩu</span>
                      <span className={cn(
                        "font-medium",
                        Object.values(validations).filter(Boolean).length <= 1 && "text-red-500",
                        Object.values(validations).filter(Boolean).length === 2 && "text-orange-500",
                        Object.values(validations).filter(Boolean).length === 3 && "text-amber-500",
                        Object.values(validations).filter(Boolean).length === 4 && "text-emerald-500",
                      )}>
                        {Object.values(validations).filter(Boolean).length <= 1 && "Yếu"}
                        {Object.values(validations).filter(Boolean).length === 2 && "Trung bình"}
                        {Object.values(validations).filter(Boolean).length === 3 && "Tốt"}
                        {Object.values(validations).filter(Boolean).length === 4 && "Mạnh"}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          Object.values(validations).filter(Boolean).length <= 1 && "bg-red-500",
                          Object.values(validations).filter(Boolean).length === 2 && "bg-orange-500",
                          Object.values(validations).filter(Boolean).length === 3 && "bg-amber-500",
                          Object.values(validations).filter(Boolean).length === 4 && "bg-emerald-500",
                        )}
                        style={{ width: `${Object.values(validations).filter(Boolean).length * 25}%` }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !allValidations || !passwordsMatch}
                    className={cn(
                      "relative w-full h-12 rounded-xl text-sm font-semibold transition-all duration-300 overflow-hidden group/btn",
                      "bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600",
                      "text-white shadow-lg shadow-sky-500/30 hover:shadow-sky-500/40",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Đang đặt lại...
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          Đặt lại mật khẩu
                        </>
                      )}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                  </button>
                </form>
              </div>

              <div className="border-t border-slate-100 px-8 py-5 bg-slate-50/50">
                <button
                  onClick={() => router.push("/login")}
                  className="w-full flex items-center justify-center gap-2 text-sm font-medium text-slate-600 hover:text-sky-600 transition-colors group/back"
                >
                  <ArrowLeft className="h-4 w-4 group-hover/back:-translate-x-1 transition-transform" />
                  Quay lại Đăng nhập
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Bảo mật SSL 256-bit</span>
        </div>
      </div>
    </div>
  );
};

export default function ResetPasswordPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-teal-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
      </div>
    }>
      <ResetPasswordPage />
    </Suspense>
  );
}
