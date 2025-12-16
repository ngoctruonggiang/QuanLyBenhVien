"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface GenderBadgeProps {
  gender: string;
  className?: string;
}

/**
 * Gender badge with distinct colors for better visual differentiation
 */
export function GenderBadge({ gender, className }: GenderBadgeProps) {
  const normalized = gender?.toUpperCase();
  
  const getGenderStyle = () => {
    switch (normalized) {
      case "MALE":
        return "bg-sky-50 text-sky-700 border-sky-200";
      case "FEMALE":
        return "bg-pink-50 text-pink-700 border-pink-200";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  const getLabel = () => {
    if (!gender) return "N/A";
    return gender.charAt(0) + gender.slice(1).toLowerCase();
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium text-xs",
        getGenderStyle(),
        className
      )}
    >
      {getLabel()}
    </Badge>
  );
}
