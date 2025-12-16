import * as React from "react";

import { cn } from "./utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base styles
        "flex h-10 w-full min-w-0 rounded-lg border bg-white px-3 py-2 text-sm text-slate-900",
        // Border and placeholder
        "border-slate-200 placeholder:text-slate-400",
        // Focus states - prominent sky-blue ring
        "focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500",
        // Hover state
        "hover:border-slate-300",
        // Disabled state
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200",
        // File input
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-slate-700",
        // Selection
        "selection:bg-sky-100 selection:text-sky-900",
        // Error state
        "aria-invalid:border-red-500 aria-invalid:ring-red-500/30",
        // Transition
        "transition-colors duration-150",
        className
      )}
      {...props}
    />
  );
}

export { Input };

