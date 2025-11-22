import { useMemo, useState } from 'react';

import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';

import { IconPlus } from '@tabler/icons-react';

import { CreateClientDialog } from '@/components/clients/create-client-dialog';
import { EditClientDialog } from '@/components/clients/edit-client-dialog';
import { RevokeClientDialog } from '@/components/clients/revoke-client-dialog';
import { RotateSecretDialog } from '@/components/clients/rotate-secret-dialog';
import { createColumns } from '@/components/tables/applications/clients/columns';
import { DataTable } from '@/components/tables/applications/clients/data-table';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/layouts/app';
import type { OAuth2Client } from '@/lib/api/clients';
import { ClientsApi } from '@/lib/api/clients';
import { createServerApiClient } from '@/lib/auth/client-factory';
import { requireAuth } from '@/lib/auth/redirects';

export default function ClientsPage({
  user,
  clients,
  total,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [rotateSecretDialogOpen, setRotateSecretDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<OAuth2Client | null>(
    null
  );

  const handleEdit = (client: OAuth2Client) => {
    setSelectedClient(client);
    setEditDialogOpen(true);
  };

  const handleRevoke = (client: OAuth2Client) => {
    setSelectedClient(client);
    setRevokeDialogOpen(true);
  };

  const handleRotateSecret = (client: OAuth2Client) => {
    setSelectedClient(client);
    setRotateSecretDialogOpen(true);
  };

  const columns = useMemo(
    () =>
      createColumns({
        onEdit: handleEdit,
        onRevoke: handleRevoke,
        onRotateSecret: handleRotateSecret,
      }),
    []
  );

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Clients' },
  ];

  return (
    <AppLayout
      user={user}
      breadcrumbs={breadcrumbs}
      title="OAuth2 Clients"
      docsUrl="https://docs.cerberus-iam.com/admin/clients"
    >
      <div className="space-y-4 px-4 py-5 lg:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">OAuth2 Client Management</h3>
            <p className="text-muted-foreground text-sm">
              Manage OAuth2/OIDC clients and applications for your organization.
              {total > 0 && ` Total: ${total} clients`}
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <IconPlus className="mr-2 size-4" />
            Add Client
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={clients}
          searchKey="name"
          searchPlaceholder="Search clients..."
        />
      </div>

      <CreateClientDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      {selectedClient && (
        <>
          <EditClientDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            client={selectedClient}
          />

          <RevokeClientDialog
            open={revokeDialogOpen}
            onOpenChange={setRevokeDialogOpen}
            client={selectedClient}
          />

          <RotateSecretDialog
            open={rotateSecretDialogOpen}
            onOpenChange={setRotateSecretDialogOpen}
            client={selectedClient}
          />
        </>
      )}
    </AppLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) =>
  requireAuth(context, async ({ context }) => {
    try {
      const client = createServerApiClient(context);
      const clientsApi = new ClientsApi(client);

      const result = await clientsApi.list({ limit: 100 });

      if (!result.ok) {
        console.error('Failed to fetch clients:', result.error);
        return { clients: [], total: 0 };
      }

      // Handle both response formats: { clients: [], pagination: {} } and { data: [], total: 0 }
      const apiResponse = result.value as unknown as Record<string, unknown>;
      const clients = (apiResponse.clients ||
        apiResponse.data ||
        []) as OAuth2Client[];
      const total =
        ((apiResponse.pagination as Record<string, unknown> | undefined)
          ?.total as number | undefined) ||
        (apiResponse.total as number | undefined) ||
        (apiResponse.count as number | undefined) ||
        0;

      return {
        clients,
        total,
      };
    } catch (error) {
      console.error('Error fetching clients:', error);
      return { clients: [], total: 0 };
    }
  });
