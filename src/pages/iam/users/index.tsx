import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import {
  IconBan,
  IconCheck,
  IconDotsVertical,
  IconEdit,
  IconEye,
  IconMail,
  IconPlus,
  IconSearch,
  IconShield,
  IconTrash,
  IconUserPlus,
} from '@tabler/icons-react';
import { format } from 'date-fns';

import { AppLayout } from '@/components/layout/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useIamUsers } from '@/hooks/use-iam-data';
import type { UserSummary } from '@/types/api';
import type { NextPageWithLayout } from '@/types/page';

const UsersPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { data: users, isLoading, error, refresh } = useIamUsers();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = useMemo<UserSummary[]>(() => {
    if (!users) return [];
    if (!searchQuery.trim()) return users;

    const query = searchQuery.toLowerCase();
    return users.filter((user) => {
      const matchName = user.name.toLowerCase().includes(query);
      const matchEmail = user.email.toLowerCase().includes(query);
      const matchRole = user.roles.some((role) => role.name.toLowerCase().includes(query));
      return matchName || matchEmail || matchRole;
    });
  }, [users, searchQuery]);

  const handleViewUser = (userId: string) => {
    void router.push(`/iam/users/${userId}`);
  };

  const handleEditUser = (userId: string) => {
    void router.push(`/iam/users/${userId}/edit`);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    console.log('Delete user:', userId);
    await refresh();
  };

  const getUserStatus = (user: UserSummary) => {
    if (user.blockedAt) {
      return (
        <Badge variant="destructive">
          <IconBan className="mr-1 size-3" />
          Blocked
        </Badge>
      );
    }

    if (!user.emailVerifiedAt) {
      return (
        <Badge variant="secondary">
          <IconMail className="mr-1 size-3" />
          Unverified
        </Badge>
      );
    }

    return (
      <Badge variant="default" className="bg-green-500">
        <IconCheck className="mr-1 size-3" />
        Active
      </Badge>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">Manage user accounts and permissions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void router.push('/iam/users/invite')}>
            <IconUserPlus className="mr-2 size-4" />
            Invite User
          </Button>
          <Button onClick={() => void router.push('/iam/users/new')}>
            <IconPlus className="mr-2 size-4" />
            Add User
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                {isLoading ? (
                  <Skeleton className="h-4 w-32" />
                ) : (
                  `${filteredUsers.length} user${filteredUsers.length !== 1 ? 's' : ''} total`
                )}
              </CardDescription>
            </div>
            <div className="flex w-full max-w-sm items-center space-x-2">
              <div className="relative flex-1">
                <IconSearch className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search users..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="rounded-md bg-destructive/10 p-4 text-destructive">{error}</div>
          )}

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>MFA</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="w-[70px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                        {searchQuery ? 'No users found matching your search.' : 'No users yet.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{user.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {user.firstName} {user.lastName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm">{user.email}</span>
                        </TableCell>
                        <TableCell>{getUserStatus(user)}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.roles.length === 0 ? (
                              <span className="text-xs text-muted-foreground">No roles</span>
                            ) : (
                              user.roles.map((role) => (
                                <Badge key={role.id} variant="outline">
                                  <IconShield className="mr-1 size-3" />
                                  {role.name}
                                </Badge>
                              ))
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.mfaEnabled ? (
                            <Badge variant="default" className="bg-blue-500">
                              <IconShield className="mr-1 size-3" />
                              Enabled
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Disabled</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(user.createdAt), 'MMM d, yyyy')}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <IconDotsVertical className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewUser(user.id)}>
                                <IconEye className="mr-2 size-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditUser(user.id)}>
                                <IconEdit className="mr-2 size-4" />
                                Edit User
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-destructive"
                              >
                                <IconTrash className="mr-2 size-4" />
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

UsersPage.getLayout = (page) => (
  <AppLayout
    title="Users"
    description="Manage user accounts and permissions"
    breadcrumbs={[{ label: 'IAM' }, { label: 'Users' }]}
  >
    {page}
  </AppLayout>
);

export default UsersPage;
