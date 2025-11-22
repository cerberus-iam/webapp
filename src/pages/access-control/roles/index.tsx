import { useMemo, useState } from 'react';

import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';

import { IconPlus } from '@tabler/icons-react';

import { CreateRoleDialog } from '@/components/roles/create-role-dialog';
import { DeleteRoleDialog } from '@/components/roles/delete-role-dialog';
import { EditRoleDialog } from '@/components/roles/edit-role-dialog';
import { ManagePermissionsDialog } from '@/components/roles/manage-permissions-dialog';
import { createColumns } from '@/components/tables/access-control/roles/columns';
import { DataTable } from '@/components/tables/access-control/roles/data-table';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/layouts/app';
import type { ListRolesResponse, Role } from '@/lib/api/roles';
import { createServerApiClient } from '@/lib/auth/client-factory';
import { requireAuth } from '@/lib/auth/redirects';

export default function RolesPage({
  user,
  roles,
  total,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setEditDialogOpen(true);
  };

  const handleDelete = (role: Role) => {
    setSelectedRole(role);
    setDeleteDialogOpen(true);
  };

  const handleManagePermissions = (role: Role) => {
    setSelectedRole(role);
    setPermissionsDialogOpen(true);
  };

  const columns = useMemo(
    () =>
      createColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
        onManagePermissions: handleManagePermissions,
      }),
    []
  );

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Roles' },
  ];

  return (
    <AppLayout
      user={user}
      breadcrumbs={breadcrumbs}
      title="Roles & Permissions"
      docsUrl="https://docs.cerberus-iam.com/admin/roles"
    >
      <div className="space-y-4 px-4 py-5 lg:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Role Management</h3>
            <p className="text-muted-foreground text-sm">
              Create and manage roles to control access to your organization.
              {total > 0 && ` Total: ${total} roles`}
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <IconPlus className="mr-2 size-4" />
            Create Role
          </Button>
        </div>
        <DataTable
          columns={columns}
          data={roles}
          searchKey="name"
          searchPlaceholder="Search roles..."
        />
      </div>

      <CreateRoleDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      <EditRoleDialog
        role={selectedRole}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />

      <DeleteRoleDialog
        role={selectedRole}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />

      <ManagePermissionsDialog
        role={selectedRole}
        open={permissionsDialogOpen}
        onOpenChange={setPermissionsDialogOpen}
      />
    </AppLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) =>
  requireAuth(context, async ({ context }) => {
    try {
      const client = createServerApiClient(context);
      const response = await client.request<ListRolesResponse>(
        '/v1/admin/roles',
        {
          method: 'GET',
          query: {
            limit: 50,
            offset: 0,
          },
        }
      );

      if (!response.ok) {
        console.error('Failed to fetch roles:', response.error);
        return { roles: [], total: 0 };
      }

      // Handle both response formats: { roles: [], pagination: {} } and { data: [], total: 0 }
      const apiResponse = response.value as unknown as Record<string, unknown>;
      const roles = (apiResponse.roles || apiResponse.data || []) as Role[];
      const total =
        ((apiResponse.pagination as Record<string, unknown> | undefined)
          ?.total as number | undefined) ||
        (apiResponse.total as number | undefined) ||
        (apiResponse.count as number | undefined) ||
        0;

      return {
        roles,
        total,
      };
    } catch (error) {
      console.error('Error fetching roles:', error);
      return { roles: [], total: 0 };
    }
  });
