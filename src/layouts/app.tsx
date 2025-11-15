import type { ReactNode } from 'react'

import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

interface AppLayoutProps {
  children: ReactNode
  user?: {
    name: string | null
    firstName?: string | null
    lastName?: string | null
    email: string
  }
  breadcrumbs?: Array<{
    label: string
    href?: string
  }>
  title?: string
  docsUrl?: string
}

export function AppLayout({
  children,
  user,
  breadcrumbs = [],
  title,
  docsUrl,
}: AppLayoutProps) {
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" user={user} />
      <SidebarInset>
        <SiteHeader
          breadcrumbs={breadcrumbs}
          title={title || breadcrumbs[breadcrumbs.length - 1]?.label || ''}
          docsUrl={docsUrl}
        />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
