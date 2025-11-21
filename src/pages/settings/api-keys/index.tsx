import { useState } from 'react';

import type { GetServerSideProps } from 'next';

import { IconPlus } from '@tabler/icons-react';

import { CreateApiKeyDialog } from '@/components/api-keys/create-api-key-dialog';
import { RevokeApiKeyDialog } from '@/components/api-keys/revoke-api-key-dialog';
import { createColumns } from '@/components/tables/settings/api-keys/columns';
import { DataTable } from '@/components/tables/settings/api-keys/data-table';
import { Button } from '@/components/ui/button';
import { type ApiKey, ApiKeysApi } from '@/lib/api/api-keys';
import { createServerApiClient } from '@/lib/auth/client-factory';
import { requireAuth } from '@/lib/auth/redirects';

interface ApiKeysPageProps {
  initialApiKeys: ApiKey[];
}

export default function ApiKeysPage({ initialApiKeys }: ApiKeysPageProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [selectedApiKey, setSelectedApiKey] = useState<ApiKey | null>(null);

  const handleRevoke = (apiKey: ApiKey) => {
    setSelectedApiKey(apiKey);
    setRevokeDialogOpen(true);
  };

  const columns = createColumns(handleRevoke);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">API Keys</h1>
          <p className="text-muted-foreground">
            Manage API keys for server-to-server authentication
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <IconPlus className="mr-2 h-4 w-4" />
          Create API Key
        </Button>
      </div>

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

      <CreateApiKeyDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      <RevokeApiKeyDialog
        open={revokeDialogOpen}
        onOpenChange={setRevokeDialogOpen}
        apiKey={selectedApiKey}
      />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) =>
  requireAuth(context, async ({ context }) => {
    const client = createServerApiClient(context);
    const apiKeysApi = new ApiKeysApi(client);

    const result = await apiKeysApi.list({
      limit: 100,
      sort: 'createdAt',
      order: 'desc',
    });

    if (!result.ok) {
      console.error('Failed to fetch API keys:', result.error);
      return { initialApiKeys: [] };
    }

    return {
      initialApiKeys: result.value.data,
    };
  });
