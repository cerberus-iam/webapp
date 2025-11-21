import { useState } from 'react';

import { useRouter } from 'next/router';

import { IconAlertTriangle, IconCheck, IconCopy } from '@tabler/icons-react';

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
import type { OAuth2Client } from '@/lib/api/clients';
import { ClientsApi } from '@/lib/api/clients';

interface RotateSecretDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: OAuth2Client;
}

export function RotateSecretDialog({
  open,
  onOpenChange,
  client,
}: RotateSecretDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newSecret, setNewSecret] = useState<string | null>(null);
  const [secretCopied, setSecretCopied] = useState(false);

  const handleRotate = async () => {
    setError(null);
    setLoading(true);

    try {
      const apiClient = new IamApiClient();
      const clientsApi = new ClientsApi(apiClient);

      const result = await clientsApi.rotateSecret(client.id);

      if (!result.ok) {
        setError(
          result.error.detail || result.error.title || 'Failed to rotate secret'
        );
        setLoading(false);
        return;
      }

      setNewSecret(result.value.clientSecret);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rotate secret');
      setLoading(false);
    }
  };

  const handleCopySecret = async () => {
    if (newSecret) {
      await navigator.clipboard.writeText(newSecret);
      setSecretCopied(true);
      setTimeout(() => setSecretCopied(false), 2000);
    }
  };

  const handleFinish = () => {
    setNewSecret(null);
    setSecretCopied(false);
    onOpenChange(false);
    router.reload();
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!loading && !newSecret) {
      onOpenChange(newOpen);
      if (!newOpen) {
        setError(null);
      }
    }
  };

  // If we have a new secret, show the secret display view
  if (newSecret) {
    return (
      <Dialog open={open} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Secret Rotated Successfully</DialogTitle>
            <DialogDescription>
              Save the new client secret below. It will only be shown once.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="rounded-md border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/50">
              <div className="flex items-start gap-3">
                <IconAlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                    Important: Update your application
                  </p>
                  <p className="text-sm text-amber-800 dark:text-amber-300">
                    The old secret is now invalid. Update your application with
                    this new secret immediately to avoid service interruption.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>New Client Secret</Label>
              <div className="flex gap-2">
                <Input
                  value={newSecret}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCopySecret}
                  className="shrink-0"
                >
                  {secretCopied ? (
                    <IconCheck className="h-4 w-4" />
                  ) : (
                    <IconCopy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-muted-foreground text-xs">
                {secretCopied
                  ? 'Copied to clipboard!'
                  : 'Click the copy button to save this secret'}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleFinish}>
              I&rsquo;ve Updated My Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Confirmation view
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Rotate Client Secret</DialogTitle>
          <DialogDescription>
            Generate a new client secret for this OAuth2 client.
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
          </div>

          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/50 dark:bg-amber-950/50">
            <p className="text-sm text-amber-900 dark:text-amber-200">
              <strong>Warning:</strong> Rotating the secret will immediately
              invalidate the old secret. Make sure to update your application
              with the new secret after rotation.
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
          <Button type="button" onClick={handleRotate} disabled={loading}>
            {loading ? 'Rotating...' : 'Rotate Secret'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
