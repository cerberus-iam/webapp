import { useMemo, useState } from 'react';

import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';

import { IconPlus } from '@tabler/icons-react';

import { createColumns } from '@/components/tables/directory/users/columns';
import { DataTable } from '@/components/tables/directory/users/data-table';
import { Button } from '@/components/ui/button';
import { CreateUserDialog } from '@/components/users/create-user-dialog';
import { DeleteUserDialog } from '@/components/users/delete-user-dialog';
import { EditUserDialog } from '@/components/users/edit-user-dialog';
import { AppLayout } from '@/layouts/app';
import { createServerApiClient } from '@/lib/auth/client-factory';
import { requireAuth } from '@/lib/auth/redirects';
import type { User } from '@/types/iam';

interface UsersListResponse {
  users: User[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

export default function UsersPage({
  user,
  users,
  total,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const columns = useMemo(
    () => createColumns({ onEdit: handleEdit, onDelete: handleDelete }),
    []
  );

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Users' },
  ];

  return (
    <AppLayout
      user={user}
      breadcrumbs={breadcrumbs}
      title="Users"
      docsUrl="https://docs.cerberus-iam.com/admin/users"
    >
      <div className="space-y-4 px-4 py-5 lg:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">User Management</h3>
            <p className="text-muted-foreground text-sm">
              Manage users, roles, and permissions for your organization.
              {total > 0 && ` Total: ${total} users`}
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <IconPlus className="mr-2 size-4" />
            Add User
          </Button>
        </div>
        <DataTable
          columns={columns}
          data={users}
          searchKey="email"
          searchPlaceholder="Search by email..."
          facetedFilters={[
            {
              columnId: 'status',
              title: 'Status',
              options: [
                { label: 'Active', value: 'active' },
                { label: 'Blocked', value: 'blocked' },
              ],
            },
          ]}
        />
      </div>

      <CreateUserDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      <EditUserDialog
        user={selectedUser}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />

      <DeleteUserDialog
        user={selectedUser}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </AppLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) =>
  requireAuth(context, async ({ context }) => {
    try {
      const client = createServerApiClient(context);
      const response = await client.request<UsersListResponse>(
        '/v1/admin/users',
        {
          method: 'GET',
          query: {
            limit: 50,
            offset: 0,
          },
        }
      );

      if (!response.ok) {
        console.error('Failed to fetch users:', response.error);
        return { users: [], total: 0 };
      }

      return {
        users: response.value.users,
        total: response.value.pagination.total,
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      return { users: [], total: 0 };
    }
  });
