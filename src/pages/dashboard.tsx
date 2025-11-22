import { useState } from 'react';

import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';

import {
  FileText,
  Key,
  Laptop,
  Mail,
  Send,
  ShieldCheck,
  UserPlus,
  Users,
  UsersRound,
  Webhook,
} from 'lucide-react';

import { QuickActionCard } from '@/components/dashboard/quick-action-card';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { StatCard } from '@/components/dashboard/stat-card';
import { CreateInvitationDialog } from '@/components/invitations/create-invitation-dialog';
import { CreateUserDialog } from '@/components/users/create-user-dialog';
import { AppLayout } from '@/layouts/app';
// import { ApiKeysApi } from '@/lib/api/api-keys';
// import { AuditLogsApi } from '@/lib/api/audit-logs';
import { ClientsApi } from '@/lib/api/clients';
import { InvitationsApi } from '@/lib/api/invitations';
import { RolesApi } from '@/lib/api/roles';
import { TeamsApi } from '@/lib/api/teams';
import { UsersApi } from '@/lib/api/users';
import { WebhooksApi } from '@/lib/api/webhooks';
import { requireAuth } from '@/lib/auth/redirects';

export default function DashboardPage({
  user,
  usersCount,
  rolesCount,
  teamsCount,
  clientsCount,
  apiKeysCount,
  pendingInvitationsCount,
  activeWebhooksCount,
  recentLogs,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showCreateInvitation, setShowCreateInvitation] = useState(false);

  return (
    <AppLayout user={user} breadcrumbs={[{ label: 'Dashboard' }]}>
      <div className="flex flex-col gap-6 px-4 py-4 md:py-6 lg:px-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Users"
            value={usersCount}
            icon={Users}
            href="/directory/users"
          />
          <StatCard
            title="Roles"
            value={rolesCount}
            icon={ShieldCheck}
            href="/access-control/roles"
          />
          <StatCard
            title="Teams"
            value={teamsCount}
            icon={UsersRound}
            href="/directory/teams"
          />
          <StatCard
            title="OAuth Clients"
            value={clientsCount}
            icon={Laptop}
            href="/applications/clients"
          />
          <StatCard
            title="API Keys"
            value={apiKeysCount}
            icon={Key}
            href="/settings/api-keys"
          />
          <StatCard
            title="Pending Invitations"
            value={pendingInvitationsCount}
            icon={Mail}
            href="/settings/invitations"
          />
          <StatCard
            title="Active Webhooks"
            value={activeWebhooksCount}
            icon={Webhook}
            href="/settings/webhooks"
          />
          <StatCard
            title="Audit Logs"
            value="View"
            icon={FileText}
            href="/audit/logs"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2">
          <QuickActionCard
            title="Create User"
            description="Add a new user to your organisation"
            icon={UserPlus}
            action="Create User"
            onAction={() => setShowCreateUser(true)}
          />
          <QuickActionCard
            title="Send Invitation"
            description="Invite someone to join your organisation"
            icon={Send}
            action="Send Invitation"
            onAction={() => setShowCreateInvitation(true)}
          />
        </div>

        {/* Recent Activity */}
        <RecentActivity logs={recentLogs} />
      </div>

      <CreateUserDialog
        open={showCreateUser}
        onOpenChange={setShowCreateUser}
      />
      <CreateInvitationDialog
        open={showCreateInvitation}
        onOpenChange={setShowCreateInvitation}
      />
    </AppLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) =>
  requireAuth(context, async ({ context: ctx }) => {
    const { createServerApiClient } = await import('@/lib/auth/client-factory');
    const apiClient = createServerApiClient(ctx);

    console.log('[dashboard] Starting to fetch dashboard data');

    const usersApi = new UsersApi(apiClient);
    const rolesApi = new RolesApi(apiClient);
    const teamsApi = new TeamsApi(apiClient);
    const clientsApi = new ClientsApi(apiClient);
    // const apiKeysApi = new ApiKeysApi(apiClient);
    const invitationsApi = new InvitationsApi(apiClient);
    const webhooksApi = new WebhooksApi(apiClient);
    // const auditLogsApi = new AuditLogsApi(apiClient);

    try {
      // Fetch all stats in parallel
      const [
        usersResult,
        rolesResult,
        teamsResult,
        clientsResult,
        // apiKeysResult,
        invitationsResult,
        webhooksResult,
        // logsResult,
      ] = await Promise.all([
        usersApi.list({ limit: 1 }),
        rolesApi.list({ limit: 1 }),
        teamsApi.list({ limit: 1 }),
        clientsApi.list({ limit: 1 }),
        // apiKeysApi.list({ limit: 1 }),
        invitationsApi.list({ status: 'pending', limit: 1 }),
        webhooksApi.list({ limit: 1 }),
        // auditLogsApi.list({ limit: 10, sort: 'timestamp', order: 'desc' }),
      ]);

      console.log('[dashboard] API calls completed:', {
        users: usersResult.ok ? 'success' : 'failed',
        roles: rolesResult.ok ? 'success' : 'failed',
        teams: teamsResult.ok ? 'success' : 'failed',
        clients: clientsResult.ok ? 'success' : 'failed',
        invitations: invitationsResult.ok ? 'success' : 'failed',
        webhooks: webhooksResult.ok ? 'success' : 'failed',
      });

      // Helper to extract total from either { pagination: { total } } or { total } format
      const getTotal = (result: unknown): number => {
        const res = result as Record<string, unknown>;
        return (
          ((res.pagination as Record<string, unknown> | undefined)?.total as
            | number
            | undefined) ||
          (res.total as number | undefined) ||
          (res.count as number | undefined) ||
          0
        );
      };

      return {
        usersCount: usersResult.ok ? getTotal(usersResult.value) : 0,
        rolesCount: rolesResult.ok ? getTotal(rolesResult.value) : 0,
        teamsCount: teamsResult.ok ? getTotal(teamsResult.value) : 0,
        clientsCount: clientsResult.ok ? getTotal(clientsResult.value) : 0,
        apiKeysCount: 0, // apiKeysResult.ok ? apiKeysResult.value.pagination.total : 0,
        pendingInvitationsCount: invitationsResult.ok
          ? getTotal(invitationsResult.value)
          : 0,
        activeWebhooksCount: webhooksResult.ok
          ? getTotal(webhooksResult.value)
          : 0,
        recentLogs: [], // logsResult.ok ? logsResult.value.data : [],
      };
    } catch (error) {
      console.error('[dashboard] Error fetching dashboard data:', error);
      // Return zeros if anything fails
      return {
        usersCount: 0,
        rolesCount: 0,
        teamsCount: 0,
        clientsCount: 0,
        apiKeysCount: 0,
        pendingInvitationsCount: 0,
        activeWebhooksCount: 0,
        recentLogs: [],
      };
    }
  });
