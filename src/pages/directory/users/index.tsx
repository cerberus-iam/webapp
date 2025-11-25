import { useMemo, useState } from 'react';

import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Head from 'next/head';

import { IconPlus } from '@tabler/icons-react';

import { PageHeader } from '@/components/page-header';
import { createColumns } from '@/components/tables/directory/users/columns';
import { DataTable } from '@/components/tables/directory/users/data-table';
import { Button } from '@/components/ui/button';
import { CreateUserDialog } from '@/components/users/create-user-dialog';
import { DeleteUserDialog } from '@/components/users/delete-user-dialog';
import { EditUserDialog } from '@/components/users/edit-user-dialog';
import { ManageUserRolesDialog } from '@/components/users/manage-user-roles-dialog';
import { docsUrl } from '@/config/urls';
import { AppLayout } from '@/layouts/app';
import { createAuthenticatedClient, requireAuth } from '@/lib/auth/redirects';
import type { User, UsersListResponse } from '@/types/iam';

export default function UsersPage({
  user,
  users,
  total,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [manageRolesDialogOpen, setManageRolesDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleManageRoles = (user: User) => {
    setSelectedUser(user);
    setManageRolesDialogOpen(true);
  };

  const handleCreateUser = () => {
    setCreateDialogOpen(true);
  };

  const columns = useMemo(
    () =>
      createColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
        onManageRoles: handleManageRoles,
      }),
    []
  );

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Users' },
  ];

  return (
    <>
      <Head>
        <title>Users | Cerberus IAM</title>
      </Head>
      <AppLayout
        user={user}
        organisation={user.organisation}
        breadcrumbs={breadcrumbs}
        title="Users"
        docsUrl={docsUrl('/admin/users')}
      >
        <PageHeader
          title="Users"
          description={`Manage users, roles, and permissions for your organization.${total > 0 ? ` ${total} user${total === 1 ? '' : 's'} total.` : ''}`}
          actions={
            <Button onClick={() => setCreateDialogOpen(true)}>
              <IconPlus className="mr-2 size-4" />
              Add User
            </Button>
          }
        />
        <div className="space-y-4 px-4 py-4 lg:px-6">
          <DataTable
            columns={columns}
            data={users}
            searchKey="user"
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
            emptyState={{
              title: total === 0 ? 'No users yet' : 'No users found',
              description:
                total === 0
                  ? 'Get started by adding your first user to the organization.'
                  : "Try adjusting your search or filters to find what you're looking for.",
              ...(total === 0 && {
                action: {
                  label: 'Add User',
                  onClick: handleCreateUser,
                },
              }),
            }}
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

        <ManageUserRolesDialog
          user={selectedUser}
          open={manageRolesDialogOpen}
          onOpenChange={setManageRolesDialogOpen}
        />
      </AppLayout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) =>
  requireAuth(context, async ({ context, user }) => {
    try {
      const client = createAuthenticatedClient(context, user);
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

      // API returns { data: User[], total: number }
      const { data, total } = response.value;

      return {
        users: data,
        total,
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      return { users: [], total: 0 };
    }
  });
