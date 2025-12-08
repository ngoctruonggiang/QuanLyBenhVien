// components/billing/PaymentStatusBadge.tsx
import { cn } from "@/lib/utils"; // Assuming cn utility
import { PaymentStatus } from "@/services/billing.service"; // Assuming PaymentStatus is exported or define here

interface Props {
  status: PaymentStatus;
  size?: "sm" | "md" | "lg";
}

const statusConfig = {
  PENDING: {
    label: "Pending",
    className: "bg-blue-100 text-blue-800 border-blue-200",
    icon: "⏳", // Placeholder icon
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-green-100 text-green-800 border-green-200",
    icon: "✅", // Placeholder icon
  },
  FAILED: {
    label: "Failed",
    className: "bg-red-100 text-red-800 border-red-200",
    icon: "❌", // Placeholder icon
  },
  REFUNDED: {
    label: "Refunded",
    className: "bg-gray-100 text-gray-800 border-gray-200",
    icon: "↩️", // Placeholder icon
  },
};

export function PaymentStatusBadge({ status, size = "md" }: Props) {
  const config = statusConfig[status];
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-0.5",
    lg: "text-base px-3 py-1",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-medium",
        config.className,
        sizeClasses[size]
      )}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}
