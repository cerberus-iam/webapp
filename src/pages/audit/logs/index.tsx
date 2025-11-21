import type { GetServerSideProps } from 'next';

import { type AuditLog, AuditLogsApi } from '@/lib/api/audit-logs';
import { createServerApiClient } from '@/lib/auth/client-factory';
import { requireAuth } from '@/lib/auth/redirects';

import { columns } from './_columns';
import { DataTable } from './_data-table';

interface AuditLogsPageProps {
  initialAuditLogs: AuditLog[];
}

export default function AuditLogsPage({
  initialAuditLogs,
}: AuditLogsPageProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Audit Logs</h1>
          <p className="text-muted-foreground">
            View activity history and security events across your organization
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
      return { initialAuditLogs: [] };
    }

    return {
      initialAuditLogs: result.value.data,
    };
  });
