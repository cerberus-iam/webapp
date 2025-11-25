import { useState } from 'react';

import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';

import { IconCheck, IconLoader2, IconTrash } from '@tabler/icons-react';
import { toast } from 'sonner';

import { DeleteOrganisationDialog } from '@/components/organisation/delete-organisation-dialog';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { docsUrl } from '@/config/urls';
import { AppLayout } from '@/layouts/app';
import { apiClient } from '@/lib/api/client';
import { OrganisationApi } from '@/lib/api/organisation';
import { createAuthenticatedClient } from '@/lib/auth/redirects';
import { requireAuth } from '@/lib/auth/redirects';

// Helper function to convert seconds to a friendly unit
function secondsToFriendly(seconds: number): {
  value: number;
  unit: 'minutes' | 'hours' | 'days';
} {
  if (seconds >= 86400 && seconds % 86400 === 0) {
    return { value: seconds / 86400, unit: 'days' };
  }
  if (seconds >= 3600 && seconds % 3600 === 0) {
    return { value: seconds / 3600, unit: 'hours' };
  }
  return { value: Math.floor(seconds / 60), unit: 'minutes' };
}

// Helper function to convert friendly unit back to seconds
function friendlyToSeconds(
  value: number,
  unit: 'minutes' | 'hours' | 'days'
): number {
  switch (unit) {
    case 'minutes':
      return value * 60;
    case 'hours':
      return value * 3600;
    case 'days':
      return value * 86400;
  }
}

