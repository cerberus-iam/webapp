import type { ReactNode } from 'react';

import type { LucideIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  /**
   * Icon to display (from lucide-react)
   */
  icon?: LucideIcon;

  /**
   * Title/heading for the empty state
   */
  title: string;

  /**
   * Description text explaining why it's empty or what to do
   */
  description?: string;

  /**
   * Optional primary action button
   */
  action?: {
    label: string;
    onClick: () => void;
  };

  /**
   * Optional secondary action or link
   */
  secondaryAction?: ReactNode;
}

/**
 * Standardized empty state component for tables and lists
 *
 * Usage:
 * ```tsx
 * <EmptyState
 *   icon={Users}
 *   title="No users found"
 *   description="Get started by creating your first user."
 *   action={{
 *     label: "Add User",
 *     onClick: () => setDialogOpen(true)
 *   }}
 * />
 * ```
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center md:p-12">
      <div className="bg-muted/50 mb-4 flex h-20 w-20 items-center justify-center rounded-full">
        {Icon && <Icon className="text-muted-foreground h-10 w-10" />}
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      {description && (
        <p className="text-muted-foreground mb-6 max-w-md text-sm">
          {description}
        </p>
      )}
      {(action || secondaryAction) && (
        <div className="flex flex-col gap-2 sm:flex-row">
          {action && (
            <Button onClick={action.onClick} size="sm">
              {action.label}
            </Button>
          )}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
