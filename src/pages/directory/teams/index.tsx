import { useMemo, useState } from 'react';

import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';

import { IconPlus } from '@tabler/icons-react';

import { createColumns } from '@/components/tables/directory/teams/columns';
import { DataTable } from '@/components/tables/directory/teams/data-table';
import { CreateTeamDialog } from '@/components/teams/create-team-dialog';
import { DeleteTeamDialog } from '@/components/teams/delete-team-dialog';
import { EditTeamDialog } from '@/components/teams/edit-team-dialog';
import { ManageMembersDialog } from '@/components/teams/manage-members-dialog';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/layouts/app';
import type { Team } from '@/lib/api/teams';
import { TeamsApi } from '@/lib/api/teams';
import { createServerApiClient } from '@/lib/auth/client-factory';
import { requireAuth } from '@/lib/auth/redirects';

export default function TeamsPage({
  user,
  teams,
  total,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [manageMembersDialogOpen, setManageMembersDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const handleEdit = (team: Team) => {
    setSelectedTeam(team);
    setEditDialogOpen(true);
  };

  const handleDelete = (team: Team) => {
    setSelectedTeam(team);
    setDeleteDialogOpen(true);
  };

  const handleManageMembers = (team: Team) => {
    setSelectedTeam(team);
    setManageMembersDialogOpen(true);
  };

  const columns = useMemo(
    () =>
      createColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
        onManageMembers: handleManageMembers,
      }),
    []
  );

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Teams' },
  ];

  return (
    <AppLayout
      user={user}
      breadcrumbs={breadcrumbs}
      title="Teams"
      docsUrl="https://docs.cerberus-iam.com/admin/teams"
    >
      <div className="space-y-4 px-4 py-5 lg:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Team Management</h3>
            <p className="text-muted-foreground text-sm">
              Manage teams and their members in your organization.
              {total > 0 && ` Total: ${total} teams`}
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <IconPlus className="mr-2 h-4 w-4" />
            Add Team
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={teams}
          searchKey="name"
          searchPlaceholder="Search teams..."
        />

        <CreateTeamDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
        />

        {selectedTeam && (
          <>
            <EditTeamDialog
              open={editDialogOpen}
              onOpenChange={setEditDialogOpen}
              team={selectedTeam}
            />

            <DeleteTeamDialog
              open={deleteDialogOpen}
              onOpenChange={setDeleteDialogOpen}
              team={selectedTeam}
            />

            <ManageMembersDialog
              open={manageMembersDialogOpen}
              onOpenChange={setManageMembersDialogOpen}
              team={selectedTeam}
            />
          </>
        )}
      </div>
    </AppLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) =>
  requireAuth(context, async ({ context }) => {
    try {
      const client = createServerApiClient(context);
      const teamsApi = new TeamsApi(client);

      const result = await teamsApi.list({ limit: 100 });

      if (!result.ok) {
        console.error('Failed to fetch teams:', result.error);
        return { teams: [], total: 0 };
      }

      // Handle both response formats: { teams: [], pagination: {} } and { data: [], total: 0 }
      const apiResponse = result.value as unknown as Record<string, unknown>;
      const teams = (apiResponse.teams || apiResponse.data || []) as Team[];
      const total =
        ((apiResponse.pagination as Record<string, unknown> | undefined)
          ?.total as number | undefined) ||
        (apiResponse.total as number | undefined) ||
        (apiResponse.count as number | undefined) ||
        0;

      return {
        teams,
        total,
      };
    } catch (error) {
      console.error('Error fetching teams:', error);
      return { teams: [], total: 0 };
    }
  });
