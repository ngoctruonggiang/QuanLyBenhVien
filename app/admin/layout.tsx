"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { NAV_ICONS } from "@/config/icons";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Bell, Search } from "lucide-react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { cn } from "@/lib/utils";

const navigationGroups = [
  {
    label: "Tổng quan",
    items: [
      {
        title: "Bảng điều khiển",
        href: "/admin",
        icon: NAV_ICONS.dashboard,
        roles: ["ADMIN", "DOCTOR", "NURSE"],
      },
    ],
  },
  {
    label: "Quản lý bệnh nhân",
    items: [
      {
        title: "Hàng đợi",
        href: "/admin/queue",
        icon: NAV_ICONS.appointments,
        roles: ["ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST"],
      },
      {
        title: "Tiếp nhận BN",
        href: "/admin/walk-in",
        icon: NAV_ICONS.patients,
        roles: ["ADMIN", "RECEPTIONIST"],
      },
      {
        title: "Lịch hẹn",
        href: "/admin/appointments",
        icon: NAV_ICONS.appointments,
        roles: ["ADMIN", "NURSE", "RECEPTIONIST"],
      },
      {
        title: "Bệnh nhân",
        href: "/admin/patients",
        icon: NAV_ICONS.patients,
        roles: ["ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST"],
      },
    ],
  },
  {
    label: "Dịch vụ lâm sàng",
    items: [
      {
        title: "Khám bệnh",
        href: "/admin/exams",
        icon: NAV_ICONS.exams,
        roles: ["ADMIN", "DOCTOR", "NURSE"],
      },
    ],
  },
  {
    label: "Xét nghiệm",
    items: [
      {
        title: "Danh mục XN",
        href: "/admin/lab-tests",
        icon: NAV_ICONS.labTests,
        roles: ["ADMIN"],
      },
      {
        title: "Kết quả XN",
        href: "/admin/lab-results",
        icon: NAV_ICONS.labResults,
        roles: ["ADMIN", "DOCTOR", "NURSE"],
      },
      {
        title: "Yêu cầu XN",
        href: "/admin/lab-orders",
        icon: NAV_ICONS.labTests,
        roles: ["ADMIN", "DOCTOR", "NURSE"],
      },
    ],
  },
  {
    label: "Dược phẩm",
    items: [
      {
        title: "Thuốc",
        href: "/admin/medicines",
        icon: NAV_ICONS.medicines,
        roles: ["ADMIN"],
      },
    ],
  },
  {
    label: "Quản trị",
    items: [
      {
        title: "Hồ sơ của tôi",
        href: "/admin/my-profile",
        icon: NAV_ICONS.patients,
        roles: ["NURSE", "DOCTOR", "RECEPTIONIST"],
      },
      {
        title: "Lịch của tôi",
        href: "/admin/my-schedule",
        icon: NAV_ICONS.appointments,
        roles: ["NURSE", "RECEPTIONIST"],
      },
      {
        title: "Nhân sự",
        href: "/admin/hr",
        icon: NAV_ICONS.hr,
        roles: ["ADMIN"],
      },
      {
        title: "Lịch làm việc",
        href: "/admin/schedules",
        icon: NAV_ICONS.appointments,
        roles: ["ADMIN"],
      },
      {
        title: "Khoa phòng",
        href: "/admin/departments",
        icon: NAV_ICONS.hr,
        roles: ["ADMIN"],
      },
      {
        title: "Nhân viên",
        href: "/admin/employees",
        icon: NAV_ICONS.accounts,
        roles: ["ADMIN"],
      },
      {
        title: "Tài khoản",
        href: "/admin/accounts",
        icon: NAV_ICONS.accounts,
        roles: ["ADMIN"],
      },
      {
        title: "Thanh toán",
        href: "/admin/billing",
        icon: NAV_ICONS.billing,
        roles: ["ADMIN", "RECEPTIONIST"],
      },
      {
        title: "Báo cáo",
        href: "/admin/reports",
        icon: NAV_ICONS.reports,
        roles: ["ADMIN", "DOCTOR"],
      },
    ],
  },
];

function buildBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  let path = "";
  return segments.map((segment, index) => {
    path += "/" + segment;
    const name = segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

    return {
      name,
      href: path,
      isLast: index === segments.length - 1,
    };
  });
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const breadcrumbs = buildBreadcrumbs(pathname);
  const { user, logout } = useAuth();

  // Filter navigation groups and items based on user role
  const filteredGroups = navigationGroups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => user && item.roles.includes(user.role)
      ),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <RoleGuard allowedRoles={["ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST"]}>
      <SidebarProvider>
        <div className="bg-slate-50 text-foreground flex min-h-screen w-screen">
          <Sidebar className="border-r-0" collapsible="offcanvas">
            {/* Premium multi-layer background */}
            <div className="absolute inset-0 bg-[#0a0a0f]" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-transparent to-slate-950/90" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.15),transparent)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_120%,rgba(20,184,166,0.1),transparent)]" />
            
            {/* Animated floating orbs */}
            <div className="absolute top-20 left-1/2 w-32 h-32 bg-blue-500/25 rounded-full blur-3xl animate-pulse" />
            <div className="absolute top-1/3 -right-10 w-24 h-24 bg-cyan-400/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: "0.5s" }} />
            <div className="absolute bottom-1/4 -left-10 w-28 h-28 bg-teal-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
            <div className="absolute bottom-20 right-1/4 w-20 h-20 bg-emerald-400/15 rounded-full blur-2xl animate-pulse" style={{ animationDelay: "1.5s" }} />

            {/* Subtle grid pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:24px_24px]" />

            <SidebarHeader className="relative z-10 px-4 py-5 border-b border-white/[0.04]">
              <div className="flex items-center gap-3.5">
                {/* Logo */}
                <div className="bg-gradient-to-br from-cyan-400 via-blue-500 to-teal-500 text-white grid h-12 w-12 place-items-center rounded-xl text-base font-black shadow-2xl shadow-cyan-500/30 border border-white/20">
                  HMS
                </div>
                <div className="group-data-[collapsible=icon]:hidden">
                  <p className="text-base font-bold text-white tracking-wide">
                    Quản lý Bệnh viện
                  </p>
                  <p className="text-xs text-slate-400">Hệ thống Y tế</p>
                </div>
              </div>
            </SidebarHeader>

            <SidebarContent className="relative z-10 py-3 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-cyan-800/50 [&::-webkit-scrollbar-thumb]:rounded-full">
              {filteredGroups.map((group, groupIndex) => (
                <SidebarGroup key={group.label} className="mb-2">
                  <SidebarGroupLabel className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] font-bold px-5 mb-3 mt-4">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />
                    <span className="text-slate-500 whitespace-nowrap">{group.label}</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu className="px-3 space-y-1">
                      {group.items.map((item, itemIndex) => {
                        const Icon = item.icon;
                        const isActive =
                          item.href === "/admin"
                            ? pathname === "/admin"
                            : pathname.startsWith(item.href);
                        return (
                          <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                              asChild
                              isActive={isActive}
                              className={cn(
                                "relative h-11 rounded-xl px-3 font-medium transition-all duration-300 ease-out group/item overflow-hidden",
                                isActive
                                  ? "text-white"
                                  : "text-slate-400 hover:text-white"
                              )}
                            >
                              <Link href={item.href}>
                                {/* Active background gradient */}
                                {isActive && (
                                  <>
                                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/25 via-blue-500/20 to-teal-500/15" />
                                    <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] to-transparent" />
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-gradient-to-b from-cyan-400 to-teal-400 shadow-lg shadow-cyan-400/50" />
                                    <div className="absolute inset-[1px] rounded-[10px] border border-white/10" />
                                  </>
                                )}
                                
                                {/* Hover background */}
                                {!isActive && (
                                  <div className="absolute inset-0 bg-white/[0.04] opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
                                )}
                                
                                <div className={cn(
                                  "relative flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300",
                                  isActive 
                                    ? "bg-gradient-to-br from-cyan-400/30 to-teal-400/20 shadow-lg shadow-cyan-500/20" 
                                    : "group-hover/item:bg-white/[0.06]"
                                )}>
                                  <Icon
                                    className={cn(
                                      "size-[18px] transition-all duration-300",
                                      isActive 
                                        ? "text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.6)]" 
                                        : "text-slate-500 group-hover/item:text-slate-300 group-hover/item:scale-110"
                                    )}
                                  />
                                </div>
                                <span className={cn(
                                  "relative transition-all duration-300 text-sm",
                                  isActive ? "text-white font-semibold" : "group-hover/item:translate-x-0.5"
                                )}>
                                  {item.title}
                                </span>
                                {isActive && (
                                  <div className="relative ml-auto flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-lg shadow-cyan-400/80" />
                                  </div>
                                )}
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              ))}
            </SidebarContent>

            <SidebarFooter className="relative z-10 px-4 pb-5 pt-4 border-t border-white/[0.04] mt-auto">
              <div className="space-y-3">
                {/* Premium user card */}
                <div className="relative group rounded-xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative flex items-center gap-3 bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] px-3 py-3.5 group-data-[collapsible=icon]:justify-center">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="h-11 w-11 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-xl ring-2 ring-slate-900">
                        {(user?.fullName || user?.email || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                      {/* Online indicator */}
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-slate-900 flex items-center justify-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50" />
                      </div>
                    </div>
                    <div className="group-data-[collapsible=icon]:hidden">
                      <p className="text-sm font-semibold text-white truncate max-w-[120px]">
                        {user?.fullName || user?.email}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-teal-500/20 text-cyan-400 border border-cyan-500/20 uppercase tracking-wide font-medium">
                          {user?.role}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Logout button */}
                <Button
                  onClick={logout}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-300 rounded-xl group-data-[collapsible=icon]:justify-center border border-transparent hover:border-rose-500/20"
                >
                  <LogOut className="size-4 mr-2 group-data-[collapsible=icon]:mr-0" />
                  <span className="group-data-[collapsible=icon]:hidden text-[13px]">
                    Đăng xuất
                  </span>
                </Button>
              </div>
            </SidebarFooter>
          </Sidebar>

          <div className="flex-1 min-w-0 w-full">
            {/* Enhanced header */}
            <header className="sticky top-0 z-20 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
              <div className="flex h-16 w-full items-center justify-between gap-4 px-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <SidebarTrigger className="md:hidden text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg p-2" />
                  <div className="hidden sm:flex items-center gap-2 text-sm">
                    <Breadcrumb>
                      <BreadcrumbList>
                        {breadcrumbs.map((item) => (
                          <React.Fragment key={item.href}>
                            <BreadcrumbItem>
                              {item.isLast ? (
                                <span className="text-slate-900 font-medium">
                                  {item.name}
                                </span>
                              ) : (
                                <span className="text-slate-500 hover:text-slate-700 transition-colors">
                                  {item.name}
                                </span>
                              )}
                            </BreadcrumbItem>
                            {!item.isLast && (
                              <BreadcrumbSeparator className="text-slate-300" />
                            )}
                          </React.Fragment>
                        ))}
                      </BreadcrumbList>
                    </Breadcrumb>
                  </div>
                </div>

                {/* Header actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                  >
                    <Search className="size-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 relative"
                  >
                    <Bell className="size-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-sky-500 rounded-full" />
                  </Button>
                </div>
              </div>
            </header>

            <main className="w-full max-w-full py-8">
              <div className="page-shell">
                <div className="space-y-6">{children}</div>
              </div>
            </main>
          </div>
        </div>
        <Toaster />
      </SidebarProvider>
    </RoleGuard>
  );
}
