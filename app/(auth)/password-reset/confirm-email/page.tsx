"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { 
  Hospital, 
  ArrowLeft, 
  Mail, 
  ShieldCheck, 
  Send,
  CheckCircle2,
  Loader2,
  KeyRound,
  Sparkles,
  Heart,
  Stethoscope
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const PasswordResetPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSubmittedEmail(email);
      setShowConfirmation(true);
    } catch (error) {
      setErrorMessage("Không thể gửi liên kết đặt lại. Vui lòng thử lại.");
      console.error("Password reset error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryAgain = () => {
    setShowConfirmation(false);
    setEmail("");
    setSubmittedEmail("");
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
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
      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-8">
        {/* Header with logo */}
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

        {/* Step indicator */}
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300",
            !showConfirmation 
              ? "bg-sky-100 text-sky-700 ring-1 ring-sky-200" 
              : "bg-slate-100 text-slate-500"
          )}>
            <div className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold",
              !showConfirmation ? "bg-sky-500 text-white" : "bg-slate-300 text-slate-500"
            )}>
              1
            </div>
            Nhập email
          </div>
          <div className="w-8 h-px bg-slate-200" />
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300",
            showConfirmation 
              ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200" 
              : "bg-slate-100 text-slate-500"
          )}>
            <div className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold",
              showConfirmation ? "bg-emerald-500 text-white" : "bg-slate-300 text-slate-500"
            )}>
              2
            </div>
            Xác nhận
          </div>
        </div>

        {/* Card */}
        <div className="w-full max-w-[420px]">
          {!showConfirmation ? (
            /* Email Input Card */
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
                    Quên mật khẩu?
                  </h2>
                  <p className="text-sm text-slate-500 text-center">
                    Đừng lo lắng! Nhập email của bạn và chúng tôi sẽ gửi liên kết đặt lại.
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

                    <div className="space-y-2">
                      <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <Mail className="w-4 h-4 text-sky-500" />
                        Địa chỉ Email
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12 bg-slate-50 border-slate-200 rounded-xl px-4 text-slate-800 placeholder:text-slate-400 focus:border-sky-500 focus:ring-sky-500/20"
                        placeholder="email@domain.com"
                        disabled={isLoading}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || !email}
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
                            Đang gửi...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Gửi liên kết đặt lại
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
          ) : (
            /* Confirmation Card */
            <div className="relative animate-in fade-in-0 slide-in-from-right-4 duration-500">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 rounded-3xl blur-lg" />
              
              <div className="relative bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500" />
                
                <div className="px-8 pt-8 pb-4">
                  <div className="flex items-center justify-center mb-4">
                    <div className="relative">
                      <div className="absolute -inset-2 bg-emerald-200/50 rounded-full blur-lg animate-pulse" />
                      <div className="relative p-3 rounded-full bg-emerald-100 ring-2 ring-emerald-200">
                        <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                      </div>
                    </div>
                  </div>
                  <h2 className="text-xl font-semibold text-slate-800 text-center mb-2">
                    Kiểm tra Email của bạn
                  </h2>
                  <p className="text-sm text-slate-500 text-center">
                    Chúng tôi đã gửi liên kết đặt lại mật khẩu
                  </p>
                </div>

                <div className="px-8 py-6">
                  <div className="space-y-5">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-emerald-100">
                          <Mail className="w-4 h-4 text-emerald-600" />
                        </div>
                        <p className="text-sm text-emerald-700">
                          Nếu tài khoản tồn tại cho{" "}
                          <span className="font-semibold">{submittedEmail}</span>, 
                          bạn sẽ nhận được email ngay.
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                        <div className="space-y-2">
                          <p className="text-xs text-slate-600 font-medium">Mẹo hữu ích:</p>
                          <ul className="text-xs text-slate-500 space-y-1">
                            <li>• Kiểm tra thư mục spam nếu không thấy email</li>
                            <li>• Liên kết có hiệu lực trong 30 phút</li>
                            <li>• Email có thể mất vài phút để đến</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleTryAgain}
                      className="w-full h-11 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-sm font-medium rounded-xl transition-all"
                    >
                      Thử lại với email khác
                    </button>
                  </div>
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
          )}
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

export default PasswordResetPage;
