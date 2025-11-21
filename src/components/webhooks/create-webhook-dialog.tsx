import { useState } from 'react';

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
import { Textarea } from '@/components/ui/textarea';
import { IamApiClient } from '@/lib/api/client';
import { WebhooksApi } from '@/lib/api/webhooks';

interface CreateWebhookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Common webhook events
const WEBHOOK_EVENTS = [
  {
    value: 'user.created',
    label: 'User Created',
    description: 'When a new user is created',
  },
  {
    value: 'user.updated',
    label: 'User Updated',
    description: 'When a user is modified',
  },
  {
    value: 'user.deleted',
    label: 'User Deleted',
    description: 'When a user is deleted',
  },
  {
    value: 'user.login',
    label: 'User Login',
    description: 'When a user logs in',
  },
  {
    value: 'role.assigned',
    label: 'Role Assigned',
    description: 'When a role is assigned to a user',
  },
  {
    value: 'role.removed',
    label: 'Role Removed',
    description: 'When a role is removed from a user',
  },
  {
    value: 'team.created',
    label: 'Team Created',
    description: 'When a team is created',
  },
  {
    value: 'team.updated',
    label: 'Team Updated',
    description: 'When a team is modified',
  },
  {
    value: 'team.deleted',
    label: 'Team Deleted',
    description: 'When a team is deleted',
  },
  {
    value: 'invitation.sent',
    label: 'Invitation Sent',
    description: 'When an invitation is sent',
  },
  {
    value: 'invitation.accepted',
    label: 'Invitation Accepted',
    description: 'When an invitation is accepted',
  },
];

export function CreateWebhookDialog({
  open,
  onOpenChange,
}: CreateWebhookDialogProps) {
  const [url, setUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEventToggle = (event: string) => {
    const newSelected = new Set(selectedEvents);
    if (newSelected.has(event)) {
      newSelected.delete(event);
    } else {
      newSelected.add(event);
    }
    setSelectedEvents(newSelected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedEvents.size === 0) {
      setError('Please select at least one event');
      return;
    }

    setLoading(true);
    setError(null);

    const client = new IamApiClient();
    const webhooksApi = new WebhooksApi(client);

    const result = await webhooksApi.create({
      url,
      events: Array.from(selectedEvents),
      secret: secret || undefined,
    });

    setLoading(false);

    if (!result.ok) {
      const err = result.error as { detail?: string; title?: string };
      setError(err.detail || err.title || 'Failed to create webhook');
      return;
    }

    window.location.reload();
  };

  const handleClose = () => {
    setUrl('');
    setSecret('');
    setSelectedEvents(new Set());
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Webhook</DialogTitle>
          <DialogDescription>
            Configure a webhook endpoint to receive real-time event
            notifications
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">Endpoint URL</Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.example.com/webhooks"
              required
            />
            <p className="text-muted-foreground text-xs">
              The URL where webhook events will be sent
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="secret">
              Signing Secret{' '}
              <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="secret"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Enter a secret key for webhook signature verification"
              rows={2}
            />
            <p className="text-muted-foreground text-xs">
              Used to verify webhook requests are from Cerberus IAM
            </p>
          </div>

          <div className="space-y-2">
            <Label>Events</Label>
            <div className="max-h-[300px] space-y-2 overflow-y-auto rounded-md border p-4">
              {WEBHOOK_EVENTS.map((event) => (
                <div key={event.value} className="flex items-start space-x-2">
                  <Checkbox
                    id={event.value}
                    checked={selectedEvents.has(event.value)}
                    onCheckedChange={() => handleEventToggle(event.value)}
                    className="mt-1"
                  />
                  <label
                    htmlFor={event.value}
                    className="flex-1 cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {event.label}
                    <span className="text-muted-foreground block text-xs font-normal">
                      {event.description}
                    </span>
                  </label>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground text-xs">
              Select the events you want to receive notifications for
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
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Webhook'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
