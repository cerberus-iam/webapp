import { useState } from 'react';

import { useRouter } from 'next/router';

import { IconAlertTriangle } from '@tabler/icons-react';

import { Badge } from '@/components/ui/badge';
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
import { IamApiClient } from '@/lib/api/client';
import type { Organisation } from '@/lib/api/organisation';
import { OrganisationApi } from '@/lib/api/organisation';

interface DeleteOrganisationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organisation: Organisation;
}

export function DeleteOrganisationDialog({
  open,
  onOpenChange,
  organisation,
}: DeleteOrganisationDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState('');

  const isConfirmed = confirmation === organisation.slug;

  const handleDelete = async () => {
    if (!isConfirmed) return;

    setError(null);
    setLoading(true);

    try {
      const apiClient = new IamApiClient();
      const organisationApi = new OrganisationApi(apiClient);

      const result = await organisationApi.delete();

      if (!result.ok) {
        setError(
          result.error.detail ||
            result.error.title ||
            'Failed to delete organisation'
        );
        setLoading(false);
        return;
      }

      // Redirect to login after deletion
      router.push('/login');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to delete organisation'
      );
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!loading) {
      onOpenChange(newOpen);
      if (!newOpen) {
        setError(null);
        setConfirmation('');
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-destructive">
            Delete Organisation
          </DialogTitle>
          <DialogDescription>
            This action is permanent and cannot be undone. All data will be
            lost.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Organisation:</span>
              <span className="text-sm">{organisation.name}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Slug:</span>
              <Badge variant="outline" className="font-mono text-xs">
                {organisation.slug}
              </Badge>
            </div>
          </div>

          <div className="border-destructive/50 bg-destructive/10 rounded-md border p-4">
            <div className="flex items-start gap-3">
              <IconAlertTriangle className="text-destructive h-5 w-5 shrink-0" />
              <div className="space-y-2">
                <p className="text-destructive text-sm font-medium">
                  This will permanently delete:
                </p>
                <ul className="text-destructive list-inside list-disc space-y-1 text-sm">
                  <li>All users and their data</li>
                  <li>All roles and permissions</li>
                  <li>All teams and memberships</li>
                  <li>All OAuth2 clients</li>
                  <li>All API keys and sessions</li>
                  <li>All audit logs and webhooks</li>
                  <li>All organisation settings</li>
                </ul>
                <p className="text-destructive text-sm font-medium">
                  This action is irreversible and cannot be undone.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmation">
              Type{' '}
              <Badge variant="outline" className="font-mono text-xs">
                {organisation.slug}
              </Badge>{' '}
              to confirm
            </Label>
            <Input
              id="confirmation"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder={organisation.slug}
              disabled={loading}
              className="font-mono"
            />
            <p className="text-muted-foreground text-xs">
              This confirmation is case-sensitive
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading || !isConfirmed}
          >
            {loading ? 'Deleting...' : 'Permanently Delete Organisation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
