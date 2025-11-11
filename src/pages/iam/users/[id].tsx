import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  IconArrowLeft,
  IconEdit,
  IconTrash,
  IconShield,
  IconMail,
  IconPhone,
  IconCalendar,
  IconCheck,
  IconBan,
  IconPlus,
  IconX,
} from '@tabler/icons-react';
import { format } from 'date-fns';

import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { iamApi } from '@/lib/iam/api';
import { useIamRoles } from '@/hooks/use-iam-data';
import type { UserSummary } from '@/types/api';
import type { NextPageWithLayout } from '@/types/page';
import { getApiErrorMessage } from '@/lib/http';

const UserDetailPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState<UserSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAddRoleDialog, setShowAddRoleDialog] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [isAddingRole, setIsAddingRole] = useState(false);

  const { data: allRoles, isLoading: rolesLoading } = useIamRoles();

  const availableRoles =
    allRoles?.filter((role) => !user?.roles.some((ur) => ur.id === role.id)) || [];

  useEffect(() => {
    if (!id || typeof id !== 'string') return;

    const fetchUser = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await iamApi.admin.users.get(id);
        setUser(data);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Failed to load user'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleDelete = async () => {
    if (!user || !confirm(`Are you sure you want to delete ${user.name}?`)) return;

    setIsDeleting(true);
    try {
      await iamApi.admin.users.delete(user.id);
      router.push('/iam/users');
    } catch (err) {
      alert(getApiErrorMessage(err, 'Failed to delete user'));
      setIsDeleting(false);
    }
  };

  const handleRemoveRole = async (roleId: string) => {
    if (!user) return;

    try {
      await iamApi.admin.users.unassignRole(user.id, roleId);
      setUser({
        ...user,
        roles: user.roles.filter((r) => r.id !== roleId),
      });
    } catch (err) {
      alert(getApiErrorMessage(err, 'Failed to remove role'));
    }
  };

  const handleAddRole = async () => {
    if (!user || !selectedRoleId) return;

    setIsAddingRole(true);
    try {
      await iamApi.admin.users.assignRole(user.id, selectedRoleId);

      const roleToAdd = allRoles?.find((r) => r.id === selectedRoleId);
      if (roleToAdd) {
        setUser({
          ...user,
          roles: [...user.roles, { id: roleToAdd.id, name: roleToAdd.name, slug: roleToAdd.slug }],
        });
      }

      setShowAddRoleDialog(false);
      setSelectedRoleId('');
    } catch (err) {
      alert(getApiErrorMessage(err, 'Failed to add role'));
    } finally {
      setIsAddingRole(false);
    }
  };

  const getUserStatus = (user: UserSummary) => {
    if (user.blockedAt) {
      return {
        variant: 'destructive' as const,
        icon: IconBan,
        label: 'Blocked',
        detail: user.blockedReason || 'No reason provided',
      };
    }
    if (!user.emailVerifiedAt) {
      return {
        variant: 'secondary' as const,
        icon: IconMail,
        label: 'Unverified',
        detail: 'Email not verified',
      };
    }
    return {
      variant: 'default' as const,
      icon: IconCheck,
      label: 'Active',
      detail: 'Account is active',
    };
  };

  if (isLoading) {
    return (
      <SidebarProvider
        style={
          {
            '--sidebar-width': 'calc(var(--spacing) * 72)',
            '--header-height': 'calc(var(--spacing) * 12)',
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col gap-4 p-4 pt-6 md:p-6">
            <Skeleton className="h-8 w-64" />
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (error || !user) {
    return (
      <SidebarProvider
        style={
          {
            '--sidebar-width': 'calc(var(--spacing) * 72)',
            '--header-height': 'calc(var(--spacing) * 12)',
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col gap-4 p-4 pt-6 md:p-6">
            <div className="rounded-md bg-destructive/10 p-4 text-destructive">
              {error || 'User not found'}
            </div>
            <Button variant="outline" onClick={() => router.push('/iam/users')}>
              <IconArrowLeft className="mr-2 size-4" />
              Back to Users
            </Button>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  const status = getUserStatus(user);

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-6 md:p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/iam/users')}
                className="mb-2"
              >
                <IconArrowLeft className="mr-2 size-4" />
                Back to Users
              </Button>
              <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push(`/iam/users/${user.id}/edit`)}>
                <IconEdit className="mr-2 size-4" />
                Edit
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                <IconTrash className="mr-2 size-4" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Information</CardTitle>
                <CardDescription>Basic account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge
                    variant={status.variant}
                    className={status.variant === 'default' ? 'bg-green-500' : ''}
                  >
                    <status.icon className="mr-1 size-3" />
                    {status.label}
                  </Badge>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <IconMail className="mt-0.5 size-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Email</p>
                      <p className="font-mono text-sm text-muted-foreground">{user.email}</p>
                      {user.emailVerifiedAt && (
                        <p className="text-xs text-muted-foreground">
                          Verified {format(new Date(user.emailVerifiedAt), 'MMM d, yyyy')}
                        </p>
                      )}
                    </div>
                  </div>
                  {user.phone && (
                    <>
                      <Separator />
                      <div className="flex items-start gap-2">
                        <IconPhone className="mt-0.5 size-4 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Phone</p>
                          <p className="text-sm text-muted-foreground">{user.phone}</p>
                        </div>
                      </div>
                    </>
                  )}
                  <Separator />
                  <div className="flex items-start gap-2">
                    <IconCalendar className="mt-0.5 size-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Joined</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(user.createdAt), 'MMMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start gap-2">
                    <IconShield className="mt-0.5 size-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Multi-Factor Authentication</p>
                      <Badge
                        variant={user.mfaEnabled ? 'default' : 'secondary'}
                        className={user.mfaEnabled ? 'bg-blue-500' : ''}
                      >
                        {user.mfaEnabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Roles & Permissions</CardTitle>
                    <CardDescription>User access roles</CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowAddRoleDialog(true)}
                    disabled={availableRoles.length === 0}
                  >
                    <IconPlus className="mr-1 size-3" />
                    Add Role
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {user.roles.length === 0 ? (
                  <div className="rounded-md border border-dashed p-8 text-center">
                    <IconShield className="mx-auto size-8 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">No roles assigned</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {user.roles.map((role) => (
                      <div
                        key={role.id}
                        className="flex items-center justify-between rounded-md border p-3"
                      >
                        <div className="flex items-center gap-2">
                          <IconShield className="size-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{role.name}</p>
                            <p className="text-xs text-muted-foreground">{role.slug}</p>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => handleRemoveRole(role.id)}>
                          <IconX className="size-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>

      <Dialog open={showAddRoleDialog} onOpenChange={setShowAddRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Role</DialogTitle>
            <DialogDescription>Assign a new role to this user</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddRoleDialog(false)}
              disabled={isAddingRole}
            >
              Cancel
            </Button>
            <Button onClick={handleAddRole} disabled={!selectedRoleId || isAddingRole}>
              {isAddingRole ? 'Adding...' : 'Add Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default UserDetailPage;
