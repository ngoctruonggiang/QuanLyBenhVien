"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useMemo } from "react";

const navItems = [
  { title: "Dashboard", href: "/admin", icon: NAV_ICONS.dashboard },
  { title: "Appointments", href: "/admin/appointments", icon: NAV_ICONS.appointments },
  { title: "Examinations", href: "/admin/exams", icon: NAV_ICONS.exams },
  { title: "Patients", href: "/admin/patients", icon: NAV_ICONS.patients },
  { title: "Medicines", href: "/admin/medicines", icon: NAV_ICONS.medicines },
  { title: "HR Management", href: "/admin/hr", icon: NAV_ICONS.hr },
  { title: "Billing", href: "/admin/billing", icon: NAV_ICONS.billing },
  { title: "Reports", href: "/admin/reports", icon: NAV_ICONS.reports },
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
  const queryClient = useMemo(() => new QueryClient(), []);

  return (
    <QueryClientProvider client={queryClient}>
      <SidebarProvider>
        <div className="bg-muted/40 text-foreground flex min-h-screen w-screen">
          <Sidebar className="border-r" collapsible="icon">
            <SidebarHeader className="gap-2 px-4 py-4">
              <div className="bg-primary text-primary-foreground grid h-10 w-10 place-items-center rounded-lg text-sm font-semibold">
                HMS
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold">Health Management</p>
                <p className="text-xs text-muted-foreground">Hospital System</p>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname.startsWith(item.href);
                      return (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            className="h-10 rounded-lg"
                          >
                            <Link href={item.href}>
                              <Icon className="size-4" />
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="px-4 pb-4">
              <div className="flex items-center justify-between rounded-lg border px-3 py-2">
                <div>
                  <p className="text-sm font-medium">Admin</p>
                  <p className="text-xs text-muted-foreground">System access</p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-muted-foreground"
                >
                  <SidebarTrigger className="size-5" />
                </Button>
              </div>
            </SidebarFooter>
            <SidebarRail />
          </Sidebar>

          <div className="flex-1 min-w-0 w-full">
            <header className="sticky top-0 z-20 w-full border-b bg-background/80 backdrop-blur">
              <div className="flex h-14 w-full items-center gap-3 px-3 sm:px-5">
                <SidebarTrigger className="md:hidden" />
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Breadcrumb>
                    <BreadcrumbList>
                      {breadcrumbs.map((item) => (
                        <React.Fragment key={item.href}>
                          <BreadcrumbItem>
                            {item.isLast ? (
                              <span className="text-foreground font-medium">
                                {item.name}
                              </span>
                            ) : (
                              <span>{item.name}</span>
                            )}
                          </BreadcrumbItem>
                          {!item.isLast && <BreadcrumbSeparator />}
                        </React.Fragment>
                      ))}
                    </BreadcrumbList>
                  </Breadcrumb>
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
    </QueryClientProvider>
  );
}
