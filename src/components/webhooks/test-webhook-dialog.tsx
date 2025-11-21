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

interface TestWebhookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  webhook: Webhook | null;
}

export function TestWebhookDialog({
  open,
  onOpenChange,
  webhook,
}: TestWebhookDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleTest = async () => {
    if (!webhook) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    const client = new IamApiClient();
    const webhooksApi = new WebhooksApi(client);

    const result = await webhooksApi.test(webhook.id);

    setLoading(false);

    if (!result.ok) {
      const err = result.error as { detail?: string; title?: string };
      setError(err.detail || err.title || 'Failed to send test event');
      return;
    }

    setSuccess(true);
  };

  const handleClose = () => {
    setError(null);
    setSuccess(false);
    onOpenChange(false);
  };

  if (!webhook) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Test Webhook</DialogTitle>
          <DialogDescription>
            Send a test event to verify your webhook endpoint
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
                <div className="mt-1 flex flex-wrap gap-1">
                  {webhook.events.map((event) => (
                    <span
                      key={event}
                      className="bg-secondary inline-flex items-center rounded-md px-2 py-1 text-xs"
                    >
                      {event}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {success && (
            <Alert>
              <AlertDescription>
                Test event sent successfully! Check your endpoint logs to verify
                receipt.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!success && (
            <div className="text-muted-foreground text-sm">
              A test payload will be sent to your webhook endpoint. Make sure
              your endpoint is configured to receive POST requests.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            {success ? 'Close' : 'Cancel'}
          </Button>
          {!success && (
            <Button onClick={handleTest} disabled={loading}>
              {loading ? 'Sending...' : 'Send Test Event'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
