import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { UsersByStatus } from '@/lib/api/stats';

interface StatusPieChartProps {
  data: UsersByStatus;
}

const COLORS = {
  active: 'hsl(var(--chart-2))',
  inactive: 'hsl(var(--chart-4))',
  blocked: 'hsl(var(--chart-3))',
};

export function StatusPieChart({ data }: StatusPieChartProps) {
  const chartData = [
    { name: 'Active', value: data.active, fill: COLORS.active },
    { name: 'Inactive', value: data.inactive, fill: COLORS.inactive },
    { name: 'Blocked', value: data.blocked, fill: COLORS.blocked },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users by Status</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
