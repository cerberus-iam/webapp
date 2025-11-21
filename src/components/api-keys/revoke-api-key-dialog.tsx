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
import { type ApiKey, ApiKeysApi } from '@/lib/api/api-keys';
import { IamApiClient } from '@/lib/api/client';

interface RevokeApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiKey: ApiKey | null;
}

export function RevokeApiKeyDialog({
  open,
  onOpenChange,
  apiKey,
}: RevokeApiKeyDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRevoke = async () => {
    if (!apiKey) return;

    setLoading(true);
    setError(null);

    const client = new IamApiClient();
    const apiKeysApi = new ApiKeysApi(client);

    const result = await apiKeysApi.revoke(apiKey.id);

    setLoading(false);

    if (!result.ok) {
      const err = result.error as { detail?: string; title?: string };
      setError(err.detail || err.title || 'Failed to revoke API key');
      return;
    }

    window.location.reload();
  };

  const handleClose = () => {
    setError(null);
    onOpenChange(false);
  };

  if (!apiKey) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Revoke API Key</DialogTitle>
          <DialogDescription>
            Are you sure you want to revoke this API key?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted rounded-md p-4">
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium">Name:</span>
                <span className="ml-2 text-sm">{apiKey.name}</span>
              </div>
              <div>
                <span className="text-sm font-medium">Key Prefix:</span>
                <code className="text-muted-foreground ml-2 text-sm">
                  {apiKey.prefix}***
                </code>
              </div>
            </div>
          </div>

          <Alert variant="destructive">
            <AlertDescription>
              <strong>Warning:</strong> This action cannot be undone. Any
              systems using this API key will immediately lose access.
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
            {loading ? 'Revoking...' : 'Revoke API Key'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
