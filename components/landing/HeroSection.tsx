"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Calendar, LogIn, UserPlus } from "lucide-react";

export type HeroSectionProps = {
  hospitalName?: string;
  slogan?: string;
  logoSrc?: string;
  onBookAppointment?: () => void;
  onLogin?: () => void;
  onSignup?: () => void;
  backgroundImage?: string;
};

const defaultName = "Health Management System";
const defaultSlogan = "Chăm sóc sức khỏe chuyên nghiệp, công nghệ hiện đại";

export function HeroSection({
  hospitalName = defaultName,
  slogan = defaultSlogan,
  logoSrc,
  onBookAppointment,
  onLogin,
  onSignup,
  backgroundImage,
}: HeroSectionProps) {
  return (
    <section className="landing-hero-bg relative isolate flex min-h-screen items-center justify-center overflow-hidden px-6 py-24 text-white">
      {/* Gradient overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40"
        aria-hidden="true"
      />
      
      {/* Background image */}
      {backgroundImage ? (
        <div className="absolute inset-0">
          <Image
            src={backgroundImage}
            alt="Hospital background"
            fill
            priority
            className="object-cover opacity-30"
          />
        </div>
      ) : null}

      {/* Decorative floating elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-teal-400/20 rounded-full blur-3xl animate-pulse" aria-hidden="true" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-sky-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} aria-hidden="true" />
      <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-cyan-400/10 rounded-full blur-2xl" aria-hidden="true" />

      {/* Main content */}
      <div className="relative z-10 w-full max-w-4xl text-center animate-fade-in-up px-2">
        {/* Logo */}
        {logoSrc ? (
          <div className="mx-auto mb-8 h-20 w-20 overflow-hidden rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
            <Image
              src={logoSrc}
              alt="Hospital logo"
              width={80}
              height={80}
              className="h-full w-full object-contain"
            />
          </div>
        ) : (
          <div className="mx-auto mb-8 h-20 w-20 overflow-hidden rounded-2xl bg-gradient-to-br from-teal-400 to-sky-500 flex items-center justify-center shadow-lg shadow-sky-500/30">
            <span className="text-2xl font-bold">HMS</span>
          </div>
        )}

        {/* Title */}
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl drop-shadow-lg">
          <span className="block">{hospitalName}</span>
        </h1>

        {/* Slogan */}
        <p className="mt-6 text-lg text-white/90 sm:text-xl md:text-2xl font-light max-w-2xl mx-auto leading-relaxed">
          {slogan}
        </p>

        {/* CTA Buttons */}
        <div className="mt-12 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:flex-wrap sm:gap-5">
          <Button
            size="lg"
            className="landing-cta group w-full px-8 py-6 text-lg bg-gradient-to-r from-teal-400 to-sky-500 text-white hover:from-teal-500 hover:to-sky-600 shadow-lg shadow-sky-500/30 border-0 sm:w-auto"
            onClick={onBookAppointment}
            aria-label="Đặt lịch khám"
          >
            <Calendar className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            Đặt lịch khám
          </Button>
          
          <Button
            size="lg"
            variant="secondary"
            className="landing-cta group w-full px-8 py-6 text-lg bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 border border-white/30 sm:w-auto"
            onClick={onLogin}
            aria-label="Đăng nhập"
          >
            <LogIn className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            Đăng nhập
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            className="landing-cta w-full px-8 py-6 text-lg border-white/50 text-white hover:bg-white hover:text-sky-700 transition-all sm:w-auto"
            onClick={onSignup}
            aria-label="Đăng ký"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Đăng ký
          </Button>
        </div>

        {/* Trust indicators */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-white/70 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span>24/7 Hỗ trợ</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" style={{ animationDelay: '0.3s' }} />
            <span>Đội ngũ chuyên gia</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: '0.6s' }} />
            <span>Công nghệ hiện đại</span>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        aria-hidden="true"
      >
        <span className="text-white/50 text-xs uppercase tracking-widest">Cuộn xuống</span>
        <div className="h-12 w-px bg-gradient-to-b from-white/50 to-transparent" />
      </div>
    </section>
  );
}

export default HeroSection;

