import { useState } from 'react';

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
import { IamApiClient } from '@/lib/api/client';
import { type Invitation, InvitationsApi } from '@/lib/api/invitations';

interface RevokeInvitationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invitation: Invitation | null;
}

export function RevokeInvitationDialog({
  open,
  onOpenChange,
  invitation,
}: RevokeInvitationDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRevoke = async () => {
    if (!invitation) return;

    setLoading(true);
    setError(null);

    const client = new IamApiClient();
    const invitationsApi = new InvitationsApi(client);

    const result = await invitationsApi.revoke(invitation.id);

    setLoading(false);

    if (!result.ok) {
      const err = result.error as { detail?: string; title?: string };
      setError(err.detail || err.title || 'Failed to revoke invitation');
      return;
    }

    window.location.reload();
  };

  const handleClose = () => {
    setError(null);
    onOpenChange(false);
  };

  if (!invitation) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Revoke Invitation</DialogTitle>
          <DialogDescription>
            Are you sure you want to revoke this invitation?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted rounded-md p-4">
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium">Email:</span>
                <span className="ml-2 text-sm">{invitation.email}</span>
              </div>
              <div>
                <span className="text-sm font-medium">Role:</span>
                <span className="ml-2 text-sm">{invitation.role}</span>
              </div>
              <div>
                <span className="text-sm font-medium">Status:</span>
                <span className="ml-2 text-sm">{invitation.status}</span>
              </div>
            </div>
          </div>

          <Alert variant="destructive">
            <AlertDescription>
              <strong>Warning:</strong> This action cannot be undone. The
              invitation link will no longer work, and the user will not be able
              to join your organization using this invitation.
            </AlertDescription>
          </Alert>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleRevoke}
            disabled={loading}
          >
            {loading ? 'Revoking...' : 'Revoke Invitation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
