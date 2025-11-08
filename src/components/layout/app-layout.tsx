"use client";

import { type ReactNode } from "react";

import { RequireAuth } from "@/components/auth/require-auth";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { AppHeader, type AppHeaderProps } from "./app-header";
import { AppSidebar } from "./app-sidebar";

type AppLayoutProps = AppHeaderProps & {
  children: ReactNode;
};

export function AppLayout({ children, title, description, breadcrumbs, actions }: AppLayoutProps) {
  return (
    <RequireAuth>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background">
          <AppSidebar />
          <SidebarInset className="flex min-h-screen flex-1 flex-col">
            <AppHeader
              title={title}
              description={description}
              breadcrumbs={breadcrumbs}
              actions={actions}
            />
            <main className="flex-1 px-6 py-6">{children}</main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </RequireAuth>
  );
}
