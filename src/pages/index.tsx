import { type ReactElement } from "react";
import { AlertTriangle, CheckCircle2, Shield, UserPlus, UsersRound } from "lucide-react";

import type { NextPageWithLayout } from "@/types/page";
import { AppLayout } from "@/components/layout/app-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuditLogs, useIamRoles, useIamUsers } from "@/hooks/use-iam-data";
import { formatRelativeTime } from "@/lib/iam";
import type { AuditLogEntry } from "@/types/api";

const DashboardPage: NextPageWithLayout = () => {
  const {
    data: users,
    total: totalUsers,
    isLoading: usersLoading,
    refresh: refreshUsers,
  } = useIamUsers();
  const {
    data: roles,
    total: totalRoles,
    isLoading: rolesLoading,
    refresh: refreshRoles,
  } = useIamRoles();
  const { data: auditLogs, isLoading: auditLoading, refresh: refreshAudit } = useAuditLogs(8);

  const blockedUsers = users.filter((user) => Boolean(user.blockedAt)).length;
  const unverifiedUsers = users.filter((user) => !user.emailVerifiedAt).length;
  const mfaEnabled = users.filter((user) => user.mfaEnabled).length;
  const mfaCoverage = totalUsers > 0 ? Math.round((mfaEnabled / totalUsers) * 100) : 0;

  const stats = [
    {
      label: "Total users",
      value: usersLoading ? "…" : totalUsers.toString(),
      helper:
        usersLoading || unverifiedUsers === 0
          ? "Directory synced"
          : `${unverifiedUsers} awaiting verification`,
      icon: UsersRound,
    },
    {
      label: "MFA coverage",
      value: usersLoading ? "…" : `${mfaCoverage}%`,
      helper:
        totalUsers > 0 ? `${mfaEnabled}/${totalUsers} identities protected` : "No active users",
      icon: CheckCircle2,
    },
    {
      label: "Blocked accounts",
      value: usersLoading ? "…" : blockedUsers.toString(),
      helper: blockedUsers > 0 ? "Review risk signals" : "All identities healthy",
      icon: AlertTriangle,
    },
    {
      label: "Active roles",
      value: rolesLoading ? "…" : totalRoles.toString(),
      helper: rolesLoading ? "Loading permissions…" : "Role-based access ready",
      icon: Shield,
    },
  ];

  const latestUsers = users.slice(0, 5);
  const featuredRoles = roles.slice(0, 3);
  const latestAuditLogs = auditLogs.slice(0, 6);
  const auditCategoryCounts = tallyCategories(auditLogs);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tracking-tight">{stat.value}</div>
              <p className="text-sm text-muted-foreground">{stat.helper}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle>Directory snapshot</CardTitle>
              <CardDescription>Latest lifecycle changes across your organisation.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => refreshUsers()} disabled={usersLoading}>
                Refresh
              </Button>
              <Button className="gap-2">
                <UserPlus className="size-4" />
                Invite user
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Primary role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersLoading && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                      Loading directory…
                    </TableCell>
                  </TableRow>
                )}
                {!usersLoading && latestUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                      No users found for this organisation.
                    </TableCell>
                  </TableRow>
                )}
                {latestUsers.map((user) => {
                  const status = getUserStatus(user);
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{user.name || user.email}</span>
                          <span className="text-sm text-muted-foreground">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.roles[0]?.name ? (
                          <Badge variant="outline">{user.roles[0].name}</Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {formatRelativeTime(user.updatedAt)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle>Audit pulse</CardTitle>
            <CardDescription>Latest security-significant events.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {auditLoading && (
              <p className="text-sm text-muted-foreground">Loading audit activity…</p>
            )}
            {!auditLoading && latestAuditLogs.length === 0 && (
              <p className="text-sm text-muted-foreground">No audit events recorded.</p>
            )}
            <div className="space-y-3">
              {latestAuditLogs.map((event) => (
                <div key={event.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{event.eventType}</span>
                    <Badge variant={event.success ? "outline" : "destructive"}>
                      {event.success ? "Success" : "Failure"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground capitalize">
                    {event.eventCategory} · {event.action} · {formatRelativeTime(event.createdAt)}
                  </p>
                  {getAuditReason(event.metadata) && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {getAuditReason(event.metadata)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex w-full items-center justify-between text-sm text-muted-foreground">
              <span>auth events: {auditCategoryCounts.auth ?? 0}</span>
              <span>user events: {auditCategoryCounts.user ?? 0}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refreshAudit()}
                disabled={auditLoading}
              >
                Refresh
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle>Roles & access</CardTitle>
              <CardDescription>Most recently updated roles with member counts.</CardDescription>
            </div>
            <Button variant="outline" onClick={() => refreshRoles()} disabled={rolesLoading}>
              Refresh
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {rolesLoading && <p className="text-sm text-muted-foreground">Loading roles…</p>}
            {!rolesLoading && featuredRoles.length === 0 && (
              <p className="text-sm text-muted-foreground">No roles found.</p>
            )}
            {featuredRoles.map((role) => (
              <div key={role.id} className="flex items-start justify-between rounded-lg border p-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{role.name}</span>
                    {role.isDefault && <Badge variant="outline">Default</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {role.description ?? "No description provided."}
                  </p>
                </div>
                <Badge variant="secondary">
                  {(role._count?.users ?? 0).toLocaleString()} members
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Event categories</CardTitle>
            <CardDescription>
              Distribution across the last {auditLogs.length} events.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.keys(auditCategoryCounts).length === 0 && (
              <p className="text-sm text-muted-foreground">
                Waiting for audit activity. Events will appear here automatically.
              </p>
            )}
            {Object.entries(auditCategoryCounts).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="capitalize text-sm font-medium">{category}</span>
                <span className="text-sm text-muted-foreground">{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

DashboardPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <AppLayout
      title="Identity Overview"
      description="Monitor user lifecycle, role assignments, and recent audit activity."
      breadcrumbs={[{ label: "Overview", href: "/" }]}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline">Export audit log</Button>
          <Button className="gap-2">
            <Shield className="size-4" />
            Add role
          </Button>
        </div>
      }
    >
      {page}
    </AppLayout>
  );
};

export default DashboardPage;

function getUserStatus(user: { blockedAt: string | null; emailVerifiedAt: string | null }) {
  if (user.blockedAt) {
    return { label: "Blocked", variant: "destructive" as const };
  }

  if (!user.emailVerifiedAt) {
    return { label: "Pending", variant: "outline" as const };
  }

  return { label: "Active", variant: "secondary" as const };
}

function tallyCategories(events: AuditLogEntry[]) {
  return events.reduce<Record<string, number>>((acc, event) => {
    const key = event.eventCategory;
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}

function getAuditReason(metadata: AuditLogEntry["metadata"]) {
  if (!metadata || typeof metadata !== "object") {
    return null;
  }

  const reason = (metadata as Record<string, unknown>).reason;
  return typeof reason === "string" ? reason : null;
}
