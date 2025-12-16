"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, Info, CheckCircle, XCircle } from "lucide-react";

interface AlertBannerProps {
  /** Type of alert determines color and icon */
  type: "info" | "warning" | "success" | "error";
  /** Title text */
  title: string;
  /** Description text */
  description?: string;
  /** Custom icon (overrides default) */
  icon?: ReactNode;
  /** Additional action element */
  action?: ReactNode;
  className?: string;
}

const typeStyles = {
  info: {
    container: "bg-sky-50 border-sky-500",
    icon: "text-sky-500",
    title: "text-sky-800",
    description: "text-sky-700",
    defaultIcon: <Info className="h-5 w-5" />,
  },
  warning: {
    container: "bg-amber-50 border-amber-500",
    icon: "text-amber-500",
    title: "text-amber-800",
    description: "text-amber-700",
    defaultIcon: <AlertTriangle className="h-5 w-5" />,
  },
  success: {
    container: "bg-emerald-50 border-emerald-500",
    icon: "text-emerald-500",
    title: "text-emerald-800",
    description: "text-emerald-700",
    defaultIcon: <CheckCircle className="h-5 w-5" />,
  },
  error: {
    container: "bg-red-50 border-red-500",
    icon: "text-red-500",
    title: "text-red-800",
    description: "text-red-700",
    defaultIcon: <XCircle className="h-5 w-5" />,
  },
};

export function AlertBanner({
  type,
  title,
  description,
  icon,
  action,
  className,
}: AlertBannerProps) {
  const styles = typeStyles[type];

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-lg border-l-4",
        styles.container,
        className
      )}
    >
      <div className={cn("shrink-0 mt-0.5", styles.icon)}>
        {icon || styles.defaultIcon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className={cn("font-semibold", styles.title)}>{title}</h4>
        {description && (
          <p className={cn("text-sm mt-1", styles.description)}>
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
