import { ShieldCheck, ShieldX } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { MfaBreakdown } from '@/lib/api/stats';

interface SecurityInsightsProps {
  mfaBreakdown: MfaBreakdown;
}

export function SecurityInsights({ mfaBreakdown }: SecurityInsightsProps) {
  const total = mfaBreakdown.enabled + mfaBreakdown.disabled;
  const mfaPercentage = total > 0 ? (mfaBreakdown.enabled / total) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">MFA Adoption</span>
            <span className="text-muted-foreground">
              {mfaPercentage.toFixed(0)}%
            </span>
          </div>
          <Progress value={mfaPercentage} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 rounded-lg border p-3">
            <div className="rounded-full bg-green-100 p-2 dark:bg-green-900">
              <ShieldCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{mfaBreakdown.enabled}</p>
              <p className="text-muted-foreground text-xs">MFA Enabled</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border p-3">
            <div className="rounded-full bg-yellow-100 p-2 dark:bg-yellow-900">
              <ShieldX className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{mfaBreakdown.disabled}</p>
              <p className="text-muted-foreground text-xs">MFA Disabled</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
