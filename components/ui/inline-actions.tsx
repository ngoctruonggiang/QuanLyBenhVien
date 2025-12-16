"use client";

import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import Link from "next/link";

interface InlineAction {
  icon: ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: "default" | "destructive";
}

interface InlineActionsProps {
  actions: InlineAction[];
  /** Show actions only on hover */
  showOnHover?: boolean;
  className?: string;
}

export function InlineActions({
  actions,
  showOnHover = true,
  className,
}: InlineActionsProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-1",
        showOnHover && "opacity-0 group-hover:opacity-100 transition-opacity duration-150",
        className
      )}
    >
      {actions.map((action, idx) => {
        const buttonContent = (
          <Button
            key={idx}
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 rounded-lg",
              action.variant === "destructive" 
                ? "text-slate-400 hover:text-rose-600 hover:bg-rose-50" 
                : "text-slate-400 hover:text-slate-900 hover:bg-slate-100"
            )}
            onClick={action.onClick}
            title={action.label}
          >
            {action.icon}
          </Button>
        );

        if (action.href) {
          return (
            <Link key={idx} href={action.href}>
              {buttonContent}
            </Link>
          );
        }

        return buttonContent;
      })}
    </div>
  );
}

// Pre-built action buttons for common use cases
export function ViewAction({ href }: { href: string }) {
  return { icon: <Eye className="h-4 w-4" />, label: "View", href };
}

export function EditAction({ href, onClick }: { href?: string; onClick?: () => void }) {
  return { icon: <Pencil className="h-4 w-4" />, label: "Edit", href, onClick };
}

export function DeleteAction({ onClick }: { onClick: () => void }) {
  return { 
    icon: <Trash2 className="h-4 w-4" />, 
    label: "Delete", 
    onClick, 
    variant: "destructive" as const 
  };
}
