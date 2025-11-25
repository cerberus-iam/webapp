import Link from 'next/link';

import {
  IconChevronDown,
  IconExternalLink,
  IconHash,
  IconSettings,
} from '@tabler/icons-react';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { urls } from '@/config/urls';
import type { OrganisationSummary } from '@/types/iam';

interface SiteHeaderProps {
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
  title: string;
  docsUrl?: string;
  organisation?: OrganisationSummary;
}

export function SiteHeader({
  breadcrumbs = [],
  // title prop is part of the interface but not used in current implementation
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  title,
  docsUrl = urls.docs,
  organisation,
}: SiteHeaderProps) {
  return (
    <header className="bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 flex h-(--header-height) shrink-0 items-center gap-2 rounded-t-xl border-b backdrop-blur transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <div className="flex flex-col gap-1">
          {breadcrumbs.length > 0 && (
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((crumb, index) => (
                  <div key={index} className="contents">
                    <BreadcrumbItem>
                      {crumb.href ? (
                        <BreadcrumbLink asChild>
                          <Link href={crumb.href}>{crumb.label}</Link>
                        </BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                    {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                  </div>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          )}
        </div>
        <div className="ml-auto flex items-center gap-3">
          {organisation && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden h-9 gap-2 px-3 md:flex"
                  >
                    <span className="max-w-40 truncate font-medium">
                      {organisation.name}
                    </span>
                    <IconChevronDown className="text-muted-foreground size-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm leading-none font-medium">
                        {organisation.name}
                      </p>
                      <p className="text-muted-foreground flex items-center gap-1 text-xs leading-none">
                        <IconHash className="size-3" />
                        {organisation.slug}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      href="/settings/organisation"
                      className="flex items-center gap-2"
                    >
                      <IconSettings className="size-4" />
                      Organisation Settings
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Separator
                orientation="vertical"
                className="hidden h-6 md:block"
              />
            </>
          )}
          <Button
            variant="outline"
            asChild
            size="sm"
            className="hidden gap-2 sm:flex"
          >
            <a
              href={docsUrl}
              rel="noopener noreferrer"
              target="_blank"
              className="flex items-center"
            >
              <IconExternalLink className="size-4" />
              <span>Docs</span>
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
