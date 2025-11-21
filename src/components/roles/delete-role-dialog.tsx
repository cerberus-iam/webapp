'use client';

import { useCallback, useState } from 'react';

import { useRouter } from 'next/router';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { apiClient } from '@/lib/api/client';
import { getProblemMessage } from '@/lib/api/error-utils';
import type { Role } from '@/lib/api/roles';
import { RolesApi } from '@/lib/api/roles';

interface DeleteRoleDialogProps {
  role: Role | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const rolesApi = new RolesApi(apiClient);

export function DeleteRoleDialog({
  role,
  open,
  onOpenChange,
}: DeleteRoleDialogProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = useCallback(async () => {
    if (!role) return;

    setIsDeleting(true);
    setError(null);

    const result = await rolesApi.delete(role.id);

    if (result.ok) {
      onOpenChange(false);
      router.replace(router.asPath);
    } else {
      setError(getProblemMessage(result.error));
    }

    setIsDeleting(false);
  }, [onOpenChange, router, role]);

  if (!role) return null;

  const userCount = role._count?.users || 0;
  const permissionCount = role.permissionCount || role.permissions?.length || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Delete Role</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this role? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {error && (
            <div
              role="alert"
              className="border-destructive text-destructive bg-destructive/10 mb-4 rounded-md border px-3 py-2 text-sm"
            >
              {error}
            </div>
          )}

          <div className="bg-muted rounded-md p-4">
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground font-medium">Name:</span>{' '}
                {role.name}
              </div>
              <div>
                <span className="text-muted-foreground font-medium">Slug:</span>{' '}
                <code className="bg-background rounded px-1.5 py-0.5 font-mono text-xs">
                  {role.slug}
                </code>
              </div>
              {role.description && (
                <div>
                  <span className="text-muted-foreground font-medium">
                    Description:
                  </span>{' '}
                  {role.description}
                </div>
              )}
              <div>
                <span className="text-muted-foreground font-medium">
                  Permissions:
                </span>{' '}
                {permissionCount}
              </div>
              <div>
                <span className="text-muted-foreground font-medium">
                  Users:
                </span>{' '}
                {userCount}
              </div>
            </div>
          </div>

          {userCount > 0 && (
            <div className="mt-4 rounded-md border border-amber-500 bg-amber-500/10 px-3 py-2 text-sm text-amber-600 dark:text-amber-400">
              <strong>Warning:</strong> This role is currently assigned to{' '}
              {userCount} user{userCount !== 1 ? 's' : ''}. Deleting it will
              remove the role from all users.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Role'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
