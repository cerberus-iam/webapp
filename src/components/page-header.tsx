import type { ReactNode } from 'react';

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
}: PageHeaderProps) {
  return (
    <div className="bg-background flex flex-col gap-4 border-b px-4 py-5 lg:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">
              {title}
            </h1>
            {badge}
          </div>
          {description && (
            <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed lg:text-base">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        )}
      </div>
    </div>
  );
}
