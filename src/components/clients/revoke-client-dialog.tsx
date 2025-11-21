import { useState } from 'react';

import { useRouter } from 'next/router';

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
import { IamApiClient } from '@/lib/api/client';
import type { OAuth2Client } from '@/lib/api/clients';
import { ClientsApi } from '@/lib/api/clients';

interface RevokeClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: OAuth2Client;
}

export function RevokeClientDialog({
  open,
  onOpenChange,
  client,
}: RevokeClientDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRevoke = async () => {
    setError(null);
    setLoading(true);

    try {
      const apiClient = new IamApiClient();
      const clientsApi = new ClientsApi(apiClient);

      const result = await clientsApi.revoke(client.id);

      if (!result.ok) {
        setError(
          result.error.detail || result.error.title || 'Failed to revoke client'
        );
        setLoading(false);
        return;
      }

      onOpenChange(false);
      router.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke client');
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!loading) {
      onOpenChange(newOpen);
      if (!newOpen) {
        setError(null);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Revoke OAuth2 Client</DialogTitle>
          <DialogDescription>
            Are you sure you want to revoke this client? This action cannot be
            undone.
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
              <span className="text-sm font-medium">Name:</span>
              <span className="text-sm">{client.name}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Client ID:</span>
              <Badge variant="outline" className="font-mono text-xs">
                {client.clientId}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Type:</span>
              <Badge
                variant={
                  client.clientType === 'confidential' ? 'default' : 'secondary'
                }
              >
                {client.clientType}
              </Badge>
            </div>
          </div>

          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/50 dark:bg-amber-950/50">
            <p className="text-sm text-amber-900 dark:text-amber-200">
              <strong>Warning:</strong> Revoking this client will immediately
              invalidate all tokens issued to it. Any applications using this
              client will stop working.
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
            onClick={handleRevoke}
            disabled={loading}
          >
            {loading ? 'Revoking...' : 'Revoke Client'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
