import Link from 'next/link';

import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight, TrendingUp } from 'lucide-react';

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
  const content = (
    <>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="text-muted-foreground h-4 w-4" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-20" />
            {trend && <Skeleton className="h-4 w-32" />}
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold">{value.toLocaleString()}</div>
            {trend && (
              <p className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                <TrendingUp className="h-3 w-3" />
                <span className="text-foreground font-medium">
                  +{trend.value}%
                </span>{' '}
                {trend.label}
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
        <Card className="hover:bg-accent/50 group relative cursor-pointer transition-colors">
          {content}
          <ArrowUpRight className="absolute top-3 right-3 h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
        </Card>
      </Link>
    );
  }

  return <Card>{content}</Card>;
}
