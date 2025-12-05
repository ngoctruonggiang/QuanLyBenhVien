"use client";

interface CurrencyDisplayProps {
  amount: number;
  locale?: string;
  currency?: string;
  className?: string;
  showSymbol?: boolean;
}

export function CurrencyDisplay({
  amount,
  locale = "vi-VN",
  currency = "VND",
  className = "",
  showSymbol = true,
}: CurrencyDisplayProps) {
  const formatted = new Intl.NumberFormat(locale, {
    style: showSymbol ? "currency" : "decimal",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  return <span className={className}>{formatted}</span>;
}
