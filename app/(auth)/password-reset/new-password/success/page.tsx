"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  Hospital, 
  CheckCircle2, 
  ShieldCheck,
  Sparkles,
  ArrowRight,
  PartyPopper,
  Heart,
  Stethoscope
} from "lucide-react";
import { cn } from "@/lib/utils";

const ResetSuccessPage = () => {
  const router = useRouter();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    setTimeout(() => setShowContent(true), 200);
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Bright gradient background - Success themed */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50" />
      
      <div 
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage: `
            radial-gradient(circle at 0% 0%, rgba(16, 185, 129, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 100% 100%, rgba(20, 184, 166, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(52, 211, 153, 0.1) 0%, transparent 60%)
          `,
        }}
      />
      
      {/* Celebration particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-r from-emerald-200/30 to-teal-200/30 blur-3xl" style={{ top: "-10%", left: "-10%" }} />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-gradient-to-r from-teal-200/30 to-emerald-200/30 blur-3xl" style={{ bottom: "-10%", right: "-10%" }} />
        {/* Confetti dots */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full animate-bounce"
            style={{
              left: `${10 + (i * 7)}%`,
              top: `${10 + (i % 3) * 20}%`,
              backgroundColor: ['#10b981', '#14b8a6', '#22c55e', '#f59e0b', '#f472b6', '#3b82f6'][i % 6],
              animationDuration: `${2 + Math.random() * 2}s`,
              animationDelay: `${i * 0.1}s`,
              opacity: 0.5,
            }}
          />
        ))}
        <Heart className="absolute w-6 h-6 text-rose-300/50 animate-pulse" style={{ top: "20%", right: "25%", animationDuration: "2s" }} />
        <Stethoscope className="absolute w-6 h-6 text-emerald-300/50 animate-pulse" style={{ bottom: "30%", left: "10%", animationDuration: "2.5s" }} />
      </div>

      <div className={cn(
        "relative z-10 w-full max-w-md flex flex-col items-center gap-8 transition-all duration-700",
        showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}>
        {/* Header */}
        <div className="flex flex-col items-center gap-5">
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-emerald-400/20 via-teal-400/20 to-emerald-400/20 rounded-3xl blur-xl opacity-70 group-hover:opacity-100 transition duration-500" />
            <div className="relative bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl shadow-xl shadow-emerald-500/20 w-16 h-16 flex items-center justify-center">
              <Hospital className="w-9 h-9 text-white drop-shadow" />
            </div>
          </div>
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Hệ thống Quản lý Bệnh viện
            </h1>
            <p className="text-sm text-slate-500">HMS Healthcare Solution</p>
          </div>
        </div>

        {/* Success Card */}
        <div className="w-full max-w-[420px]">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 rounded-3xl blur-lg animate-pulse" />
            
            <div className="relative bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500" />
              
              <div className="px-8 pt-8 pb-4">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="absolute -inset-3 bg-emerald-200/50 rounded-full blur-xl animate-pulse" />
                    <div className="relative bg-emerald-100 rounded-full w-20 h-20 flex items-center justify-center ring-4 ring-emerald-200">
                      <CheckCircle2 className="w-12 h-12 text-emerald-600 animate-in zoom-in-50 duration-500" strokeWidth={2} />
                    </div>
                    <div className="absolute -top-1 -right-1 bg-amber-100 rounded-full p-1.5 ring-2 ring-amber-200 animate-bounce">
                      <PartyPopper className="w-4 h-4 text-amber-600" />
                    </div>
                  </div>

                  <h2 className="text-xl font-semibold text-slate-800 text-center">
                    Đặt lại mật khẩu thành công! 🎉
                  </h2>

                  <p className="text-sm text-slate-500 text-center">
                    Mật khẩu của bạn đã được thay đổi thành công.
                  </p>
                </div>
              </div>

              <div className="px-8 py-6">
                <div className="space-y-5">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-emerald-100 shrink-0">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-emerald-700">
                          Tài khoản đã được bảo mật
                        </p>
                        <p className="text-xs text-emerald-600">
                          Mật khẩu mới đã được mã hóa và lưu trữ an toàn.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <p className="text-xs text-slate-600 font-medium mb-2">💡 Mẹo bảo mật:</p>
                    <ul className="text-xs text-slate-500 space-y-1">
                      <li>• Không chia sẻ mật khẩu với bất kỳ ai</li>
                      <li>• Sử dụng mật khẩu khác nhau cho mỗi tài khoản</li>
                      <li>• Đổi mật khẩu định kỳ để tăng bảo mật</li>
                    </ul>
                  </div>

                  <button
                    onClick={() => router.push("/login")}
                    className={cn(
                      "relative w-full h-12 rounded-xl text-sm font-semibold transition-all duration-300 overflow-hidden group/btn",
                      "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600",
                      "text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40"
                    )}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Đăng nhập ngay
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                  </button>
                </div>
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

export default ResetSuccessPage;
