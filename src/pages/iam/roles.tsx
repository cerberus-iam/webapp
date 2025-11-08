import { type ReactElement } from "react";
import { ShieldPlus } from "lucide-react";

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
import { useIamRoles } from "@/hooks/use-iam-data";
import { formatRelativeTime } from "@/lib/iam";

const RolesPage: NextPageWithLayout = () => {
  const { data: roles, isLoading, error, refresh } = useIamRoles();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle>Role catalogue</CardTitle>
            <CardDescription>
              Live role definitions pulled from your Cerberus IAM tenant.
            </CardDescription>
          </div>
          <Button variant="outline" onClick={() => refresh()} disabled={isLoading}>
            Sync roles
          </Button>
        </CardHeader>
        <CardContent>
          {error && (
            <p className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </p>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Members</TableHead>
                <TableHead className="text-right">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Loading roles…
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && roles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No roles created yet.
                  </TableCell>
                </TableRow>
              )}
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {role.name}
                      {role.isDefault && <Badge variant="outline">Default</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">{role.slug}</p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {role.description ?? "—"}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {role.permissions?.slice(0, 4).map((permission) => (
                        <Badge key={permission.id} variant="secondary" className="text-xs">
                          {permission.slug}
                        </Badge>
                      ))}
                      {(role.permissions?.length ?? 0) > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{(role.permissions?.length ?? 0) - 4} more
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{role._count?.users ?? 0}</Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {role.updatedAt ? formatRelativeTime(role.updatedAt) : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

RolesPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <AppLayout
      title="Role & Policy Management"
      description="Define and govern reusable role definitions that power least privilege access."
      breadcrumbs={[{ label: "Identity & Access", href: "/iam/users" }, { label: "Roles" }]}
      actions={
        <Button className="gap-2">
          <ShieldPlus className="size-4" />
          Create role
        </Button>
      }
    >
      {page}
    </AppLayout>
  );
};

export default RolesPage;
