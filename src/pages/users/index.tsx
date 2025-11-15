import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';

import { AppLayout } from '@/layouts/app';
import { createServerApiClient } from '@/lib/auth/client-factory';
import { requireAuth } from '@/lib/auth/redirects';
import { columns } from '@/pages/users/columns';
import { DataTable } from '@/pages/users/data-table';
import type { User } from '@/types/iam';

interface UsersListResponse {
  data: User[];
  total: number;
}

export default function UsersPage({
  user,
  users,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
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
        <div>
          <h3 className="text-lg font-medium">User Management</h3>
          <p className="text-muted-foreground text-sm">
            Manage users, roles, and permissions for your organization.
          </p>
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
        }
      );

      if (!response.ok) {
        console.error('Failed to fetch users:', response.error);
        return { users: [] };
      }

      return {
        users: response.value.data,
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      return { users: [] };
    }
  });
