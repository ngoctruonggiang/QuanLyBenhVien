import Link from "next/link";
import { 
  Calendar, 
  Users, 
  Stethoscope, 
  ClipboardList, 
  Shield, 
  Zap,
  ArrowRight,
  Star,
  Check
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[hsl(var(--border))]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[hsl(173,58%,35%)] to-[hsl(173,58%,28%)] rounded-xl flex items-center justify-center text-white font-bold text-sm">
              HMS
            </div>
            <span className="text-lg font-semibold text-[hsl(var(--foreground))]">CarePoint</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">Tính năng</a>
            <a href="#pricing" className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">Bảng giá</a>
            <a href="#contact" className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">Liên hệ</a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-secondary text-sm py-2 px-4">
              Đăng nhập
            </Link>
            <Link href="/register" className="btn-primary text-sm py-2 px-4">
              Dùng thử miễn phí
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--primary-light))] text-[hsl(var(--primary))] text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            Giải pháp quản lý bệnh viện #1 Việt Nam
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-[hsl(var(--foreground))] leading-tight mb-6">
            Quản lý bệnh viện<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(173,58%,35%)] to-[hsl(173,58%,45%)]">
              thông minh & hiệu quả
            </span>
          </h1>
          
          <p className="text-xl text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto mb-10">
            Nền tảng toàn diện giúp tối ưu hóa quy trình khám chữa bệnh, 
            quản lý bệnh nhân và vận hành bệnh viện hiện đại.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="btn-primary text-base py-3 px-8">
              Bắt đầu miễn phí
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link href="/login" className="btn-secondary text-base py-3 px-8">
              Xem demo
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
            {[
              { value: "500+", label: "Bệnh viện" },
              { value: "10K+", label: "Bác sĩ" },
              { value: "1M+", label: "Bệnh nhân" },
              { value: "99.9%", label: "Uptime" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl font-bold text-[hsl(var(--primary))]">{stat.value}</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[hsl(var(--foreground))] mb-4">
              Tính năng nổi bật
            </h2>
            <p className="text-[hsl(var(--muted-foreground))] max-w-xl mx-auto">
              Tất cả công cụ bạn cần để vận hành bệnh viện hiệu quả, từ đặt lịch đến thanh toán.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Calendar,
                title: "Đặt lịch thông minh",
                description: "Bệnh nhân đặt lịch online, hệ thống tự động phân bổ theo lịch bác sĩ.",
              },
              {
                icon: Users,
                title: "Quản lý bệnh nhân",
                description: "Hồ sơ bệnh án điện tử, lịch sử khám chữa bệnh đầy đủ và bảo mật.",
              },
              {
                icon: Stethoscope,
                title: "Phiếu khám điện tử",
                description: "Bác sĩ ghi chẩn đoán, kê đơn thuốc, yêu cầu xét nghiệm trực tuyến.",
              },
              {
                icon: ClipboardList,
                title: "Kê đơn thuốc",
                description: "Kê đơn nhanh chóng với cơ sở dữ liệu thuốc được cập nhật liên tục.",
              },
              {
                icon: Shield,
                title: "Bảo mật dữ liệu",
                description: "Tuân thủ tiêu chuẩn HIPAA, mã hóa end-to-end, backup tự động.",
              },
              {
                icon: Zap,
                title: "Báo cáo thời gian thực",
                description: "Dashboard trực quan, phân tích doanh thu, thống kê lịch hẹn.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl border border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-[hsl(var(--primary-light))] flex items-center justify-center mb-4 group-hover:bg-[hsl(var(--primary))] transition-colors">
                  <feature.icon className="w-6 h-6 text-[hsl(var(--primary))] group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[hsl(var(--foreground))] mb-4">
              Bảng giá đơn giản
            </h2>
            <p className="text-[hsl(var(--muted-foreground))]">
              Chọn gói phù hợp với quy mô bệnh viện của bạn
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                name: "Starter",
                price: "2.000.000",
                period: "/tháng",
                features: ["50 bác sĩ", "500 bệnh nhân/tháng", "Đặt lịch online", "Hỗ trợ email"],
                popular: false,
              },
              {
                name: "Professional",
                price: "5.000.000",
                period: "/tháng",
                features: ["200 bác sĩ", "Không giới hạn bệnh nhân", "API tích hợp", "Hỗ trợ 24/7", "Báo cáo nâng cao"],
                popular: true,
              },
              {
                name: "Enterprise",
                price: "Liên hệ",
                period: "",
                features: ["Không giới hạn", "On-premise", "Tùy chỉnh theo yêu cầu", "SLA 99.99%", "Dedicated support"],
                popular: false,
              },
            ].map((plan, i) => (
              <div
                key={i}
                className={`p-6 rounded-2xl ${
                  plan.popular
                    ? "bg-gradient-to-b from-[hsl(173,58%,35%)] to-[hsl(173,58%,28%)] text-white ring-4 ring-[hsl(173,58%,35%)]/20"
                    : "bg-white border border-[hsl(var(--border))]"
                }`}
              >
                {plan.popular && (
                  <div className="flex items-center gap-1 text-xs font-medium mb-4">
                    <Star className="w-4 h-4 fill-current" />
                    Phổ biến nhất
                  </div>
                )}
                <h3 className={`text-xl font-semibold ${plan.popular ? "text-white" : "text-[hsl(var(--foreground))]"}`}>
                  {plan.name}
                </h3>
                <div className="mt-4 mb-6">
                  <span className={`text-3xl font-bold ${plan.popular ? "text-white" : "text-[hsl(var(--foreground))]"}`}>
                    {plan.price}
                  </span>
                  <span className={plan.popular ? "text-white/70" : "text-[hsl(var(--muted-foreground))]"}>
                    {plan.period}
                  </span>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm">
                      <Check className={`w-4 h-4 ${plan.popular ? "text-white" : "text-[hsl(var(--primary))]"}`} />
                      <span className={plan.popular ? "text-white/90" : "text-[hsl(var(--muted-foreground))]"}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-3 rounded-full font-medium transition-colors ${
                    plan.popular
                      ? "bg-white text-[hsl(173,58%,35%)] hover:bg-white/90"
                      : "bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary-dark))]"
                  }`}
                >
                  Bắt đầu
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-[hsl(173,58%,35%)] to-[hsl(173,58%,28%)]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Sẵn sàng nâng cấp bệnh viện của bạn?
          </h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">
            Đăng ký ngay hôm nay và nhận 14 ngày dùng thử miễn phí. Không cần thẻ tín dụng.
          </p>
          <Link href="/register" className="inline-flex items-center gap-2 bg-white text-[hsl(173,58%,35%)] px-8 py-3 rounded-full font-medium hover:bg-white/90 transition-colors">
            Dùng thử miễn phí
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-12 px-6 bg-white border-t border-[hsl(var(--border))]">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-[hsl(173,58%,35%)] to-[hsl(173,58%,28%)] rounded-lg flex items-center justify-center text-white font-bold text-xs">
                HMS
              </div>
              <span className="font-semibold">CarePoint</span>
            </div>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Giải pháp quản lý bệnh viện toàn diện cho y tế Việt Nam.
            </p>
          </div>
          
          {[
            { title: "Sản phẩm", links: ["Tính năng", "Bảng giá", "Tích hợp", "API"] },
            { title: "Công ty", links: ["Về chúng tôi", "Blog", "Tuyển dụng", "Liên hệ"] },
            { title: "Hỗ trợ", links: ["Tài liệu", "Hướng dẫn", "FAQ", "Hotline: 1900-xxxx"] },
          ].map((col, i) => (
            <div key={i}>
              <h4 className="font-semibold text-[hsl(var(--foreground))] mb-4">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link, j) => (
                  <li key={j}>
                    <a href="#" className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))]">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-[hsl(var(--border))] text-center text-sm text-[hsl(var(--muted-foreground))]">
          © 2025 CarePoint HMS. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
