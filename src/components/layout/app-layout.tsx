'use client';

import { type CSSProperties, type ReactNode } from 'react';

import { RequireAuth } from '@/components/auth/require-auth';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

import { AppHeader, type AppHeaderProps } from './app-header';

type AppLayoutProps = AppHeaderProps & {
  children: ReactNode;
};

export function AppLayout({ children, title, description, breadcrumbs, actions }: AppLayoutProps) {
  return (
    <RequireAuth>
      <SidebarProvider
        style={
          {
            '--sidebar-width': 'calc(var(--spacing) * 72)',
            '--header-height': 'calc(var(--spacing) * 12)',
          } as CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
                <div className="px-4 lg:px-6">
                  <AppHeader
                    title={title}
                    description={description}
                    breadcrumbs={breadcrumbs}
                    actions={actions}
                  />
                </div>
                <main className="flex-1 px-4 pb-6 lg:px-6">{children}</main>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </RequireAuth>
  );
}
