"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2.5 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground",
        secondary:
          "border-transparent bg-slate-100 text-slate-700",
        destructive:
          "border-transparent bg-red-500 text-white",
        outline:
          "border-slate-200 text-slate-700 bg-white",
        // Semantic variants for status indicators
        success:
          "border-emerald-200 bg-emerald-50 text-emerald-700",
        warning:
          "border-amber-200 bg-amber-50 text-amber-700",
        error:
          "border-red-200 bg-red-50 text-red-700",
        info:
          "border-sky-200 bg-sky-50 text-sky-700",
        // Muted versions for less emphasis
        "success-subtle":
          "border-transparent bg-emerald-100/50 text-emerald-600",
        "warning-subtle":
          "border-transparent bg-amber-100/50 text-amber-600",
        "error-subtle":
          "border-transparent bg-red-100/50 text-red-600",
        "info-subtle":
          "border-transparent bg-sky-100/50 text-sky-600",
        // Solid versions for high emphasis
        "success-solid":
          "border-transparent bg-emerald-500 text-white",
        "warning-solid":
          "border-transparent bg-amber-500 text-white",
        "error-solid":
          "border-transparent bg-red-500 text-white",
        "info-solid":
          "border-transparent bg-sky-500 text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };

