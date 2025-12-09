"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";

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
const defaultSlogan = "Cham soc suc khoe chuyen nghiep, cong nghe hien dai";

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
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/20 to-black/30"
        aria-hidden="true"
      />
      {backgroundImage ? (
        <div className="absolute inset-0">
          <Image
            src={backgroundImage}
            alt="Hospital background"
            fill
            priority
            className="object-cover opacity-40"
          />
        </div>
      ) : null}

      <div className="relative z-10 w-full max-w-4xl text-center animate-fade-in-up px-2">
        {logoSrc ? (
          <div className="mx-auto mb-6 h-16 w-16 overflow-hidden rounded-2xl bg-white/10 backdrop-blur">
            <Image
              src={logoSrc}
              alt="Hospital logo"
              width={64}
              height={64}
              className="h-full w-full object-contain"
            />
          </div>
        ) : null}

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          {hospitalName}
        </h1>

        <p className="mt-4 text-lg text-white/90 sm:text-xl md:text-2xl">
          {slogan}
        </p>

        <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
          <Button
            size="lg"
            className="landing-cta w-full px-8 py-6 text-lg bg-white text-blue-800 hover:bg-slate-100 shadow-lg sm:w-auto"
            onClick={onBookAppointment}
            aria-label="Dat lich kham"
          >
            Dat lich kham
          </Button>
          <Button
            size="lg"
            variant="secondary"
            className="landing-cta w-full px-8 py-6 text-lg bg-blue-500 text-white hover:bg-blue-600 shadow-lg sm:w-auto"
            onClick={onLogin}
            aria-label="Dang nhap"
          >
            Dang nhap
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="landing-cta w-full px-8 py-6 text-lg border-white text-white hover:bg-white/10 sm:w-auto"
            onClick={onSignup}
            aria-label="Dang ky"
          >
            Dang ky
          </Button>
        </div>
      </div>

      <div
        className="absolute bottom-10 left-1/2 h-10 w-px -translate-x-1/2 bg-white/50"
        aria-hidden="true"
      />
    </section>
  );
}

export default HeroSection;
