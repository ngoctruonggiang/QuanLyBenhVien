"use client";

import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: ReactNode;
  basePath?: string;
  role?: string;
  title?: string;
  tabs?: { label: string; href: string; active?: boolean }[];
  showSidePanel?: boolean;
  sidePanel?: ReactNode;
}

export function MainLayout({
  children,
  basePath = "",
  role = "ADMIN",
  title,
  tabs,
  showSidePanel = false,
  sidePanel,
}: MainLayoutProps) {
  return (
    <div className={cn("main-layout", showSidePanel && "with-panel")}>
      {/* Sidebar */}
      <Sidebar basePath={basePath} role={role} />

      {/* Main Content Area */}
      <div className="content-area">
        {/* Top Navigation */}
        <TopNav title={title} tabs={tabs} />

        {/* Page Content */}
        <main className="py-6 animate-fadeIn">
          {children}
        </main>
      </div>

      {/* Optional Side Panel */}
      {showSidePanel && sidePanel && (
        <aside className="side-panel animate-slideIn">
          {sidePanel}
        </aside>
      )}
    </div>
  );
}

export default MainLayout;
