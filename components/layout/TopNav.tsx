"use client";

import { Bell, Search, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface TopNavProps {
  title?: string;
  tabs?: { label: string; href: string; active?: boolean }[];
}

export function TopNav({ title, tabs }: TopNavProps) {
  const { user } = useAuth();

  return (
    <header className="topnav">
      {/* Left Section */}
      <div className="flex items-center gap-6">
        {/* Title or Tabs */}
        {tabs && tabs.length > 0 ? (
          <nav className="nav-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.href}
                className={cn("nav-tab", tab.active && "active")}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        ) : (
          <h1 className="text-title">{title}</h1>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="search-input hidden md:flex">
          <Search className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
          <input type="text" placeholder="Search..." />
        </div>

        {/* Notifications */}
        <button className="btn-icon relative">
          <Bell className="w-5 h-5" />
          <span className="notification-badge">3</span>
        </button>

        {/* User Profile */}
        <button className="flex items-center gap-3 py-2 px-3 rounded-full hover:bg-[hsl(var(--secondary))] transition-colors">
          <div className="avatar">
            {user?.fullName?.charAt(0) || user?.email?.charAt(0) || "U"}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-[hsl(var(--foreground))]">
              {user?.fullName || user?.email || "User"}
            </p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              {user?.role || "Staff"}
            </p>
          </div>
          <ChevronDown className="w-4 h-4 text-[hsl(var(--muted-foreground))] hidden md:block" />
        </button>
      </div>
    </header>
  );
}

export default TopNav;
