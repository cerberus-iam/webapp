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
import { UsersApi } from '@/lib/api/users';
import type { User } from '@/types/iam';

interface DeleteUserDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const usersApi = new UsersApi(apiClient);

export function DeleteUserDialog({
  user,
  open,
  onOpenChange,
}: DeleteUserDialogProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = useCallback(async () => {
    if (!user) return;

    setIsDeleting(true);
    setError(null);

    const result = await usersApi.delete(user.id);

    if (result.ok) {
      onOpenChange(false);
      router.replace(router.asPath);
    } else {
      setError(getProblemMessage(result.error));
    }

    setIsDeleting(false);
  }, [onOpenChange, router, user]);

  if (!user) return null;

  const displayName =
    user.name ||
    (user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName || user.lastName || user.email);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Delete User</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this user? This action cannot be
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
                {displayName}
              </div>
              <div>
                <span className="text-muted-foreground font-medium">
                  Email:
                </span>{' '}
                {user.email}
              </div>
              {user.roles.length > 0 && (
                <div>
                  <span className="text-muted-foreground font-medium">
                    Roles:
                  </span>{' '}
                  {user.roles.map((r) => r.name).join(', ')}
                </div>
              )}
            </div>
          </div>
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
            {isDeleting ? 'Deleting...' : 'Delete User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
