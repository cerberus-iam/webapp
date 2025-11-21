import { useState } from 'react';

import type { GetServerSideProps } from 'next';

import { IconPlus } from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import { CreateWebhookDialog } from '@/components/webhooks/create-webhook-dialog';
import { DeleteWebhookDialog } from '@/components/webhooks/delete-webhook-dialog';
import { EditWebhookDialog } from '@/components/webhooks/edit-webhook-dialog';
import { TestWebhookDialog } from '@/components/webhooks/test-webhook-dialog';
import { type Webhook, WebhooksApi } from '@/lib/api/webhooks';
import { createServerApiClient } from '@/lib/auth/client-factory';
import { requireAuth } from '@/lib/auth/redirects';

import { createColumns } from './_columns';
import { DataTable } from './_data-table';

interface WebhooksPageProps {
  initialWebhooks: Webhook[];
}

export default function WebhooksPage({ initialWebhooks }: WebhooksPageProps) {
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

  const columns = createColumns(handleEdit, handleTest, handleDelete);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Webhooks</h1>
          <p className="text-muted-foreground">
            Configure webhook endpoints to receive real-time event notifications
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <IconPlus className="mr-2 h-4 w-4" />
          Create Webhook
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={initialWebhooks}
        searchKey="url"
        searchPlaceholder="Search webhooks..."
      />

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
    </div>
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
      return { initialWebhooks: [] };
    }

    return {
      initialWebhooks: result.value.data,
    };
  });
