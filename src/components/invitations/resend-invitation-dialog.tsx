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
import { apiClient } from '@/lib/api/client';
import { type Invitation, InvitationsApi } from '@/lib/api/invitations';

interface ResendInvitationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invitation: Invitation | null;
}

export function ResendInvitationDialog({
  open,
  onOpenChange,
  invitation,
}: ResendInvitationDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleResend = async () => {
    if (!invitation) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    const invitationsApi = new InvitationsApi(apiClient);

    const result = await invitationsApi.resend(invitation.id);

    setLoading(false);

    if (!result.ok) {
      const err = result.error as { detail?: string; title?: string };
      setError(err.detail || err.title || 'Failed to resend invitation');
      return;
    }

    setSuccess(true);
  };

  const handleClose = () => {
    if (success) {
      window.location.reload();
    } else {
      setError(null);
      setSuccess(false);
      onOpenChange(false);
    }
  };

  if (!invitation) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Resend Invitation</DialogTitle>
          <DialogDescription>
            Send the invitation email again to this user
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
                <span className="ml-2 text-sm">{invitation.role.name}</span>
              </div>
            </div>
          </div>

          {success && (
            <Alert>
              <AlertDescription>
                Invitation email has been resent successfully!
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            {success ? 'Close' : 'Cancel'}
          </Button>
          {!success && (
            <Button onClick={handleResend} disabled={loading}>
              {loading ? 'Sending...' : 'Resend Email'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
