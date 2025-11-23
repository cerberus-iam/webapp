import { useState } from 'react';

import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Head from 'next/head';

import {
  Key,
  Laptop,
  Mail,
  Send,
  ShieldCheck,
  UserPlus,
  Users,
  Webhook,
} from 'lucide-react';

import { ActivityChart } from '@/components/dashboard/activity-chart';
import { AuthEventsChart } from '@/components/dashboard/auth-events-chart';
import { QuickActionCard } from '@/components/dashboard/quick-action-card';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { SecurityInsights } from '@/components/dashboard/security-insights';
import { StatCard } from '@/components/dashboard/stat-card';
import { StatusPieChart } from '@/components/dashboard/status-pie-chart';
import { TopActivity } from '@/components/dashboard/top-activity';
import { CreateInvitationDialog } from '@/components/invitations/create-invitation-dialog';
import { PageHeader } from '@/components/page-header';
import { CreateUserDialog } from '@/components/users/create-user-dialog';
import { AppLayout } from '@/layouts/app';
import { ApiKeysApi } from '@/lib/api/api-keys';
import { AuditLogsApi } from '@/lib/api/audit-logs';
import { ClientsApi } from '@/lib/api/clients';
import { InvitationsApi } from '@/lib/api/invitations';
import { RolesApi } from '@/lib/api/roles';
import { StatsApi } from '@/lib/api/stats';
import { TeamsApi } from '@/lib/api/teams';
import { UsersApi } from '@/lib/api/users';
import { WebhooksApi } from '@/lib/api/webhooks';
import { requireAuth } from '@/lib/auth/redirects';

