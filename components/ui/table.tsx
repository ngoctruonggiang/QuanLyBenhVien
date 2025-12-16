"use client";

import * as React from "react";

import { cn } from "./utils";

interface TableProps extends React.ComponentProps<"table"> {
  /** Enable alternating row colors for better readability */
  zebra?: boolean;
  /** Make header sticky when scrolling */
  stickyHeader?: boolean;
}

function Table({ className, zebra, stickyHeader, ...props }: TableProps) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        data-zebra={zebra ? "true" : undefined}
        data-sticky-header={stickyHeader ? "true" : undefined}
        className={cn("w-full caption-bottom text-sm border-collapse", className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn(
        "bg-sky-100 border-b border-sky-200",
        // Sticky header support - parent table needs data-sticky-header
        "[[data-sticky-header]_&]:sticky [[data-sticky-header]_&]:top-0 [[data-sticky-header]_&]:z-10",
        className
      )}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn(
        "[&_tr:last-child]:border-0",
        // Zebra striping support - parent table needs data-zebra
        "[[data-zebra]_&]_[&_tr:nth-child(even)]:bg-slate-50/50",
        className
      )}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-slate-50 border-t border-slate-200 font-medium [&>tr]:last:border-b-0",
        className,
      )}
      {...props}
    />
  );
}

interface TableRowProps extends React.ComponentProps<"tr"> {
  /** Accent color for hover effect */
  accent?: "sky" | "violet" | "teal" | "emerald" | "rose" | "amber";
}

function TableRow({ className, accent = "sky", ...props }: TableRowProps) {
  return (
    <tr
      data-slot="table-row"
      data-accent={accent}
      className={cn(
        // Base styles
        "border-b border-slate-100 relative",
        // Smooth transitions
        "transition-all duration-150 ease-out",
        // Left accent border (hidden by default)
        "before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0",
        "before:transition-all before:duration-150 before:ease-out",
        // Hover effects - slide and accent (default to sky to match header)
        "hover:bg-gradient-to-r hover:from-sky-50/80 hover:to-transparent",
        "hover:translate-x-1",
        "hover:before:w-1",
        // Accent colors via data attribute
        "data-[accent=sky]:hover:from-sky-50/60 data-[accent=sky]:before:bg-sky-500",
        "data-[accent=violet]:hover:from-violet-50/60 data-[accent=violet]:before:bg-violet-500",
        "data-[accent=teal]:hover:from-teal-50/60 data-[accent=teal]:before:bg-teal-500",
        "data-[accent=emerald]:hover:from-emerald-50/60 data-[accent=emerald]:before:bg-emerald-500",
        "data-[accent=rose]:hover:from-rose-50/60 data-[accent=rose]:before:bg-rose-500",
        "data-[accent=amber]:hover:from-amber-50/60 data-[accent=amber]:before:bg-amber-500",
        // Selected state
        "data-[state=selected]:bg-sky-50 data-[state=selected]:border-sky-200",
        "data-[state=selected]:before:w-1 data-[state=selected]:translate-x-1",
        // Clickable row indicator
        "[&[data-clickable]]:cursor-pointer",
        className,
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        // Typography
        "text-xs font-semibold uppercase tracking-wider text-slate-600",
        // Spacing
        "h-11 px-4 text-left align-middle",
        // Background (inherited from thead)
        "bg-transparent",
        // Sortable indicator
        "[&[data-sortable]]:cursor-pointer [&[data-sortable]]:select-none",
        "[&[data-sortable]:hover]:text-slate-900",
        // Checkbox alignment
        "[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        // Whitespace
        "whitespace-nowrap",
        className,
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        // Spacing
        "px-4 py-3 align-middle",
        // Typography - improved contrast
        "text-sm text-slate-700",
        // Primary data emphasis
        "[&[data-primary]]:font-medium [&[data-primary]]:text-slate-900",
        // Muted data de-emphasis
        "[&[data-muted]]:text-slate-500",
        // Checkbox alignment
        "[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        // Actions column right-align
        "[&[data-actions]]:text-right [&[data-actions]]:w-[1%]",
        className,
      )}
      {...props}
    />
  );
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-slate-500 mt-4 text-sm", className)}
      {...props}
    />
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};

