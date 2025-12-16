/**
 * Format a number in compact notation (e.g., 1.2K, 3.5M)
 */
export function formatCompactNumber(num: number): string {
  if (num < 1000) return num.toString();
  
  const suffixes = ["", "K", "M", "B", "T"];
  const magnitude = Math.floor(Math.log10(Math.abs(num)) / 3);
  const scaled = num / Math.pow(1000, magnitude);
  
  // Use 1 decimal place if needed
  const formatted = scaled % 1 === 0 
    ? scaled.toString() 
    : scaled.toFixed(1);
  
  return `${formatted}${suffixes[magnitude]}`;
}

/**
 * Format currency in Vietnamese Dong (compact for large values)
 */
export function formatCurrencyCompact(amount: number): string {
  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(1)}B ₫`;
  }
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M ₫`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K ₫`;
  }
  return `${amount.toLocaleString("vi-VN")} ₫`;
}

/**
 * Format a date relative to now (e.g., "2 days ago", "in 3 hours")
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const target = typeof date === "string" ? new Date(date) : date;
  const diffMs = target.getTime() - now.getTime();
  const diffSecs = Math.abs(diffMs / 1000);
  const diffMins = diffSecs / 60;
  const diffHours = diffMins / 60;
  const diffDays = diffHours / 24;
  const diffWeeks = diffDays / 7;
  const diffMonths = diffDays / 30;
  
  const isPast = diffMs < 0;
  const prefix = isPast ? "" : "in ";
  const suffix = isPast ? " ago" : "";
  
  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${prefix}${Math.round(diffMins)}m${suffix}`;
  if (diffHours < 24) return `${prefix}${Math.round(diffHours)}h${suffix}`;
  if (diffDays < 7) return `${prefix}${Math.round(diffDays)}d${suffix}`;
  if (diffWeeks < 4) return `${prefix}${Math.round(diffWeeks)}w${suffix}`;
  if (diffMonths < 12) return `${prefix}${Math.round(diffMonths)}mo${suffix}`;
  
  const diffYears = diffDays / 365;
  return `${prefix}${Math.round(diffYears)}y${suffix}`;
}

/**
 * Truncate text with ellipsis and title for full text
 */
export function TruncatedText({ 
  text, 
  maxLength = 30,
  className = "" 
}: { 
  text: string; 
  maxLength?: number;
  className?: string;
}) {
  if (text.length <= maxLength) {
    return <span className={className}>{text}</span>;
  }
  
  return (
    <span 
      className={`${className} cursor-help`} 
      title={text}
    >
      {text.substring(0, maxLength)}...
    </span>
  );
}
