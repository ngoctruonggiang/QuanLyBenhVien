"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/utils";

export type HeaderProps = {
  isScrolled?: boolean;
  logoText?: string;
};

export function Header({ isScrolled, logoText = "HMS" }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const showScrolled = typeof isScrolled === "boolean" ? isScrolled : scrolled;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-30 transition-all duration-300",
        showScrolled
          ? "bg-white/95 shadow-md backdrop-blur supports-[backdrop-filter]:bg-white/80"
          : "bg-transparent",
      )}
    >
      <div className="relative mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white text-sm font-semibold tracking-tight shadow-sm">
            {logoText}
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-slate-900">
              Hospital Management
            </p>
            <p className="text-xs text-slate-500">Healthcare System</p>
          </div>
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/login")}
          >
            Dang nhap
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/signup")}
          >
            Dang ky
          </Button>
        </div>

        <div className="sm:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="landing-mobile-menu"
            aria-label="Toggle navigation menu"
          >
            Menu
          </Button>
          {menuOpen ? (
            <div
              id="landing-mobile-menu"
              className="absolute right-4 top-14 w-40 rounded-lg border border-slate-200 bg-white shadow-lg"
            >
              <div className="flex flex-col divide-y divide-slate-200">
                <button
                  className="px-4 py-3 text-left text-sm font-medium text-slate-800 hover:bg-slate-50"
                  onClick={() => {
                    setMenuOpen(false);
                    router.push("/login");
                  }}
                >
                  Dang nhap
                </button>
                <button
                  className="px-4 py-3 text-left text-sm font-medium text-slate-800 hover:bg-slate-50"
                  onClick={() => {
                    setMenuOpen(false);
                    router.push("/signup");
                  }}
                >
                  Dang ky
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

export default Header;
