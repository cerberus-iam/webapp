import Link from 'next/link';

import { format } from 'date-fns';
import { ArrowRight } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { AuditLog } from '@/lib/api/audit-logs';

interface RecentActivityProps {
  logs: AuditLog[];
  isLoading?: boolean;
}

function getActionColor(action: string): 'default' | 'destructive' | 'outline' {
  if (action === 'delete') return 'destructive';
  if (action === 'create') return 'default';
  return 'outline';
}

export function RecentActivity({ logs, isLoading }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest audit log entries</CardDescription>
        </div>
        <Link href="/audit/logs">
          <Button variant="ghost" size="sm">
            View All
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-4 w-20" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">
            No recent activity
          </p>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 text-sm">
                <div className="text-muted-foreground min-w-[60px] pt-0.5 text-xs">
                  {format(new Date(log.timestamp), 'HH:mm:ss')}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={getActionColor(log.action)} className="h-5">
                      {log.action}
                    </Badge>
                    <span className="text-muted-foreground capitalize">
                      {log.eventCategory}
                    </span>
                    <span className="text-foreground">
                      {log.resource.type && (
                        <span className="capitalize">{log.resource.type}</span>
                      )}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {log.actor.name || 'Unknown'} •{' '}
                    {log.metadata.ipAddress || 'N/A'}
                  </p>
                </div>
                <Badge
                  variant={log.success ? 'default' : 'destructive'}
                  className="h-5"
                >
                  {log.success ? 'Success' : 'Failed'}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
