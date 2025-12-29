import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[hsl(173,58%,35%)] via-[hsl(173,58%,30%)] to-[hsl(173,58%,25%)] p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white font-bold text-lg">
              HMS
            </div>
            <div>
              <h1 className="text-white text-xl font-semibold">CarePoint</h1>
              <p className="text-white/70 text-sm">Hospital Management System</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 space-y-6">
          <h2 className="text-4xl font-bold text-white leading-tight">
            Quản lý bệnh viện<br />
            thông minh & hiệu quả
          </h2>
          <p className="text-white/80 text-lg max-w-md">
            Nền tảng quản lý toàn diện giúp tối ưu hóa quy trình khám chữa bệnh, 
            quản lý bệnh nhân và vận hành bệnh viện.
          </p>
          
          {/* Features */}
          <div className="grid grid-cols-2 gap-4 mt-8">
            {[
              { icon: "📅", text: "Đặt lịch hẹn online" },
              { icon: "🏥", text: "Quản lý phòng khám" },
              { icon: "💊", text: "Kê đơn điện tử" },
              { icon: "📊", text: "Báo cáo thống kê" },
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-white/90">
                <span className="text-2xl">{feature.icon}</span>
                <span className="text-sm">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-white/60 text-sm">
            © 2025 CarePoint HMS. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
