"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Calendar,
  Users,
  FileText,
  Stethoscope,
  Building2,
  CreditCard,
  BarChart3,
  Settings,
  TestTube,
  Pill,
  ClipboardList,
  UserCircle,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
}

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: Home },
  { title: "Appointments", href: "/appointments", icon: Calendar },
  { title: "Patients", href: "/patients", icon: Users },
  { title: "Medical Exams", href: "/exams", icon: FileText },
  { title: "Prescriptions", href: "/prescriptions", icon: ClipboardList },
  { title: "Lab Results", href: "/lab-results", icon: TestTube },
  { title: "Pharmacy", href: "/pharmacy", icon: Pill },
  { title: "Employees", href: "/employees", icon: Stethoscope, roles: ["ADMIN"] },
  { title: "Departments", href: "/departments", icon: Building2, roles: ["ADMIN"] },
  { title: "Billing", href: "/billing", icon: CreditCard },
  { title: "Reports", href: "/reports", icon: BarChart3, roles: ["ADMIN"] },
  { title: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  basePath?: string;
  role?: string;
}

export function Sidebar({ basePath = "", role = "ADMIN" }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  // Filter nav items based on role
  const visibleItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(role)
  );

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(173,58%,35%)] to-[hsl(173,58%,28%)] flex items-center justify-center text-white font-bold text-sm shadow-lg mb-4">
        HMS
      </div>

      {/* Navigation Icons */}
      <nav className="flex flex-col items-center gap-1 flex-1">
        {visibleItems.slice(0, 8).map((item) => {
          const isActive = pathname.startsWith(`${basePath}${item.href}`);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={`${basePath}${item.href}`}
              className={cn(
                "sidebar-icon",
                isActive && "active"
              )}
              title={item.title}
            >
              <Icon className="w-5 h-5" />
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="flex flex-col items-center gap-1 mt-auto pt-4 border-t border-white/10">
        <Link
          href={`${basePath}/profile`}
          className={cn(
            "sidebar-icon",
            pathname.includes("/profile") && "active"
          )}
          title="Profile"
        >
          <UserCircle className="w-5 h-5" />
        </Link>
        <button
          onClick={logout}
          className="sidebar-icon hover:bg-red-500/10 hover:text-red-500"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
