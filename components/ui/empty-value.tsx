"use client";

import { cn } from "@/lib/utils";

interface EmptyValueProps {
  text?: string;
  className?: string;
}

/**
 * Styled empty value placeholder - better than plain "N/A"
 */
export function EmptyValue({ text = "Not provided", className }: EmptyValueProps) {
  return (
    <span className={cn(
      "text-slate-400 italic text-sm",
      className
    )}>
      {text}
    </span>
  );
}
