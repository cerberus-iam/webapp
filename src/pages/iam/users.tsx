import { type ReactElement } from "react";
import { Plus } from "lucide-react";

import type { NextPageWithLayout } from "@/types/page";
import { AppLayout } from "@/components/layout/app-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useIamUsers } from "@/hooks/use-iam-data";
import { formatRelativeTime } from "@/lib/iam";

const UsersPage: NextPageWithLayout = () => {
  const { data: users, isLoading, refresh } = useIamUsers();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle>User directory</CardTitle>
            <CardDescription>
              Manage invitations, lifecycle states, and MFA enrollment for every member.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => refresh()} disabled={isLoading}>
              Refresh
            </Button>
            <Badge variant="outline">{users.length} users</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Primary role</TableHead>
                <TableHead>MFA</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                    Loading users…
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                    No users found for this organisation.
                  </TableCell>
                </TableRow>
              )}
              {users.map((user) => {
                const status = getUserStatus(user);
                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      {user.roles[0]?.name ? (
                        <Badge variant="outline">{user.roles[0].name}</Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.mfaEnabled ? "secondary" : "outline"}>
                        {user.mfaEnabled ? "Enabled" : "Disabled"}
                      </Badge>
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
    </div>
  );
};

UsersPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <AppLayout
      title="User Directory"
      description="Manage identities, invitations, lifecycle states, and MFA enrollment."
      breadcrumbs={[{ label: "Identity & Access", href: "/iam/users" }, { label: "Users" }]}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline">Bulk import</Button>
          <Button className="gap-2">
            <Plus className="size-4" />
            Invite user
          </Button>
        </div>
      }
    >
      {page}
    </AppLayout>
  );
};

export default UsersPage;

function getUserStatus(user: { blockedAt: string | null; emailVerifiedAt: string | null }) {
  if (user.blockedAt) {
    return { label: "Blocked", variant: "destructive" as const };
  }

  if (!user.emailVerifiedAt) {
    return { label: "Pending", variant: "outline" as const };
  }

  return { label: "Active", variant: "secondary" as const };
}
