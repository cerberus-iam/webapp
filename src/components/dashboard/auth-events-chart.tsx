import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AuthEventsDataPoint } from '@/lib/api/stats';

interface AuthEventsChartProps {
  data: AuthEventsDataPoint[];
}

export function AuthEventsChart({ data }: AuthEventsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Authentication Events</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="successful"
              stackId="1"
              stroke="hsl(var(--chart-2))"
              fill="hsl(var(--chart-2))"
              name="Successful"
            />
            <Area
              type="monotone"
              dataKey="failed"
              stackId="1"
              stroke="hsl(var(--chart-3))"
              fill="hsl(var(--chart-3))"
              name="Failed"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
