"use client";

import { ReactNode } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface DetailPageHeaderProps {
  /** Title of the page (e.g., patient name) */
  title: string;
  /** Subtitle text (e.g., ID or role) */
  subtitle?: string;
  /** Back link URL */
  backHref: string;
  /** Avatar initials or image */
  avatar?: {
    initials?: string;
    src?: string;
    alt?: string;
  };
  /** Gradient theme: sky, violet, teal, emerald */
  theme?: "sky" | "violet" | "teal" | "emerald" | "rose";
  /** Meta info items displayed below title */
  metaItems?: Array<{
    icon: ReactNode;
    text: string;
  }>;
  /** Action buttons on the right side */
  actions?: ReactNode;
  /** Optional status badge */
  statusBadge?: ReactNode;
  /** Additional class names */
  className?: string;
}

const themeStyles = {
  sky: "from-sky-500 to-cyan-500",
  violet: "from-violet-500 to-purple-500",
  teal: "from-teal-500 to-emerald-500",
  emerald: "from-emerald-500 to-green-500",
  rose: "from-rose-500 to-pink-500",
};

export function DetailPageHeader({
  title,
  subtitle,
  backHref,
  avatar,
  theme = "sky",
  metaItems,
  actions,
  statusBadge,
  className,
}: DetailPageHeaderProps) {
  return (
    <div
      className={cn(
        "relative rounded-xl bg-gradient-to-r p-6 text-white overflow-hidden",
        themeStyles[theme],
        className
      )}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-white" />
      </div>

      <div className="relative flex items-start justify-between gap-6">
        <div className="flex items-center gap-5">
          {/* Back button */}
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="text-white/90 hover:text-white hover:bg-white/20 shrink-0"
          >
            <Link href={backHref}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>

          {/* Avatar */}
          {avatar && (
            <Avatar className="h-16 w-16 ring-4 ring-white/30 shrink-0">
              {avatar.src && <AvatarImage src={avatar.src} alt={avatar.alt} />}
              <AvatarFallback className="bg-white/20 text-white text-xl font-bold">
                {avatar.initials}
              </AvatarFallback>
            </Avatar>
          )}

          {/* Title & Meta */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
              {statusBadge}
            </div>
            {subtitle && (
              <p className="text-white/80 text-sm font-medium">{subtitle}</p>
            )}
            {metaItems && metaItems.length > 0 && (
              <div className="flex flex-wrap items-center gap-4 mt-1">
                {metaItems.map((item, idx) => (
                  <span
                    key={idx}
                    className="flex items-center gap-1.5 text-sm text-white/90"
                  >
                    <span className="opacity-70">{item.icon}</span>
                    {item.text}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex items-center gap-2 shrink-0">{actions}</div>
        )}
      </div>
    </div>
  );
}
