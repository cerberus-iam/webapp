import { useState } from 'react';

import { useRouter } from 'next/router';

import { IconAlertTriangle, IconCheck, IconCopy } from '@tabler/icons-react';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { IamApiClient } from '@/lib/api/client';
import { ClientsApi } from '@/lib/api/clients';

interface CreateClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateClientDialog({
  open,
  onOpenChange,
}: CreateClientDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);
  const [secretCopied, setSecretCopied] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    clientType: 'confidential' as 'confidential' | 'public',
    redirectUris: '',
    allowedScopes: 'openid profile email',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const client = new IamApiClient();
      const clientsApi = new ClientsApi(client);

      const redirectUrisList = formData.redirectUris
        .split('\n')
        .map((uri) => uri.trim())
        .filter((uri) => uri.length > 0);

      const scopesList = formData.allowedScopes
        .split(' ')
        .map((scope) => scope.trim())
        .filter((scope) => scope.length > 0);

      const result = await clientsApi.create({
        name: formData.name,
        clientType: formData.clientType,
        redirectUris: redirectUrisList,
        allowedScopes: scopesList,
        tokenEndpointAuthMethod:
          formData.clientType === 'confidential'
            ? 'client_secret_post'
            : undefined,
      });

      if (!result.ok) {
        setError(
          result.error.detail || result.error.title || 'Failed to create client'
        );
        setLoading(false);
        return;
      }

      // Show the secret to the user (only shown once!)
      if (result.value.clientSecret) {
        setCreatedSecret(result.value.clientSecret);
      } else {
        // Public clients don't have secrets, close immediately
        setFormData({
          name: '',
          clientType: 'confidential',
          redirectUris: '',
          allowedScopes: 'openid profile email',
        });
        onOpenChange(false);
        router.reload();
      }

      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create client');
      setLoading(false);
    }
  };

  const handleCopySecret = async () => {
    if (createdSecret) {
      await navigator.clipboard.writeText(createdSecret);
      setSecretCopied(true);
      setTimeout(() => setSecretCopied(false), 2000);
    }
  };

  const handleFinish = () => {
    setFormData({
      name: '',
      clientType: 'confidential',
      redirectUris: '',
      allowedScopes: 'openid profile email',
    });
    setCreatedSecret(null);
    setSecretCopied(false);
    onOpenChange(false);
    router.reload();
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!loading && !createdSecret) {
      onOpenChange(newOpen);
      if (!newOpen) {
        setFormData({
          name: '',
          clientType: 'confidential',
          redirectUris: '',
          allowedScopes: 'openid profile email',
        });
        setError(null);
      }
    }
  };

  // If we have a created secret, show the secret display view
  if (createdSecret) {
    return (
      <Dialog open={open} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Client Created Successfully</DialogTitle>
            <DialogDescription>
              Save the client secret below. It will only be shown once.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="rounded-md border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/50">
              <div className="flex items-start gap-3">
                <IconAlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                    Important: Save this secret now
                  </p>
                  <p className="text-sm text-amber-800 dark:text-amber-300">
                    This is the only time you&rsquo;ll see the client secret.
                    Store it securely and never share it publicly.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Client Secret</Label>
              <div className="flex gap-2">
                <Input
                  value={createdSecret}
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
            <Button onClick={handleFinish}>I&rsquo;ve Saved the Secret</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Normal creation form
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create OAuth2 Client</DialogTitle>
            <DialogDescription>
              Register a new OAuth2/OIDC client application for integrations.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {error && (
              <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
                {error}
              </div>
            )}

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
                placeholder="My Application"
                required
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="clientType">
                Client Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.clientType}
                onValueChange={(value: 'confidential' | 'public') =>
                  setFormData((prev) => ({ ...prev, clientType: value }))
                }
                disabled={loading}
              >
                <SelectTrigger id="clientType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confidential">
                    Confidential (Web Server Apps)
                  </SelectItem>
                  <SelectItem value="public">
                    Public (SPAs, Mobile Apps)
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-muted-foreground text-xs">
                Confidential clients can securely store secrets. Public clients
                can&rsquo;t.
              </p>
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
                placeholder="https://app.example.com/callback&#10;https://app.example.com/oauth/callback"
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
                placeholder="openid profile email"
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
              {loading ? 'Creating...' : 'Create Client'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
