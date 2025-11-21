import { useState } from 'react';

import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { useRouter } from 'next/router';

import { IconBuilding, IconCheck, IconTrash } from '@tabler/icons-react';

import { DeleteOrganisationDialog } from '@/components/organisation/delete-organisation-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AppLayout } from '@/layouts/app';
import { IamApiClient } from '@/lib/api/client';
import { OrganisationApi } from '@/lib/api/organisation';
import { createServerApiClient } from '@/lib/auth/client-factory';
import { requireAuth } from '@/lib/auth/redirects';

export default function OrganisationSettingsPage({
  user,
  organisation,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: organisation.name,
    mfaRequired: organisation.mfaRequired,
    sessionLifetime: organisation.sessionLifetime,
  });

  const hasChanges =
    formData.name !== organisation.name ||
    formData.mfaRequired !== organisation.mfaRequired ||
    formData.sessionLifetime !== organisation.sessionLifetime;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const apiClient = new IamApiClient();
      const organisationApi = new OrganisationApi(apiClient);

      const result = await organisationApi.update(formData);

      if (!result.ok) {
        setError(
          result.error.detail ||
            result.error.title ||
            'Failed to update settings'
        );
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.reload();
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update settings'
      );
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: organisation.name,
      mfaRequired: organisation.mfaRequired,
      sessionLifetime: organisation.sessionLifetime,
    });
    setError(null);
    setSuccess(false);
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Organisation Settings' },
  ];

  return (
    <AppLayout
      user={user}
      breadcrumbs={breadcrumbs}
      title="Organisation Settings"
      docsUrl="https://docs.cerberus-iam.com/admin/organisation"
    >
      <div className="space-y-6 px-4 py-5 lg:px-6">
        <div className="flex items-center gap-3">
          <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-lg border">
            <IconBuilding className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-medium">Organisation Settings</h3>
            <p className="text-muted-foreground text-sm">
              Manage your organisation configuration and preferences
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Information Section */}
          <div className="bg-card rounded-lg border">
            <div className="border-b px-6 py-4">
              <h4 className="font-medium">General Information</h4>
              <p className="text-muted-foreground text-sm">
                Basic details about your organisation
              </p>
            </div>
            <div className="space-y-4 px-6 py-4">
              {error && (
                <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 rounded-md bg-green-50 p-3 text-sm text-green-900 dark:bg-green-950/50 dark:text-green-200">
                  <IconCheck className="h-4 w-4" />
                  Settings updated successfully!
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="slug">Organisation Slug</Label>
                <Badge variant="outline" className="w-fit font-mono text-sm">
                  {organisation.slug}
                </Badge>
                <p className="text-muted-foreground text-xs">
                  The organisation slug is immutable and cannot be changed
                </p>
              </div>

              {organisation.domain && (
                <div className="grid gap-2">
                  <Label>Domain</Label>
                  <Badge variant="outline" className="w-fit text-sm">
                    {organisation.domain}
                  </Badge>
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="name">
                  Organisation Name <span className="text-destructive">*</span>
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
            </div>
          </div>

          {/* Security Settings Section */}
          <div className="bg-card rounded-lg border">
            <div className="border-b px-6 py-4">
              <h4 className="font-medium">Security Settings</h4>
              <p className="text-muted-foreground text-sm">
                Configure security policies for your organisation
              </p>
            </div>
            <div className="space-y-4 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="mfaRequired">
                    Require Multi-Factor Authentication
                  </Label>
                  <p className="text-muted-foreground text-sm">
                    Force all users to enable MFA on their accounts
                  </p>
                </div>
                <Switch
                  id="mfaRequired"
                  checked={formData.mfaRequired}
                  onCheckedChange={(checked: boolean) =>
                    setFormData((prev) => ({ ...prev, mfaRequired: checked }))
                  }
                  disabled={loading}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="sessionLifetime">
                  Session Lifetime (seconds)
                </Label>
                <Input
                  id="sessionLifetime"
                  type="number"
                  min="300"
                  max="604800"
                  value={formData.sessionLifetime}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      sessionLifetime: parseInt(e.target.value, 10),
                    }))
                  }
                  required
                  disabled={loading}
                />
                <p className="text-muted-foreground text-xs">
                  How long user sessions last before requiring re-authentication
                  (5 minutes to 7 days). Current:{' '}
                  {Math.floor(formData.sessionLifetime / 3600)} hours
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={loading || !hasChanges}
            >
              Reset Changes
            </Button>
            <Button type="submit" disabled={loading || !hasChanges || success}>
              {loading ? 'Saving...' : success ? 'Saved!' : 'Save Changes'}
            </Button>
          </div>
        </form>

        {/* Danger Zone */}
        <div className="border-destructive/50 bg-card rounded-lg border">
          <div className="border-destructive/50 border-b px-6 py-4">
            <h4 className="text-destructive font-medium">Danger Zone</h4>
            <p className="text-muted-foreground text-sm">
              Irreversible and destructive actions
            </p>
          </div>
          <div className="px-6 py-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="font-medium">Delete Organisation</p>
                <p className="text-muted-foreground text-sm">
                  Permanently delete this organisation and all associated data.
                  This action cannot be undone.
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={loading}
              >
                <IconTrash className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        <DeleteOrganisationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          organisation={organisation}
        />
      </div>
    </AppLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) =>
  requireAuth(context, async ({ context }) => {
    try {
      const client = createServerApiClient(context);
      const organisationApi = new OrganisationApi(client);

      const result = await organisationApi.get();

      if (!result.ok) {
        console.error('Failed to fetch organisation:', result.error);
        throw new Error('Failed to load organisation settings');
      }

      return {
        organisation: result.value,
      };
    } catch (error) {
      console.error('Error fetching organisation:', error);
      throw error;
    }
  });
