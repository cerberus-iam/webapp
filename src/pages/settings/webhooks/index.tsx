import { useMemo, useState } from 'react';

import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';

import { IconPlus } from '@tabler/icons-react';

import { PageHeader } from '@/components/page-header';
import { createColumns } from '@/components/tables/settings/webhooks/columns';
import { DataTable } from '@/components/tables/settings/webhooks/data-table';
import { Button } from '@/components/ui/button';
import { CreateWebhookDialog } from '@/components/webhooks/create-webhook-dialog';
import { DeleteWebhookDialog } from '@/components/webhooks/delete-webhook-dialog';
import { EditWebhookDialog } from '@/components/webhooks/edit-webhook-dialog';
import { TestWebhookDialog } from '@/components/webhooks/test-webhook-dialog';
import { AppLayout } from '@/layouts/app';
import { type Webhook, WebhooksApi } from '@/lib/api/webhooks';
import { createServerApiClient } from '@/lib/auth/client-factory';
import { requireAuth } from '@/lib/auth/redirects';

export default function WebhooksPage({
  user,
  initialWebhooks,
  total,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);

  const handleEdit = (webhook: Webhook) => {
    setSelectedWebhook(webhook);
    setEditDialogOpen(true);
  };

  const handleTest = (webhook: Webhook) => {
    setSelectedWebhook(webhook);
    setTestDialogOpen(true);
  };

  const handleDelete = (webhook: Webhook) => {
    setSelectedWebhook(webhook);
    setDeleteDialogOpen(true);
  };

  const columns = useMemo(
    () => createColumns(handleEdit, handleTest, handleDelete),
    []
  );

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Webhooks' },
  ];

  return (
    <AppLayout
      user={user}
      organisation={user.organisation}
      breadcrumbs={breadcrumbs}
      title="Webhooks"
      docsUrl="https://docs.cerberus-iam.com/admin/webhooks"
    >
      <PageHeader
        title="Webhooks"
        description={`Configure webhook endpoints to receive real-time event notifications.${total > 0 ? ` ${total} webhook${total === 1 ? '' : 's'} total.` : ''}`}
        actions={
          <Button onClick={() => setCreateDialogOpen(true)}>
            <IconPlus className="mr-2 size-4" />
            Create Webhook
          </Button>
        }
      />
      <div className="space-y-4 px-4 py-4 lg:px-6">
        <DataTable
          columns={columns}
          data={initialWebhooks}
          searchKey="url"
          searchPlaceholder="Search webhooks..."
        />
      </div>

      <CreateWebhookDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      <EditWebhookDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        webhook={selectedWebhook}
      />

      <TestWebhookDialog
        open={testDialogOpen}
        onOpenChange={setTestDialogOpen}
        webhook={selectedWebhook}
      />

      <DeleteWebhookDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        webhook={selectedWebhook}
      />
    </AppLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) =>
  requireAuth(context, async ({ context }) => {
    const client = createServerApiClient(context);
    const webhooksApi = new WebhooksApi(client);

    const result = await webhooksApi.list({
      limit: 100,
      sort: 'createdAt',
      order: 'desc',
    });

    if (!result.ok) {
      console.error('Failed to fetch webhooks:', result.error);
      return { initialWebhooks: [], total: 0 };
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
      initialWebhooks: result.value.data,
      total,
    };
  });
