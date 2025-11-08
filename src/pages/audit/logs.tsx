import { type ReactElement } from "react";
import { Funnel, RefreshCw } from "lucide-react";

import type { NextPageWithLayout } from "@/types/page";
import { AppLayout } from "@/components/layout/app-layout";
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
import { Badge } from "@/components/ui/badge";
import { useAuditLogs } from "@/hooks/use-iam-data";
import { formatRelativeTime } from "@/lib/iam";

const AuditLogsPage: NextPageWithLayout = () => {
  const { data: events, isLoading, refresh } = useAuditLogs(50);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle>Streaming audit log</CardTitle>
            <CardDescription>Live view of the most recent security events.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => refresh()}>
              <RefreshCw className="size-4" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" className="gap-2" disabled>
              <Funnel className="size-4" />
              Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Target</TableHead>
                <TableHead className="text-right">Result</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Loading audit events…
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && events.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No audit events recorded for this tenant.
                  </TableCell>
                </TableRow>
              )}
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatRelativeTime(event.createdAt)}
                  </TableCell>
                  <TableCell>
                    {event.user?.name || event.user?.email || event.client?.name || "System"}
                    <p className="text-xs text-muted-foreground capitalize">
                      {event.eventCategory}
                    </p>
                  </TableCell>
                  <TableCell className="text-sm">
                    <span className="font-medium">{event.eventType}</span>
                    <p className="text-xs text-muted-foreground capitalize">{event.action}</p>
                  </TableCell>
                  <TableCell className="text-sm">
                    {event.resourceType}
                    {event.resourceId && (
                      <p className="text-xs text-muted-foreground">{event.resourceId}</p>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={event.success ? "outline" : "destructive"}>
                      {event.success ? "Success" : "Failed"}
                    </Badge>
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

AuditLogsPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <AppLayout
      title="Audit Activity"
      description="Investigate critical security events across tenants and systems."
      breadcrumbs={[{ label: "Identity & Access", href: "/iam/users" }, { label: "Audit Logs" }]}
    >
      {page}
    </AppLayout>
  );
};

export default AuditLogsPage;
