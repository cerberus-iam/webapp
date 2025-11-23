import { formatDistanceToNow } from 'date-fns';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { RecentSignup, TopActiveUser } from '@/lib/api/stats';

interface TopActivityProps {
  topActiveUsers: TopActiveUser[];
  recentSignups: RecentSignup[];
}

function getInitials(name: string | null): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function TopActivity({
  topActiveUsers,
  recentSignups,
}: TopActivityProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Most Active Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topActiveUsers.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No active users yet
              </p>
            ) : (
              topActiveUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm leading-none font-medium">
                      {user.name || 'Unknown User'}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {user.loginCount} login{user.loginCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {user.lastLoginAt
                      ? formatDistanceToNow(new Date(user.lastLoginAt), {
                          addSuffix: true,
                        })
                      : 'Never'}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Signups</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentSignups.length === 0 ? (
              <p className="text-muted-foreground text-sm">No recent signups</p>
            ) : (
              recentSignups.map((user) => (
                <div key={user.id} className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm leading-none font-medium">
                      {user.name || 'Unknown User'}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {user.email}
                    </p>
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {formatDistanceToNow(new Date(user.createdAt), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