export default function OrganisationSettingsPage({
  user,
  organisation,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const initialSessionLifetime = secondsToFriendly(
    organisation.sessionLifetime
  );
  const [sessionLifetimeValue, setSessionLifetimeValue] = useState(
    initialSessionLifetime.value
  );
  const [sessionLifetimeUnit, setSessionLifetimeUnit] = useState(
    initialSessionLifetime.unit
  );

  const [formData, setFormData] = useState({
    name: organisation.name,
    requireMfa: organisation.requireMfa,
    sessionLifetime: organisation.sessionLifetime,
  });

  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    sessionLifetime?: string;
  }>({});

  // Calculate current session lifetime in seconds from the UI state
  const currentSessionLifetimeSeconds = friendlyToSeconds(
    sessionLifetimeValue,
    sessionLifetimeUnit
  );

  // Validation functions
  const validateName = (name: string): string | undefined => {
    if (!name || name.trim().length === 0) {
      return 'Organisation name is required';
    }
    if (name.trim().length < 2) {
      return 'Organisation name must be at least 2 characters';
    }
    if (name.trim().length > 100) {
      return 'Organisation name must be less than 100 characters';
    }
    return undefined;
  };

  const validateSessionLifetime = (
    value: number,
    unit: 'minutes' | 'hours' | 'days'
  ): string | undefined => {
    const seconds = friendlyToSeconds(value, unit);
    const minSeconds = 300; // 5 minutes
    const maxSeconds = 604800; // 7 days

    if (value < 1) {
      return 'Session lifetime must be at least 1';
    }

    if (seconds < minSeconds) {
      return 'Session lifetime must be at least 5 minutes';
    }

    if (seconds > maxSeconds) {
      return 'Session lifetime cannot exceed 7 days';
    }

    return undefined;
  };

  const hasChanges =
    formData.name !== organisation.name ||
    formData.requireMfa !== organisation.requireMfa ||
    currentSessionLifetimeSeconds !== organisation.sessionLifetime;

  const hasValidationErrors = Object.values(validationErrors).some(
    (error) => error !== undefined
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validate all fields
    const nameError = validateName(formData.name);
    const sessionLifetimeError = validateSessionLifetime(
      sessionLifetimeValue,
      sessionLifetimeUnit
    );

    setValidationErrors({
      name: nameError,
      sessionLifetime: sessionLifetimeError,
    });

    // Don't submit if there are validation errors
    if (nameError || sessionLifetimeError) {
      return;
    }

    setLoading(true);

    try {
      const organisationApi = new OrganisationApi(apiClient);

      const result = await organisationApi.update({
        ...formData,
        sessionLifetime: currentSessionLifetimeSeconds,
      });

      if (!result.ok) {
        const errorMessage =
          result.error.detail ||
          result.error.title ||
          'Failed to update settings';
        setError(errorMessage);
        toast.error('Failed to update settings', {
          description: errorMessage,
        });
        setLoading(false);
        return;
      }

      setSuccess(true);
      toast.success('Settings updated successfully', {
        description: 'Your organisation settings have been saved.',
      });

      // Update local state to reflect saved changes
      setFormData({
        name: formData.name,
        requireMfa: formData.requireMfa,
        sessionLifetime: currentSessionLifetimeSeconds,
      });

      setLoading(false);

      // Refresh the page data without full reload
      router.replace(router.asPath);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to update settings';
      setError(errorMessage);
      toast.error('Failed to update settings', {
        description: errorMessage,
      });
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: organisation.name,
      requireMfa: organisation.requireMfa,
      sessionLifetime: organisation.sessionLifetime,
    });
    const resetSessionLifetime = secondsToFriendly(
      organisation.sessionLifetime
    );
    setSessionLifetimeValue(resetSessionLifetime.value);
    setSessionLifetimeUnit(resetSessionLifetime.unit);
    setValidationErrors({});
    setError(null);
    setSuccess(false);
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Organisation Settings' },
  ];

  return (
    <>
      <Head>
        <title>Organisation Settings | Cerberus IAM</title>
      </Head>
      <AppLayout
        user={user}
        organisation={user.organisation}
        breadcrumbs={breadcrumbs}
        title="Organisation Settings"
        docsUrl={docsUrl('/admin/organisation')}
      >
        <PageHeader
          title="Organisation Settings"
          description="Manage your organisation configuration and security preferences."
        />
        <div className="space-y-6 px-4 py-4 lg:px-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Information Section */}
            <div className="bg-card relative rounded-lg border shadow-sm">
              {loading && (
                <div className="bg-background/50 absolute inset-0 z-10 rounded-lg" />
              )}
              <div className="border-b px-6 py-4">
                <h3 className="text-base font-semibold">General Information</h3>
                <p className="text-muted-foreground mt-1 text-sm">
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
                    Organisation Name{' '}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => {
                      const newName = e.target.value;
                      setFormData((prev) => ({ ...prev, name: newName }));
                      // Clear validation error on change
                      if (validationErrors.name) {
                        setValidationErrors((prev) => ({
                          ...prev,
                          name: undefined,
                        }));
                      }
                    }}
                    onBlur={(e) => {
                      // Validate on blur
                      const error = validateName(e.target.value);
                      setValidationErrors((prev) => ({ ...prev, name: error }));
                    }}
                    required
                    disabled={loading}
                    className={
                      validationErrors.name ? 'border-destructive' : ''
                    }
                  />
                  {validationErrors.name && (
                    <p className="text-destructive text-xs">
                      {validationErrors.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Security Settings Section */}
            <div className="bg-card relative rounded-lg border shadow-sm">
              {loading && (
                <div className="bg-background/50 absolute inset-0 z-10 rounded-lg" />
              )}
              <div className="border-b px-6 py-4">
                <h3 className="text-base font-semibold">Security Settings</h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  Configure security policies for your organisation
                </p>
              </div>
              <div className="space-y-4 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="requireMfa">
                      Require Multi-Factor Authentication
                    </Label>
                    <p className="text-muted-foreground text-sm">
                      Force all users to enable MFA on their accounts
                    </p>
                  </div>
                  <Switch
                    id="requireMfa"
                    checked={formData.requireMfa}
                    onCheckedChange={(checked: boolean) =>
                      setFormData((prev) => ({ ...prev, requireMfa: checked }))
                    }
                    disabled={loading}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="sessionLifetime">Session Lifetime</Label>
                  <div className="flex gap-2">
                    <Input
                      id="sessionLifetime"
                      type="number"
                      min="1"
                      value={sessionLifetimeValue}
                      onChange={(e) => {
                        const value = parseInt(e.target.value, 10);
                        if (!isNaN(value) && value >= 1) {
                          setSessionLifetimeValue(value);
                          // Clear validation error on change
                          if (validationErrors.sessionLifetime) {
                            setValidationErrors((prev) => ({
                              ...prev,
                              sessionLifetime: undefined,
                            }));
                          }
                        }
                      }}
                      onBlur={() => {
                        // Validate on blur
                        const error = validateSessionLifetime(
                          sessionLifetimeValue,
                          sessionLifetimeUnit
                        );
                        setValidationErrors((prev) => ({
                          ...prev,
                          sessionLifetime: error,
                        }));
                      }}
                      required
                      disabled={loading}
                      className={
                        validationErrors.sessionLifetime
                          ? 'border-destructive flex-1'
                          : 'flex-1'
                      }
                    />
                    <Select
                      value={sessionLifetimeUnit}
                      onValueChange={(value: 'minutes' | 'hours' | 'days') => {
                        setSessionLifetimeUnit(value);
                        // Validate when unit changes
                        const error = validateSessionLifetime(
                          sessionLifetimeValue,
                          value
                        );
                        setValidationErrors((prev) => ({
                          ...prev,
                          sessionLifetime: error,
                        }));
                      }}
                      disabled={loading}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minutes">Minutes</SelectItem>
                        <SelectItem value="hours">Hours</SelectItem>
                        <SelectItem value="days">Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {validationErrors.sessionLifetime ? (
                    <p className="text-destructive text-xs">
                      {validationErrors.sessionLifetime}
                    </p>
                  ) : (
                    <p className="text-muted-foreground text-xs">
                      How long user sessions last before requiring
                      re-authentication (5 minutes to 7 days)
                    </p>
                  )}
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
              <Button
                type="submit"
                disabled={
                  loading || !hasChanges || success || hasValidationErrors
                }
              >
                {loading && (
                  <IconLoader2 className="mr-2 size-4 animate-spin" />
                )}
                {success && <IconCheck className="mr-2 size-4" />}
                {loading ? 'Saving...' : success ? 'Saved!' : 'Save Changes'}
              </Button>
            </div>
          </form>

          {/* Danger Zone */}
          <div className="border-destructive/50 bg-card rounded-lg border shadow-sm">
            <div className="border-destructive/50 border-b px-6 py-4">
              <h3 className="text-destructive text-base font-semibold">
                Danger Zone
              </h3>
              <p className="text-muted-foreground mt-1 text-sm">
                Irreversible and destructive actions
              </p>
            </div>
            <div className="px-6 py-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="font-medium">Delete Organisation</p>
                  <p className="text-muted-foreground text-sm">
                    Permanently delete this organisation and all associated
                    data. This action cannot be undone.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                  disabled={loading}
                >
                  <IconTrash className="mr-2 size-4" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DeleteOrganisationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          organisation={organisation}
        />
      </AppLayout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) =>
  requireAuth(context, async ({ context, user }) => {
    try {
      const client = createAuthenticatedClient(context, user);
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
