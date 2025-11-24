import { useEffect, useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
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

    // Pre-select Staff role if available, otherwise first role
    const staffRole = result.value.data.find(
      (r) => r.slug === 'staff' || r.name.toLowerCase() === 'staff'
    );
    if (staffRole) {
      setSelectedRoleId(staffRole.id);
    } else if (result.value.data.length > 0) {
      setSelectedRoleId(result.value.data[0].id);
    }
  };

  useEffect(() => {
    if (open && roles.length === 0) {
      loadRoles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRoleId) {
      setError('Please select a role');
      return;
    }

    setLoading(true);
    setError(null);

    const invitationsApi = new InvitationsApi(apiClient);

    const result = await invitationsApi.create({
      email,
      roleId: selectedRoleId,
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
    // Don't reset selectedRoleId to preserve default selection for next open
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send Invitation</DialogTitle>
          <DialogDescription>
            Invite a new member to join your organization. They will receive an
            email with a link to create their account.
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
            <Label>Role</Label>
            {loadingRoles ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              <RadioGroup
                value={selectedRoleId}
                onValueChange={setSelectedRoleId}
                className="max-h-[300px] space-y-1 overflow-y-auto rounded-md border p-4"
              >
                {roles.map((role) => (
                  <div
                    key={role.id}
                    className="hover:bg-muted/50 flex items-start space-x-3 rounded-md p-2"
                  >
                    <RadioGroupItem
                      value={role.id}
                      id={`role-${role.id}`}
                      className="mt-0.5"
                    />
                    <label
                      htmlFor={`role-${role.id}`}
                      className="flex-1 cursor-pointer space-y-1"
                    >
                      <div className="text-sm leading-none font-medium">
                        {role.name}
                      </div>
                      {role.description && (
                        <div className="text-muted-foreground text-xs leading-relaxed">
                          {role.description}
                        </div>
                      )}
                    </label>
                  </div>
                ))}
              </RadioGroup>
            )}
            <p className="text-muted-foreground text-xs">
              Select the role to assign to the invited user
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
