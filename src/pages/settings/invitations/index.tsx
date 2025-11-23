import { useMemo, useState } from 'react';

import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';

import { IconPlus } from '@tabler/icons-react';

import { CreateInvitationDialog } from '@/components/invitations/create-invitation-dialog';
import { ResendInvitationDialog } from '@/components/invitations/resend-invitation-dialog';
import { RevokeInvitationDialog } from '@/components/invitations/revoke-invitation-dialog';
import { PageHeader } from '@/components/page-header';
import { createColumns } from '@/components/tables/settings/invitations/columns';
import { DataTable } from '@/components/tables/settings/invitations/data-table';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/layouts/app';
import { type Invitation, InvitationsApi } from '@/lib/api/invitations';
import { createServerApiClient } from '@/lib/auth/client-factory';
import { requireAuth } from '@/lib/auth/redirects';

export default function InvitationsPage({
  user,
  initialInvitations,
  total,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [resendDialogOpen, setResendDialogOpen] = useState(false);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [selectedInvitation, setSelectedInvitation] =
    useState<Invitation | null>(null);

  const handleResend = (invitation: Invitation) => {
    setSelectedInvitation(invitation);
    setResendDialogOpen(true);
  };

  const handleRevoke = (invitation: Invitation) => {
    setSelectedInvitation(invitation);
    setRevokeDialogOpen(true);
  };

  const columns = useMemo(() => createColumns(handleResend, handleRevoke), []);

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Invitations' },
  ];

  return (
    <AppLayout
      user={user}
      organisation={user.organisation}
      breadcrumbs={breadcrumbs}
      title="Invitations"
      docsUrl="https://docs.cerberus-iam.com/admin/invitations"
    >
      <PageHeader
        title="Invitations"
        description={`Manage pending and accepted invitations to your organization.${total > 0 ? ` ${total} invitation${total === 1 ? '' : 's'} total.` : ''}`}
        actions={
          <Button onClick={() => setCreateDialogOpen(true)}>
            <IconPlus className="mr-2 size-4" />
            Send Invitation
          </Button>
        }
      />
      <div className="space-y-4 px-4 py-4 lg:px-6">
        <DataTable
          columns={columns}
          data={initialInvitations}
          searchKey="email"
          searchPlaceholder="Search by email..."
          facetedFilters={[
            {
              columnId: 'status',
              title: 'Status',
              options: [
                { label: 'Pending', value: 'pending' },
                { label: 'Accepted', value: 'accepted' },
                { label: 'Expired', value: 'expired' },
                { label: 'Revoked', value: 'revoked' },
              ],
            },
          ]}
        />
      </div>

      <CreateInvitationDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      <ResendInvitationDialog
        open={resendDialogOpen}
        onOpenChange={setResendDialogOpen}
        invitation={selectedInvitation}
      />

      <RevokeInvitationDialog
        open={revokeDialogOpen}
        onOpenChange={setRevokeDialogOpen}
        invitation={selectedInvitation}
      />
    </AppLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) =>
  requireAuth(context, async ({ context }) => {
    const client = createServerApiClient(context);
    const invitationsApi = new InvitationsApi(client);

    const result = await invitationsApi.list({
      limit: 100,
      sort: 'createdAt',
      order: 'desc',
    });

    if (!result.ok) {
      console.error('Failed to fetch invitations:', result.error);
      return { initialInvitations: [], total: 0 };
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
      initialInvitations: result.value.data,
      total,
    };
  });
