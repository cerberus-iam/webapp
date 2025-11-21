import { useState } from 'react';

import type { GetServerSideProps } from 'next';

import { IconPlus } from '@tabler/icons-react';

import { CreateInvitationDialog } from '@/components/invitations/create-invitation-dialog';
import { ResendInvitationDialog } from '@/components/invitations/resend-invitation-dialog';
import { RevokeInvitationDialog } from '@/components/invitations/revoke-invitation-dialog';
import { createColumns } from '@/components/tables/settings/invitations/columns';
import { DataTable } from '@/components/tables/settings/invitations/data-table';
import { Button } from '@/components/ui/button';
import { type Invitation, InvitationsApi } from '@/lib/api/invitations';
import { createServerApiClient } from '@/lib/auth/client-factory';
import { requireAuth } from '@/lib/auth/redirects';

interface InvitationsPageProps {
  initialInvitations: Invitation[];
}

export default function InvitationsPage({
  initialInvitations,
}: InvitationsPageProps) {
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

  const columns = createColumns(handleResend, handleRevoke);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Invitations</h1>
          <p className="text-muted-foreground">
            Manage pending and accepted invitations
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <IconPlus className="mr-2 h-4 w-4" />
          Send Invitation
        </Button>
      </div>

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
    </div>
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
      return { initialInvitations: [] };
    }

    return {
      initialInvitations: result.value.data,
    };
  });
