'use client';

import { Fragment, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Bell, Filter, Search } from 'lucide-react';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export type AppBreadcrumbItem = {
  label: string;
  href?: string;
};

export type AppHeaderProps = {
  title: string;
  description?: string;
  breadcrumbs?: AppBreadcrumbItem[];
  actions?: ReactNode;
};

export function AppHeader({ title, description, breadcrumbs, actions }: AppHeaderProps) {
  const router = useRouter();
  const items = breadcrumbs?.length
    ? breadcrumbs
    : [{ label: 'Dashboard', href: '/' }, { label: title }];

  return (
    <header className="flex flex-col gap-4 border-b bg-background/70 px-6 py-4 backdrop-blur supports-backdrop-filter:bg-background/50">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="-ml-2" />
          <Separator orientation="vertical" className="h-6" />
          <Breadcrumb>
            <BreadcrumbList>
              {items.map((item, index) => {
                const isLast = index === items.length - 1;

                return (
                  <Fragment key={`${item.label}-${index}`}>
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage>{item.label}</BreadcrumbPage>
                      ) : item.href ? (
                        <BreadcrumbLink asChild>
                          <Link href={item.href}>{item.label}</Link>
                        </BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage>{item.label}</BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                    {!isLast && <BreadcrumbSeparator />}
                  </Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative hidden sm:block">
            <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
            <Input
              type="search"
              placeholder="Search users, roles, policies..."
              className="pl-9"
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  const value = event.currentTarget.value.trim();
                  void router.push(value ? `/search?q=${encodeURIComponent(value)}` : '/search');
                }
              }}
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="size-9 sm:hidden"
            aria-label="Open search"
            onClick={() => void router.push('/search')}
          >
            <Search className="size-4" />
          </Button>
          <Button variant="outline" size="icon" className="size-9" aria-label="Filter">
            <Filter className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="size-9" aria-label="Notifications">
            <Bell className="size-4" />
          </Button>
          <ThemeToggle />
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions}
      </div>
    </header>
  );
}
