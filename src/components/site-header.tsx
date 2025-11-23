import Link from 'next/link';

import { IconBuilding, IconExternalLink } from '@tabler/icons-react';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
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
  docsUrl = 'https://docs.cerberus-iam.com',
  organisation,
}: SiteHeaderProps) {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
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
        <div className="ml-auto flex items-center gap-2">
          {organisation && (
            <>
              <div className="text-muted-foreground hidden items-center gap-1.5 text-sm md:flex">
                <IconBuilding className="size-4" />
                <span className="font-medium">{organisation.name}</span>
                {organisation.slug && (
                  <span className="text-muted-foreground/60">
                    ({organisation.slug})
                  </span>
                )}
              </div>
              <Separator
                orientation="vertical"
                className="mx-2 hidden data-[orientation=vertical]:h-4 md:block"
              />
            </>
          )}
          <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            <a
              href={docsUrl}
              rel="noopener noreferrer"
              target="_blank"
              className="dark:text-foreground flex items-center gap-1.5"
            >
              <IconExternalLink className="size-4" />
              Documentation
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
