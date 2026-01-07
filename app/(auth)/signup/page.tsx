"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Eye, 
  EyeOff, 
  Hospital, 
  Mail, 
  Lock, 
  Loader2, 
  UserPlus,
  ShieldCheck,
  Heart,
  Stethoscope,
  Check,
  X,
  Sparkles
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { authService } from "@/services/auth.service";
import { cn } from "@/lib/utils";
import z from "zod";

export const signupSchema = z
  .object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(8, "Confirm Password must be at least 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignUpCredentials = z.infer<typeof signupSchema>;

const SignUpPage = () => {
  const router = useRouter();
  const [credentials, setCredentials] = useState<SignUpCredentials>({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Password validation
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

  const passwordsMatch = credentials.password === credentials.confirmPassword && credentials.confirmPassword.length > 0;
  const allValidations = Object.values(validations).every((v) => v);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

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
      await authService.register({
        email: credentials.email,
        password: credentials.password,
      });

      setSuccessMessage("Tạo tài khoản thành công! Đang chuyển hướng...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Không thể tạo tài khoản. Vui lòng thử lại.");
      }
      console.error("Signup error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    console.log("Google signup clicked");
  };

  const ValidationItem = ({ valid, text }: { valid: boolean; text: string }) => (
    <li className="flex items-center gap-2 text-xs">
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
    <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden py-8">
      {/* Bright gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-teal-50" />
      
      {/* Soft colorful gradient overlay */}
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
      
      {/* Floating decorative shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-r from-sky-200/30 to-teal-200/30 blur-3xl"
          style={{ top: "-10%", left: "-10%" }}
        />
        <div 
          className="absolute w-[400px] h-[400px] rounded-full bg-gradient-to-r from-teal-200/30 to-emerald-200/30 blur-3xl"
          style={{ bottom: "-10%", right: "-10%" }}
        />
        <div className="absolute w-3 h-3 rounded-full bg-sky-400/30 animate-bounce" style={{ top: "15%", left: "8%", animationDuration: "3s" }} />
        <div className="absolute w-2 h-2 rounded-full bg-teal-400/30 animate-bounce" style={{ top: "60%", left: "15%", animationDuration: "4s", animationDelay: "0.5s" }} />
        <Heart className="absolute w-6 h-6 text-rose-300/40 animate-pulse" style={{ top: "20%", right: "25%", animationDuration: "2s" }} />
        <Stethoscope className="absolute w-6 h-6 text-sky-300/40 animate-pulse" style={{ bottom: "30%", left: "10%", animationDuration: "2.5s", animationDelay: "0.5s" }} />
      </div>

      {/* Main content container */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-6">
        {/* Header with logo */}
        <div className="flex flex-col items-center gap-4">
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

        {/* Signup Card */}
        <div className="w-full max-w-[420px]">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-sky-500/10 via-teal-500/10 to-sky-500/10 rounded-3xl blur-lg" />
            
            <div className="relative bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden">
              {/* Top accent line */}
              <div className="h-1 bg-gradient-to-r from-sky-500 via-teal-500 to-emerald-500" />
              
              {/* Card Header */}
              <div className="px-8 pt-6 pb-2 text-center">
                <div className="flex items-center justify-center mb-3">
                  <div className="p-2.5 rounded-xl bg-sky-100">
                    <UserPlus className="w-5 h-5 text-sky-600" />
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-slate-800 mb-1">
                  Tạo tài khoản mới 🚀
                </h2>
                <p className="text-sm text-slate-500">
                  Nhập thông tin để đăng ký tài khoản
                </p>
              </div>

              {/* Card Content - Form */}
              <div className="px-8 py-5">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Error Message */}
                  {errorMessage && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-start gap-3 animate-in slide-in-from-top-2">
                      <span className="shrink-0 mt-0.5">⚠️</span>
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Success Message */}
                  {successMessage && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 px-4 py-3 rounded-xl text-sm flex items-start gap-3 animate-in slide-in-from-top-2">
                      <span className="shrink-0 mt-0.5">✓</span>
                      <span>{successMessage}</span>
                    </div>
                  )}

                  {/* Email Field */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <Mail className="w-4 h-4 text-sky-500" />
                      Email
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={credentials.email}
                      onChange={(e) =>
                        setCredentials({ ...credentials, email: e.target.value })
                      }
                      className="h-11 bg-slate-50 border-slate-200 rounded-xl px-4 text-slate-800 placeholder:text-slate-400 focus:border-sky-500 focus:ring-sky-500/20"
                      placeholder="Nhập địa chỉ email"
                      disabled={isLoading}
                    />
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <label htmlFor="password" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <Lock className="w-4 h-4 text-sky-500" />
                      Mật khẩu
                    </label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        value={credentials.password}
                        onChange={(e) => {
                          setCredentials({ ...credentials, password: e.target.value });
                          validatePassword(e.target.value);
                        }}
                        className="h-11 bg-slate-50 border-slate-200 rounded-xl px-4 pr-12 text-slate-800 placeholder:text-slate-400 focus:border-sky-500 focus:ring-sky-500/20"
                        placeholder="Tạo mật khẩu"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password Field */}
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
                        value={credentials.confirmPassword}
                        onChange={(e) =>
                          setCredentials({ ...credentials, confirmPassword: e.target.value })
                        }
                        className={cn(
                          "h-11 bg-slate-50 border-slate-200 rounded-xl px-4 pr-12 text-slate-800 placeholder:text-slate-400",
                          passwordsMatch && "border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/20",
                          credentials.confirmPassword && !passwordsMatch && "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                        )}
                        placeholder="Nhập lại mật khẩu"
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
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <p className="text-xs font-medium text-slate-600">Yêu cầu mật khẩu:</p>
                    </div>
                    <ul className="grid grid-cols-2 gap-1.5">
                      <ValidationItem valid={validations.minLength} text="8+ ký tự" />
                      <ValidationItem valid={validations.hasUpperLower} text="Hoa & thường" />
                      <ValidationItem valid={validations.hasNumber} text="Có số" />
                      <ValidationItem valid={validations.hasSpecial} text="Ký tự đặc biệt" />
                    </ul>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading || !!successMessage || !allValidations || !passwordsMatch}
                    className={cn(
                      "relative w-full h-11 rounded-xl text-sm font-semibold transition-all duration-300 overflow-hidden group/btn",
                      "bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600",
                      "text-white shadow-lg shadow-sky-500/30 hover:shadow-sky-500/40",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Đang tạo tài khoản...
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          Đăng ký
                        </>
                      )}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                  </button>

                  {/* Separator */}
                  <div className="relative flex items-center justify-center py-1">
                    <div className="absolute inset-x-0 h-px bg-slate-200" />
                    <div className="relative bg-white px-3">
                      <span className="text-xs text-slate-400 uppercase">hoặc</span>
                    </div>
                  </div>

                  {/* Google Sign Up Button */}
                  <button
                    type="button"
                    onClick={handleGoogleSignup}
                    className="w-full h-11 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2"
                    disabled={isLoading}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
                      <path d="M19.576 10.229c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.351z" fill="#4285F4"/>
                      <path d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.591A9.996 9.996 0 0010 20z" fill="#34A853"/>
                      <path d="M4.405 11.9c-.2-.6-.314-1.241-.314-1.9 0-.659.114-1.3.314-1.9V5.509H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.491L4.405 11.9z" fill="#FBBC05"/>
                      <path d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.509L4.405 8.1C5.19 5.737 7.395 3.977 10 3.977z" fill="#EA4335"/>
                    </svg>
                    Đăng ký bằng Google
                  </button>
                </form>
              </div>

              {/* Card Footer */}
              <div className="border-t border-slate-100 px-8 py-4 bg-slate-50/50">
                <p className="text-sm text-slate-500 text-center">
                  Đã có tài khoản?{" "}
                  <Link href="/login" className="font-medium text-sky-600 hover:text-sky-700 transition-colors">
                    Đăng nhập
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Security badge */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Bảo mật SSL 256-bit</span>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