export default function DashboardPage({
  user,
  usersCount,
  // rolesCount,
  // teamsCount,
  clientsCount,
  apiKeysCount,
  pendingInvitationsCount,
  activeWebhooksCount,
  recentLogs,
  overviewStats,
  activityStats,
  securityStats,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showCreateInvitation, setShowCreateInvitation] = useState(false);

  return (
    <>
      <Head>
        <title>Dashboard | Cerberus IAM</title>
      </Head>
      <AppLayout
        user={user}
        organisation={user.organisation}
        breadcrumbs={[{ label: 'Dashboard' }]}
      >
        <div className="flex flex-col gap-6 pb-6">
          {/* Page Header */}
          <PageHeader
            title="Dashboard"
            description={`Overview of your organization&apos;s identity and access
              management.`}
          />

          {/* Stats Grid */}
          <div className="grid gap-4 px-4 md:grid-cols-2 lg:grid-cols-4 lg:px-6">
            <StatCard
              title="Total Users"
              value={overviewStats?.totalUsers ?? usersCount}
              icon={Users}
              href="/directory/users"
              trend={
                overviewStats?.trends.users30d
                  ? {
                      value: overviewStats.trends.users30d,
                      label: 'from last month',
                    }
                  : undefined
              }
            />
            <StatCard
              title="Active Users (30d)"
              value={overviewStats?.activeUsers30d ?? 0}
              icon={Users}
              href="/directory/users"
            />
            <StatCard
              title="MFA Adoption"
              value={
                overviewStats?.mfaAdoptionRate
                  ? `${overviewStats.mfaAdoptionRate}%`
                  : '0%'
              }
              icon={ShieldCheck}
              href="/directory/users"
            />
            <StatCard
              title="Active Sessions"
              value={overviewStats?.totalSessions ?? 0}
              icon={Laptop}
              href="/audit/logs"
            />
            <StatCard
              title="OAuth Clients"
              value={overviewStats?.totalClients ?? clientsCount}
              icon={Laptop}
              href="/applications/clients"
              trend={
                overviewStats?.trends.clients30d
                  ? {
                      value: overviewStats.trends.clients30d,
                      label: 'from last month',
                    }
                  : undefined
              }
            />
            <StatCard
              title="API Keys"
              value={overviewStats?.totalApiKeys ?? apiKeysCount}
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
          </div>

          {/* Quick Actions */}
          <div className="space-y-4 px-4 lg:px-6">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Quick Actions</h2>
              <p className="text-muted-foreground text-sm">
                Common tasks and shortcuts for your organization
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
          </div>

          {/* Analytics Charts */}
          {activityStats && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">Activity Analytics</h2>
                <p className="text-muted-foreground text-sm">
                  User activity and authentication trends over the last 30 days
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <ActivityChart
                  data={activityStats.loginActivity}
                  title="Login Activity"
                  color="hsl(var(--chart-1))"
                />
                <ActivityChart
                  data={activityStats.newUsers}
                  title="New User Signups"
                  color="hsl(var(--chart-2))"
                />
              </div>
              <AuthEventsChart data={activityStats.authEvents} />
            </div>
          )}

          {/* Security Insights */}
          {securityStats && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">Security Overview</h2>
                <p className="text-muted-foreground text-sm">
                  Security metrics and user status breakdown
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <SecurityInsights mfaBreakdown={securityStats.mfaBreakdown} />
                <StatusPieChart data={securityStats.usersByStatus} />
              </div>
              <TopActivity
                topActiveUsers={securityStats.topActiveUsers}
                recentSignups={securityStats.recentSignups}
              />
            </div>
          )}

          {/* Recent Activity */}
          <div className="space-y-4 px-4 lg:px-6">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Recent Activity</h2>
              <p className="text-muted-foreground text-sm">
                Latest security and audit events
              </p>
            </div>
            <RecentActivity logs={recentLogs} />
          </div>
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
    </>
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
    const apiKeysApi = new ApiKeysApi(apiClient);
    const invitationsApi = new InvitationsApi(apiClient);
    const webhooksApi = new WebhooksApi(apiClient);
    const statsApi = new StatsApi(apiClient);
    const auditLogsApi = new AuditLogsApi(apiClient);

    try {
      // Fetch all stats in parallel
      const [
        usersResult,
        rolesResult,
        teamsResult,
        clientsResult,
        apiKeysResult,
        invitationsResult,
        webhooksResult,
        overviewStatsResult,
        activityStatsResult,
        securityStatsResult,
        logsResult,
      ] = await Promise.all([
        usersApi.list({ limit: 1 }),
        rolesApi.list({ limit: 1 }),
        teamsApi.list({ limit: 1 }),
        clientsApi.list({ limit: 1 }),
        apiKeysApi.list({ limit: 1, status: 'active' }),
        invitationsApi.list({ status: 'pending', limit: 1 }),
        webhooksApi.list({ limit: 1 }),
        statsApi.getOverview(),
        statsApi.getActivity(30),
        statsApi.getSecurity(),
        auditLogsApi.list({ limit: 10, sort: 'timestamp', order: 'desc' }),
      ]);

      console.log('[dashboard] API calls completed:', {
        users: usersResult.ok ? 'success' : 'failed',
        roles: rolesResult.ok ? 'success' : 'failed',
        teams: teamsResult.ok ? 'success' : 'failed',
        clients: clientsResult.ok ? 'success' : 'failed',
        apiKeys: apiKeysResult.ok ? 'success' : 'failed',
        invitations: invitationsResult.ok ? 'success' : 'failed',
        webhooks: webhooksResult.ok ? 'success' : 'failed',
        overviewStats: overviewStatsResult.ok ? 'success' : 'failed',
        activityStats: activityStatsResult.ok ? 'success' : 'failed',
        securityStats: securityStatsResult.ok ? 'success' : 'failed',
        logs: logsResult.ok ? 'success' : 'failed',
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
        apiKeysCount: apiKeysResult.ok ? getTotal(apiKeysResult.value) : 0,
        pendingInvitationsCount: invitationsResult.ok
          ? getTotal(invitationsResult.value)
          : 0,
        activeWebhooksCount: webhooksResult.ok
          ? getTotal(webhooksResult.value)
          : 0,
        recentLogs: logsResult.ok ? logsResult.value.data : [],
        overviewStats: overviewStatsResult.ok
          ? overviewStatsResult.value
          : null,
        activityStats: activityStatsResult.ok
          ? activityStatsResult.value
          : null,
        securityStats: securityStatsResult.ok
          ? securityStatsResult.value
          : null,
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
        overviewStats: null,
        activityStats: null,
        securityStats: null,
      };
    }
  });
