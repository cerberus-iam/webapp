'use client';

import { useCallback, useEffect, useState } from 'react';

import { useRouter } from 'next/router';

import { IconShieldCheck, IconX } from '@tabler/icons-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchFromAPI } from '@/lib/api/client-side';
import type { Permission, Role } from '@/lib/api/roles';

interface ManagePermissionsDialogProps {
  role: Role | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManagePermissionsDialog({
  role,
  open,
  onOpenChange,
}: ManagePermissionsDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [roleDetails, setRoleDetails] = useState<Role | null>(null);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<
    Set<string>
  >(new Set());

  // Load permissions and role details
  useEffect(() => {
    if (role && open) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role?.id, open]);

  const loadData = async () => {
    if (!role) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log(
        '[ManagePermissions] Loading permissions and role details for:',
        role.id
      );

      // Load all permissions via proxy
      const permissionsData = await fetchFromAPI<{
        data: Permission[];
      }>('/v1/admin/permissions?limit=100');
      console.log('[ManagePermissions] Permissions result: success');

      // Load role details with current permissions via proxy
      const roleData = await fetchFromAPI<Role>(`/v1/admin/roles/${role.id}`);
      console.log('[ManagePermissions] Role result: success');

      setAllPermissions(permissionsData.data || []);
      setRoleDetails(roleData);

      // Initialize selected permissions
      const currentPermissionIds = new Set(
        roleData.permissions?.map((p: Permission) => p.id) || []
      );
      setSelectedPermissionIds(currentPermissionIds);
    } catch (err) {
      console.error('[ManagePermissions] Error:', err);
      const errorMessage =
        err && typeof err === 'object' && 'detail' in err
          ? String(err.detail)
          : err instanceof Error
            ? err.message
            : 'Failed to load permissions';
      setError(errorMessage);
    }

    setIsLoading(false);
  };

  const handleTogglePermission = (permissionId: string) => {
    const newSet = new Set(selectedPermissionIds);
    if (newSet.has(permissionId)) {
      newSet.delete(permissionId);
    } else {
      newSet.add(permissionId);
    }
    setSelectedPermissionIds(newSet);
  };

  const handleSave = useCallback(async () => {
    if (!role || !roleDetails) return;

    setIsSaving(true);
    setError(null);

    const currentIds = new Set(
      roleDetails.permissions?.map((p: Permission) => p.id) || []
    );
    const selectedIds = selectedPermissionIds;

    // Determine which permissions to add and remove
    const toAdd = [...selectedIds].filter((id) => !currentIds.has(id));
    const toRemove = [...currentIds].filter((id) => !selectedIds.has(id));

    try {
      // Execute add operations via proxy
      for (const permissionId of toAdd) {
        await fetchFromAPI(`/v1/admin/roles/${role.id}/permissions`, {
          method: 'POST',
          body: JSON.stringify({ permissionId }),
        });
      }

      // Execute remove operations via proxy
      for (const permissionId of toRemove) {
        await fetchFromAPI(`/v1/admin/roles/${role.id}/permissions`, {
          method: 'DELETE',
          body: JSON.stringify({ permissionId }),
        });
      }

      setIsSaving(false);
      onOpenChange(false);
      router.replace(router.asPath);
    } catch (err) {
      const errorMessage =
        err && typeof err === 'object' && 'detail' in err
          ? String(err.detail)
          : err instanceof Error
            ? err.message
            : 'Failed to update permissions';
      setError(errorMessage);
      setIsSaving(false);
    }
  }, [role, roleDetails, selectedPermissionIds, onOpenChange, router]);

  const filteredPermissions = allPermissions.filter((permission) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      permission.name.toLowerCase().includes(query) ||
      permission.description?.toLowerCase().includes(query)
    );
  });

  if (!role) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[80vh] flex-col sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Manage Permissions</DialogTitle>
          <DialogDescription>
            Assign or remove permissions for <strong>{role.name}</strong> role.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-1 flex-col overflow-hidden py-4">
          {error && (
            <div
              role="alert"
              className="border-destructive text-destructive bg-destructive/10 mb-4 rounded-md border px-3 py-2 text-sm"
            >
              {error}
            </div>
          )}

          <div className="mb-4">
            <Input
              placeholder="Search permissions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="bg-muted mb-3 flex items-center justify-between rounded-md px-3 py-2">
            <span className="text-muted-foreground text-sm">
              {selectedPermissionIds.size} of {allPermissions.length} selected
            </span>
            {selectedPermissionIds.size > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedPermissionIds(new Set())}
              >
                <IconX className="mr-1 size-3" />
                Clear all
              </Button>
            )}
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto">
            {isLoading ? (
              <>
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center space-x-3 rounded-md border p-3"
                  >
                    <Skeleton className="size-4" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                ))}
              </>
            ) : filteredPermissions.length === 0 ? (
              <div className="text-muted-foreground py-8 text-center text-sm">
                {searchQuery
                  ? 'No permissions found matching your search.'
                  : 'No permissions available.'}
              </div>
            ) : (
              filteredPermissions.map((permission) => (
                <div
                  key={permission.id}
                  className="hover:bg-muted/50 flex items-start space-x-3 rounded-md border p-3"
                >
                  <Checkbox
                    checked={selectedPermissionIds.has(permission.id)}
                    onCheckedChange={() =>
                      handleTogglePermission(permission.id)
                    }
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-xs">
                        {permission.name}
                      </code>
                      {permission.isSystemPermission && (
                        <Badge variant="outline" className="gap-1">
                          <IconShieldCheck className="size-3" />
                          System
                        </Badge>
                      )}
                    </div>
                    {permission.description && (
                      <p className="text-muted-foreground text-sm">
                        {permission.description}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isLoading}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
