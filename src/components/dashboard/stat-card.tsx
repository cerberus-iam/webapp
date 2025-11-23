import Link from 'next/link';

import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight, TrendingDown, TrendingUp } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  href?: string;
  trend?: {
    value: number;
    label: string;
    direction?: 'up' | 'down';
  };
  isLoading?: boolean;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  href,
  trend,
  isLoading,
}: StatCardProps) {
  const trendDirection = trend?.direction || 'up';
  const TrendIcon = trendDirection === 'up' ? TrendingUp : TrendingDown;
  const trendColorClass =
    trendDirection === 'up' ? 'text-green-600' : 'text-red-600';

  const content = (
    <>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="bg-muted/50 rounded-lg p-2">
          <Icon className="text-muted-foreground h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-20" />
            {trend && <Skeleton className="h-4 w-32" />}
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold lg:text-3xl">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </div>
            {trend && (
              <p className="text-muted-foreground mt-2 flex items-center gap-1 text-xs">
                <TrendIcon className={`h-3 w-3 ${trendColorClass}`} />
                <span className={`font-medium ${trendColorClass}`}>
                  {trendDirection === 'up' ? '+' : ''}
                  {trend.value}%
                </span>{' '}
                <span>{trend.label}</span>
              </p>
            )}
          </>
        )}
      </CardContent>
    </>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        <Card className="hover:bg-accent/50 group relative cursor-pointer shadow-none transition-colors">
          {content}
          <ArrowUpRight className="absolute top-3 right-3 h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
        </Card>
      </Link>
    );
  }

  return <Card>{content}</Card>;
}
