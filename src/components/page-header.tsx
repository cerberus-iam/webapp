import type { ReactNode } from 'react';

import { Separator } from '@/components/ui/separator';

interface PageHeaderProps {
  /**
   * The main page title - displayed prominently
   */
  title: string;

  /**
   * Optional description/subtitle text
   */
  description?: string;

  /**
   * Optional action buttons or controls (typically a primary CTA)
   */
  actions?: ReactNode;

  /**
   * Optional badge or status indicator next to title
   */
  badge?: ReactNode;

  /**
   * Optional icon to display next to the title
   */
  icon?: ReactNode;
}

/**
 * Standardized page header component for consistent layout and typography
 * across all admin pages.
 *
 * Usage:
 * ```tsx
 * <PageHeader
 *   title="User Management"
 *   description="Manage users, roles, and permissions for your organization."
 *   actions={<Button>Add User</Button>}
 * />
 * ```
 */
export function PageHeader({
  title,
  description,
  actions,
  badge,
  icon,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 px-4 py-6 lg:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          {icon && (
            <div className="bg-primary/10 text-primary flex size-12 shrink-0 items-center justify-center rounded-xl">
              {icon}
            </div>
          )}
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
              {badge}
            </div>
            {description && (
              <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        )}
      </div>
      <Separator />
    </div>
  );
}
