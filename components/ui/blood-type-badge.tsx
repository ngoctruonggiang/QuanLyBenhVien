"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BloodTypeBadgeProps {
  bloodType: string;
  className?: string;
}

/**
 * Semantic blood type badge with medical-inspired colors
 * - O- (Universal Donor): Red - Critical/Important
 * - O+ (Common): Orange-Red - Primary
 * - A/B types: Blue variants
 * - AB+ (Universal Receiver): Purple - Special
 */
export function BloodTypeBadge({ bloodType, className }: BloodTypeBadgeProps) {
  const getBloodTypeStyle = (type: string) => {
    const normalized = type.toUpperCase().replace(/\s/g, "");
    
    switch (normalized) {
      case "O-":
        // Universal donor - most important
        return "bg-red-100 text-red-700 border-red-200 ring-1 ring-red-200/50";
      case "O+":
        // Common, important
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "A-":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "A+":
        return "bg-sky-100 text-sky-700 border-sky-200";
      case "B-":
        return "bg-indigo-100 text-indigo-700 border-indigo-200";
      case "B+":
        return "bg-violet-100 text-violet-700 border-violet-200";
      case "AB-":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "AB+":
        // Universal receiver - special
        return "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200 ring-1 ring-fuchsia-200/50";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-semibold text-xs px-2 py-0.5",
        getBloodTypeStyle(bloodType),
        className
      )}
    >
      {bloodType}
    </Badge>
  );
}
