"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EmptyReportState({
  title,
  description,
  icon: Icon,
  actionLabel,
  onRetry,
  className,
}: {
  title?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  actionLabel?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center text-muted-foreground",
        className,
      )}
    >
      {Icon ? <Icon className="h-10 w-10 opacity-60" /> : null}
      {title ? (
        <p className="text-sm font-medium text-foreground">{title}</p>
      ) : null}
      {description ? <p className="text-sm">{description}</p> : null}
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          {actionLabel || "Thử lại"}
        </Button>
      ) : null}
    </div>
  );
}
