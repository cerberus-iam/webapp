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
import { type Webhook, WebhooksApi } from '@/lib/api/webhooks';

interface DeleteWebhookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  webhook: Webhook | null;
}

export function DeleteWebhookDialog({
  open,
  onOpenChange,
  webhook,
}: DeleteWebhookDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!webhook) return;

    setLoading(true);
    setError(null);

    const client = new IamApiClient();
    const webhooksApi = new WebhooksApi(client);

    const result = await webhooksApi.delete(webhook.id);

    setLoading(false);

    if (!result.ok) {
      const err = result.error as { detail?: string; title?: string };
      setError(err.detail || err.title || 'Failed to delete webhook');
      return;
    }

    window.location.reload();
  };

  const handleClose = () => {
    setError(null);
    onOpenChange(false);
  };

  if (!webhook) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Delete Webhook</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this webhook?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted rounded-md p-4">
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium">Endpoint URL:</span>
                <div className="mt-1 font-mono text-sm break-all">
                  {webhook.url}
                </div>
              </div>
              <div>
                <span className="text-sm font-medium">Events:</span>
                <div className="mt-1 text-sm">
                  {webhook.events.length} subscribed
                </div>
              </div>
            </div>
          </div>

          <Alert variant="destructive">
            <AlertDescription>
              <strong>Warning:</strong> This action cannot be undone. Your
              endpoint will no longer receive event notifications.
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
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete Webhook'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
