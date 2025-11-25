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
    <div className="bg-muted/30 flex flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center md:p-16">
      <div className="bg-primary/10 mb-6 flex size-16 items-center justify-center rounded-2xl">
        {Icon && <Icon className="text-primary size-8" />}
      </div>
      <h3 className="mb-2 text-lg font-semibold tracking-tight">{title}</h3>
      {description && (
        <p className="text-muted-foreground mb-8 max-w-sm text-sm leading-relaxed">
          {description}
        </p>
      )}
      {(action || secondaryAction) && (
        <div className="flex flex-col gap-3 sm:flex-row">
          {action && (
            <Button onClick={action.onClick} size="default">
              {action.label}
            </Button>
          )}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
