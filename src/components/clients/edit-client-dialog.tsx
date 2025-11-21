import { useEffect, useState } from 'react';

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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { IamApiClient } from '@/lib/api/client';
import type { OAuth2Client } from '@/lib/api/clients';
import { ClientsApi } from '@/lib/api/clients';

interface EditClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: OAuth2Client;
}

export function EditClientDialog({
  open,
  onOpenChange,
  client,
}: EditClientDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: client.name,
    redirectUris: client.redirectUris.join('\n'),
    allowedScopes: client.allowedScopes.join(' '),
  });

  // Update form data when client changes
  useEffect(() => {
    setFormData({
      name: client.name,
      redirectUris: client.redirectUris.join('\n'),
      allowedScopes: client.allowedScopes.join(' '),
    });
    setError(null);
  }, [client]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const apiClient = new IamApiClient();
      const clientsApi = new ClientsApi(apiClient);

      const redirectUrisList = formData.redirectUris
        .split('\n')
        .map((uri) => uri.trim())
        .filter((uri) => uri.length > 0);

      const scopesList = formData.allowedScopes
        .split(' ')
        .map((scope) => scope.trim())
        .filter((scope) => scope.length > 0);

      const result = await clientsApi.update(client.id, {
        name: formData.name,
        redirectUris: redirectUrisList,
        allowedScopes: scopesList,
      });

      if (!result.ok) {
        setError(
          result.error.detail || result.error.title || 'Failed to update client'
        );
        setLoading(false);
        return;
      }

      onOpenChange(false);
      router.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update client');
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
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit OAuth2 Client</DialogTitle>
            <DialogDescription>
              Update client configuration. The client ID and type cannot be
              changed.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {error && (
              <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
                {error}
              </div>
            )}

            <div className="grid gap-2">
              <Label>Client ID</Label>
              <Badge variant="outline" className="w-fit font-mono text-sm">
                {client.clientId}
              </Badge>
              <p className="text-muted-foreground text-xs">
                The client ID is immutable and cannot be changed
              </p>
            </div>

            <div className="grid gap-2">
              <Label>Client Type</Label>
              <Badge
                variant={
                  client.clientType === 'confidential' ? 'default' : 'secondary'
                }
              >
                {client.clientType}
              </Badge>
              <p className="text-muted-foreground text-xs">
                The client type is immutable and cannot be changed
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="redirectUris">
                Redirect URIs <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="redirectUris"
                value={formData.redirectUris}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData((prev) => ({
                    ...prev,
                    redirectUris: e.target.value,
                  }))
                }
                required
                disabled={loading}
                rows={4}
              />
              <p className="text-muted-foreground text-xs">
                One URI per line. These are the allowed callback URLs for OAuth
                flows.
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="allowedScopes">
                Allowed Scopes <span className="text-destructive">*</span>
              </Label>
              <Input
                id="allowedScopes"
                value={formData.allowedScopes}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    allowedScopes: e.target.value,
                  }))
                }
                required
                disabled={loading}
              />
              <p className="text-muted-foreground text-xs">
                Space-separated list of OAuth2 scopes
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
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
