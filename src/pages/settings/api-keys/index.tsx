import { useMemo, useState } from 'react';

import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';

import { IconPlus } from '@tabler/icons-react';

import { CreateApiKeyDialog } from '@/components/api-keys/create-api-key-dialog';
import { RevokeApiKeyDialog } from '@/components/api-keys/revoke-api-key-dialog';
import { PageHeader } from '@/components/page-header';
import { createColumns } from '@/components/tables/settings/api-keys/columns';
import { DataTable } from '@/components/tables/settings/api-keys/data-table';
import { Button } from '@/components/ui/button';
import { docsUrl } from '@/config/urls';
import { AppLayout } from '@/layouts/app';
import { type ApiKey, ApiKeysApi } from '@/lib/api/api-keys';
import { createAuthenticatedClient } from '@/lib/auth/redirects';
import { requireAuth } from '@/lib/auth/redirects';

export default function ApiKeysPage({
  user,
  initialApiKeys,
  total,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [selectedApiKey, setSelectedApiKey] = useState<ApiKey | null>(null);

  const handleRevoke = (apiKey: ApiKey) => {
    setSelectedApiKey(apiKey);
    setRevokeDialogOpen(true);
  };

  const columns = useMemo(() => createColumns(handleRevoke), []);

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'API Keys' },
  ];

  return (
    <AppLayout
      user={user}
      organisation={user.organisation}
      breadcrumbs={breadcrumbs}
      title="API Keys"
      docsUrl={docsUrl('/admin/api-keys')}
    >
      <PageHeader
        title="API Keys"
        description={`Manage API keys for server-to-server authentication.${total > 0 ? ` ${total} key${total === 1 ? '' : 's'} total.` : ''}`}
        actions={
          <Button onClick={() => setCreateDialogOpen(true)}>
            <IconPlus className="mr-2 size-4" />
            Create API Key
          </Button>
        }
      />
      <div className="space-y-4 px-4 py-4 lg:px-6">
        <DataTable
          columns={columns}
          data={initialApiKeys}
          searchKey="name"
          searchPlaceholder="Search API keys..."
          facetedFilters={[
            {
              columnId: 'status',
              title: 'Status',
              options: [
                { label: 'Active', value: 'active' },
                { label: 'Revoked', value: 'revoked' },
              ],
            },
          ]}
        />
      </div>

      <CreateApiKeyDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      <RevokeApiKeyDialog
        open={revokeDialogOpen}
        onOpenChange={setRevokeDialogOpen}
        apiKey={selectedApiKey}
      />
    </AppLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) =>
  requireAuth(context, async ({ context, user }) => {
    const client = createAuthenticatedClient(context, user);
    const apiKeysApi = new ApiKeysApi(client);

    const result = await apiKeysApi.list({
      limit: 100,
      sort: 'createdAt',
      order: 'desc',
    });

    if (!result.ok) {
      console.error('Failed to fetch API keys:', result.error);
      return { initialApiKeys: [], total: 0 };
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
      initialApiKeys: result.value.data,
      total,
    };
  });
