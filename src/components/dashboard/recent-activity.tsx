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
    <Card className="shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold">
            Activity Timeline
          </CardTitle>
          <CardDescription className="text-xs">
            Latest audit log entries from your organization
          </CardDescription>
        </div>
        <Link href="/audit/logs">
          <Button variant="ghost" size="sm" className="group">
            View All
            <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-4 w-16" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="bg-muted/50 flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
            <p className="text-muted-foreground text-sm font-medium">
              No recent activity
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              Activity will appear here when events occur
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log, index) => (
              <div
                key={log.id}
                className={`flex items-start gap-3 pb-4 text-sm ${
                  index !== logs.length - 1 ? 'border-b' : ''
                }`}
              >
                <div className="text-muted-foreground min-w-[65px] pt-0.5 text-xs font-medium tabular-nums">
                  {format(new Date(log.timestamp), 'HH:mm:ss')}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant={getActionColor(log.action)}
                      className="h-5 font-medium"
                    >
                      {log.action}
                    </Badge>
                    <span className="text-muted-foreground text-xs capitalize">
                      {log.eventCategory}
                    </span>
                    {log.resource.type && (
                      <span className="text-foreground text-xs font-medium capitalize">
                        {log.resource.type}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-foreground font-medium">
                      {log.actor.name || 'Unknown'}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">
                      {log.metadata.ipAddress || 'N/A'}
                    </span>
                  </div>
                </div>
                <Badge
                  variant={log.success ? 'default' : 'destructive'}
                  className="h-5 shrink-0"
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
