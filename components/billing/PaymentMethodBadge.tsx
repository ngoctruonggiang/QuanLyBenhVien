// components/billing/PaymentMethodBadge.tsx

interface Props {
  method: "CASH" | "CREDIT_CARD" | "BANK_TRANSFER" | "INSURANCE";
}

const methodConfig = {
  CASH: {
    label: "Cash",
    className: "bg-green-100 text-green-800",
    icon: "💵",
  },
  CREDIT_CARD: {
    label: "Card",
    className: "bg-blue-100 text-blue-800",
    icon: "💳",
  },
  BANK_TRANSFER: {
    label: "Bank",
    className: "bg-purple-100 text-purple-800",
    icon: "🏦",
  },
  INSURANCE: {
    label: "Insurance",
    className: "bg-cyan-100 text-cyan-800",
    icon: "🏥",
  },
};

export function PaymentMethodBadge({ method }: Props) {
  const config = methodConfig[method];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium ${config.className}`}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}
