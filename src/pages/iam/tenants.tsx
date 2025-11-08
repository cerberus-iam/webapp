import { type ReactElement } from "react";
import { Building2 } from "lucide-react";

import type { NextPageWithLayout } from "@/types/page";
import { AppLayout } from "@/components/layout/app-layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useOrganisation } from "@/hooks/use-organisation";
import { Button } from "@/components/ui/button";

const TenantsPage: NextPageWithLayout = () => {
  const { organisation, isLoading, error, refresh } = useOrganisation();

  const sessionLifetimeDays =
    organisation?.sessionLifetime !== undefined
      ? Math.round(organisation.sessionLifetime / 86400)
      : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="size-4" />
              Organisation overview
            </CardTitle>
            <CardDescription>
              Current tenant metadata pulled directly from the IAM API.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refresh()} disabled={isLoading}>
              Refresh
            </Button>
            <Badge variant={organisation?.requireMfa ? "secondary" : "outline"}>
              {organisation?.requireMfa ? "MFA required" : "MFA optional"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </p>
          )}
          {isLoading && <p className="text-sm text-muted-foreground">Loading tenant metadata…</p>}
          {!isLoading && organisation && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border p-4">
                <p className="text-xs uppercase text-muted-foreground">Tenant slug</p>
                <p className="font-medium">{organisation.slug}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs uppercase text-muted-foreground">Contact email</p>
                <p className="font-medium">{organisation.email ?? "—"}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs uppercase text-muted-foreground">Allowed origins</p>
                <p className="font-medium">
                  {(organisation.allowedOrigins?.length ?? 0) > 0
                    ? organisation.allowedOrigins?.join(", ")
                    : "None configured"}
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs uppercase text-muted-foreground">Session lifetime</p>
                <p className="font-medium">
                  {sessionLifetimeDays ? `${sessionLifetimeDays} days` : "Default"}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

TenantsPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <AppLayout
      title="Tenant Management"
      description="Monitor tenant health, compliance posture, and lifecycle events."
      breadcrumbs={[{ label: "Organization", href: "/iam/tenants" }, { label: "Tenants" }]}
      actions={<Badge variant="secondary">API integration pending</Badge>}
    >
      {page}
    </AppLayout>
  );
};

export default TenantsPage;
