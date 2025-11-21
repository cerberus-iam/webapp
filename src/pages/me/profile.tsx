import { useEffect, useState } from 'react';

import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppLayout } from '@/layouts/app';
import { IamApiClient } from '@/lib/api/client';
import { MeApi, type Session } from '@/lib/api/me';
import { requireAuth } from '@/lib/auth/redirects';

export default function MyProfilePage({
  user,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [firstName, setFirstName] = useState(user.firstName || '');
  const [lastName, setLastName] = useState(user.lastName || '');
  const [phone, setPhone] = useState(user.phone || '');

  // Security tab state
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(
    null
  );

  const handleSave = async () => {
    setError(null);
    setIsSaving(true);

    try {
      const client = new IamApiClient();
      const meApi = new MeApi(client);

      const result = await meApi.updateProfile({
        firstName: firstName.trim() || null,
        lastName: lastName.trim() || null,
        phone: phone.trim() || null,
      });

      if (!result.ok) {
        const errorMessage =
          (result.error as { detail?: string; title?: string }).detail ||
          (result.error as { detail?: string; title?: string }).title ||
          'Failed to update profile';
        setError(errorMessage);
        setIsSaving(false);
        return;
      }

      // Success - reload to get fresh data
      router.reload();
    } catch {
      setError('An unexpected error occurred');
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    setFirstName(user.firstName || '');
    setLastName(user.lastName || '');
    setPhone(user.phone || '');
    setError(null);
    setIsEditing(false);
  };

  const loadSessions = async () => {
    setIsLoadingSessions(true);
    setSessionError(null);

    try {
      const client = new IamApiClient();
      const meApi = new MeApi(client);
      const result = await meApi.listSessions();

      if (!result.ok) {
        const errorMessage =
          (result.error as { detail?: string; title?: string }).detail ||
          (result.error as { detail?: string; title?: string }).title ||
          'Failed to load sessions';
        setSessionError(errorMessage);
      } else {
        setSessions(result.value.sessions);
      }
    } catch {
      setSessionError('An unexpected error occurred');
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    if (
      !confirm(
        'Are you sure you want to revoke this session? The user will be logged out from that device.'
      )
    ) {
      return;
    }

    setRevokingSessionId(sessionId);

    try {
      const client = new IamApiClient();
      const meApi = new MeApi(client);
      const result = await meApi.revokeSession(sessionId);

      if (!result.ok) {
        const errorMessage =
          (result.error as { detail?: string; title?: string }).detail ||
          (result.error as { detail?: string; title?: string }).title ||
          'Failed to revoke session';
        setSessionError(errorMessage);
      } else {
        // Refresh sessions list
        await loadSessions();
      }
    } catch {
      setSessionError('An unexpected error occurred');
    } finally {
      setRevokingSessionId(null);
    }
  };

  // Load sessions when Security tab is viewed
  useEffect(() => {
    const handleTabChange = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const tab = urlParams.get('tab');
      if (tab === 'security') {
        loadSessions();
      }
    };

    handleTabChange();
    window.addEventListener('popstate', handleTabChange);
    return () => window.removeEventListener('popstate', handleTabChange);
  }, []);

  return (
    <AppLayout
      user={user}
      breadcrumbs={[{ label: 'My Profile', href: '/me/profile' }]}
    >
      <div className="flex max-w-5xl flex-col gap-6 px-4 py-4 md:py-6 lg:px-6">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="api-keys">API Keys</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and email address
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
                    {error}
                  </div>
                )}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={user.email}
                    disabled
                    placeholder="Email"
                    className="bg-muted"
                  />
                  <p className="text-muted-foreground text-xs">
                    Email cannot be changed from this page
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isSaving}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)}>
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api-keys" className="mt-6 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>
                  API key management for your organisation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 rounded-lg border p-8 text-center">
                  <p className="text-muted-foreground text-sm">
                    API keys are managed at the organisation level.
                  </p>
                  <p className="text-muted-foreground mt-2 text-sm">
                    If you have admin permissions, you can manage API keys in{' '}
                    <Link
                      href="/settings/api-keys"
                      className="text-primary font-medium underline-offset-4 hover:underline"
                    >
                      Organisation Settings
                    </Link>
                    .
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-6 space-y-4">
            {/* Password Change */}
            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>Change your account password</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 rounded-lg border p-6">
                  <p className="text-muted-foreground text-sm">
                    To change your password, use the{' '}
                    <Link
                      href="/forgot-password"
                      className="text-primary font-medium underline-offset-4 hover:underline"
                    >
                      forgot password
                    </Link>{' '}
                    flow.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Active Sessions */}
            <Card>
              <CardHeader>
                <CardTitle>Active Sessions</CardTitle>
                <CardDescription>
                  Manage your active login sessions across devices
                </CardDescription>
              </CardHeader>
              <CardContent>
                {sessionError && (
                  <div className="border-destructive bg-destructive/10 text-destructive mb-4 rounded-lg border p-3 text-sm">
                    {sessionError}
                  </div>
                )}

                {isLoadingSessions ? (
                  <div className="space-y-3">
                    <div className="bg-muted h-20 animate-pulse rounded-lg" />
                    <div className="bg-muted h-20 animate-pulse rounded-lg" />
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="bg-muted/50 rounded-lg border p-6 text-center">
                    <p className="text-muted-foreground text-sm">
                      No active sessions found
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-start justify-between rounded-lg border p-4"
                      >
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">
                              {session.userAgent || 'Unknown Device'}
                            </p>
                            {session.isCurrent && (
                              <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                                Current
                              </span>
                            )}
                          </div>
                          {session.ipAddress && (
                            <p className="text-muted-foreground text-sm">
                              IP: {session.ipAddress}
                            </p>
                          )}
                          <p className="text-muted-foreground text-xs">
                            Last active:{' '}
                            {new Date(session.lastActiveAt).toLocaleString()}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRevokeSession(session.id)}
                          disabled={
                            session.isCurrent ||
                            revokingSessionId === session.id
                          }
                        >
                          {revokingSessionId === session.id
                            ? 'Revoking...'
                            : 'Revoke'}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* MFA */}
            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>
                  Add an extra layer of security to your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 rounded-lg border p-6">
                  <p className="text-muted-foreground text-sm">
                    MFA configuration coming soon
                  </p>
                  <p className="text-muted-foreground mt-2 text-xs">
                    Enable time-based one-time passwords (TOTP) using an
                    authenticator app
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) =>
  requireAuth(context, async () => ({}));
