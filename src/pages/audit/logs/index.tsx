import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';

import { columns } from '@/components/tables/audit/logs/columns';
import { DataTable } from '@/components/tables/audit/logs/data-table';
import { AppLayout } from '@/layouts/app';
import { AuditLogsApi } from '@/lib/api/audit-logs';
import { createServerApiClient } from '@/lib/auth/client-factory';
import { requireAuth } from '@/lib/auth/redirects';

export default function AuditLogsPage({
  user,
  initialAuditLogs,
  total,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Audit Logs' },
  ];

  return (
    <AppLayout
      user={user}
      breadcrumbs={breadcrumbs}
      title="Audit Logs"
      docsUrl="https://docs.cerberus-iam.com/admin/audit-logs"
    >
      <div className="space-y-4 px-4 py-5 lg:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Audit & Activity</h3>
            <p className="text-muted-foreground text-sm">
              View activity history and security events across your
              organization.
              {total > 0 && ` Total: ${total} events`}
            </p>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={initialAuditLogs}
          facetedFilters={[
            {
              columnId: 'eventCategory',
              title: 'Category',
              options: [
                { label: 'Auth', value: 'auth' },
                { label: 'User', value: 'user' },
                { label: 'Client', value: 'client' },
                { label: 'Permission', value: 'permission' },
                { label: 'System', value: 'system' },
              ],
            },
            {
              columnId: 'action',
              title: 'Action',
              options: [
                { label: 'Create', value: 'create' },
                { label: 'Read', value: 'read' },
                { label: 'Update', value: 'update' },
                { label: 'Delete', value: 'delete' },
                { label: 'Login', value: 'login' },
                { label: 'Logout', value: 'logout' },
              ],
            },
            {
              columnId: 'success',
              title: 'Status',
              options: [
                { label: 'Success', value: 'true' },
                { label: 'Failed', value: 'false' },
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
    const client = createServerApiClient(context);
    const auditLogsApi = new AuditLogsApi(client);

    const result = await auditLogsApi.list({
      limit: 100,
      sort: 'timestamp',
      order: 'desc',
    });

    if (!result.ok) {
      console.error('Failed to fetch audit logs:', result.error);
      return { initialAuditLogs: [], total: 0 };
    }

    // Handle both response formats: { data: [], pagination: {} } and { data: [], total: 0 }
    const apiResponse = result.value as unknown as Record<string, unknown>;
    const total =
      ((apiResponse.pagination as Record<string, unknown> | undefined)
        ?.total as number | undefined) ||
      (apiResponse.total as number | undefined) ||
      result.value.data.length ||
      0;

    return {
      initialAuditLogs: result.value.data,
      total,
    };
  });
