// components/billing/PaymentStatusBadge.tsx
import { cn } from "@/lib/utils"; // Assuming cn utility
import { PaymentStatus } from "@/interfaces/billing"; // Assuming PaymentStatus is exported or define here

interface Props {
  status: PaymentStatus;
  size?: "sm" | "md" | "lg";
}

const statusConfig: Record<PaymentStatus, { label: string; className: string; icon: string }> = {
  PENDING: {
    label: "Pending",
    className: "bg-blue-100 text-blue-800 border-blue-200",
    icon: "⏳",
  },
  PROCESSING: {
    label: "Processing",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: "🔄",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-green-100 text-green-800 border-green-200",
    icon: "✅",
  },
  FAILED: {
    label: "Failed",
    className: "bg-red-100 text-red-800 border-red-200",
    icon: "❌",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-gray-100 text-gray-600 border-gray-200",
    icon: "🚫",
  },
  EXPIRED: {
    label: "Expired",
    className: "bg-orange-100 text-orange-800 border-orange-200",
    icon: "⏰",
  },
  REFUNDED: {
    label: "Refunded",
    className: "bg-purple-100 text-purple-800 border-purple-200",
    icon: "↩️",
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
        sizeClasses[size],
      )}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}
