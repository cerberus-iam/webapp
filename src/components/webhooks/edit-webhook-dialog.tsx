import { useEffect, useState } from 'react';

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
import { Switch } from '@/components/ui/switch';
import { IamApiClient } from '@/lib/api/client';
import { type Webhook, WebhooksApi } from '@/lib/api/webhooks';

interface EditWebhookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  webhook: Webhook | null;
}

// Common webhook events (same as create dialog)
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

export function EditWebhookDialog({
  open,
  onOpenChange,
  webhook,
}: EditWebhookDialogProps) {
  // Initialize state from webhook prop
  const [url, setUrl] = useState(() => webhook?.url || '');
  const [active, setActive] = useState(() => webhook?.active ?? true);
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(
    () => new Set(webhook?.events || [])
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when webhook changes
  useEffect(() => {
    if (webhook) {
      setUrl(webhook.url);
      setActive(webhook.active);
      setSelectedEvents(new Set(webhook.events));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally sync form with webhook prop changes
  }, [webhook?.id]);

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
    if (!webhook) return;

    if (selectedEvents.size === 0) {
      setError('Please select at least one event');
      return;
    }

    setLoading(true);
    setError(null);

    const client = new IamApiClient();
    const webhooksApi = new WebhooksApi(client);

    const result = await webhooksApi.update(webhook.id, {
      url,
      events: Array.from(selectedEvents),
      active,
    });

    setLoading(false);

    if (!result.ok) {
      const err = result.error as { detail?: string; title?: string };
      setError(err.detail || err.title || 'Failed to update webhook');
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Webhook</DialogTitle>
          <DialogDescription>
            Update webhook configuration and event subscriptions
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
          </div>

          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="active">Active Status</Label>
              <p className="text-muted-foreground text-xs">
                Enable or disable this webhook
              </p>
            </div>
            <Switch
              id="active"
              checked={active}
              onCheckedChange={(checked: boolean) => setActive(checked)}
            />
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
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
