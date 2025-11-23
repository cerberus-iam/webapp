import { useEffect, useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/lib/api/client';
import { InvitationsApi } from '@/lib/api/invitations';
import { type Role, RolesApi } from '@/lib/api/roles';

interface CreateInvitationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateInvitationDialog({
  open,
  onOpenChange,
}: CreateInvitationDialogProps) {
  const [email, setEmail] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRoles = async () => {
    setLoadingRoles(true);
    const rolesApi = new RolesApi(apiClient);

    const result = await rolesApi.list({ limit: 100 });
    setLoadingRoles(false);

    if (!result.ok) {
      console.error('Failed to load roles:', result.error);
      return;
    }

    setRoles(result.value.data);
  };

  useEffect(() => {
    if (open && roles.length === 0) {
      loadRoles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleRoleToggle = (roleId: string) => {
    const newSelected = new Set(selectedRoles);
    if (newSelected.has(roleId)) {
      newSelected.delete(roleId);
    } else {
      newSelected.add(roleId);
    }
    setSelectedRoles(newSelected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedRoles.size === 0) {
      setError('Please select at least one role');
      return;
    }

    setLoading(true);
    setError(null);

    const invitationsApi = new InvitationsApi(apiClient);

    const result = await invitationsApi.create({
      email,
      roleIds: Array.from(selectedRoles),
    });

    setLoading(false);

    if (!result.ok) {
      const err = result.error as { detail?: string; title?: string };
      setError(err.detail || err.title || 'Failed to send invitation');
      return;
    }

    window.location.reload();
  };

  const handleClose = () => {
    setEmail('');
    setSelectedRoles(new Set());
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send Invitation</DialogTitle>
          <DialogDescription>
            Invite a new member to join your organization
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Roles</Label>
            {loadingRoles ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              <div className="max-h-[300px] space-y-3 overflow-y-auto rounded-md border p-4">
                {roles.map((role, index) => (
                  <div key={role.id}>
                    <div className="flex items-start space-x-3 py-2">
                      <Checkbox
                        id={role.id}
                        checked={selectedRoles.has(role.id)}
                        onCheckedChange={() => handleRoleToggle(role.id)}
                        className="mt-0.5"
                      />
                      <label
                        htmlFor={role.id}
                        className="flex-1 cursor-pointer space-y-1 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        <div className="text-sm leading-none font-semibold">
                          {role.name}
                        </div>
                        {role.description && (
                          <div className="text-muted-foreground text-xs leading-relaxed font-normal">
                            {role.description}
                          </div>
                        )}
                      </label>
                    </div>
                    {index < roles.length - 1 && <div className="border-b" />}
                  </div>
                ))}
              </div>
            )}
            <p className="text-muted-foreground text-xs">
              Select at least one role to assign to the invited user
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || loadingRoles}>
              {loading ? 'Sending...' : 'Send Invitation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
