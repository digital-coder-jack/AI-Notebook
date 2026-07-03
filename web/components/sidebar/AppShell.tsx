"use client";

import React from "react";
import { SidebarProvider } from "./SidebarProvider";
import { DesktopSidebar } from "./DesktopSidebar";
import { MobileDrawer } from "./MobileDrawer";
import { CommandPalette } from "./CommandPalette";

/**
 * App shell: wires up the sidebar system around your page content.
 *
 * Usage:
 *   <AppShell>
 *     <YourPage />
 *   </AppShell>
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-dvh">
        <DesktopSidebar />
        <MobileDrawer />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
      <CommandPalette />
    </SidebarProvider>
  );
}
