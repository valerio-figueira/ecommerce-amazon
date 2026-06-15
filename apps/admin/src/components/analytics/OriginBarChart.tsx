'use client';

import { BarChart3 } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { AdminPageCard } from '@/components/admin/AdminPageCard';
import { AnalyticsChartFrame } from '@/components/analytics/AnalyticsChartFrame';
import { clickOriginLabel } from '@/lib/analytics/labels';
import { formatCountWithShare } from '@/lib/analytics/tooltip';

type OriginBarChartProps = {
  data: { origin: string; count: number; sharePercent: number }[];
};

export function OriginBarChart({ data }: OriginBarChartProps): React.JSX.Element {
  const chartData = data.map((item) => ({
    origin: clickOriginLabel(item.origin),
    count: item.count,
    sharePercent: item.sharePercent,
  }));

  return (
    <AdminPageCard className="p-5">
      <h3 className="text-sm font-semibold text-[color:var(--admin-navy)]">
        Cliques por ponto de inserção
      </h3>
      {chartData.length === 0 ? (
        <AdminEmptyState
          icon={BarChart3}
          title="Sem origens registradas"
          hint="A distribuição por contexto aparecerá após os primeiros cliques."
        />
      ) : (
        <AnalyticsChartFrame height={288}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" />
              <XAxis type="number" allowDecimals={false} fontSize={12} />
              <YAxis type="category" dataKey="origin" width={130} fontSize={11} />
              <Tooltip formatter={(value, _name, item) => formatCountWithShare(value, item)} />
              <Bar dataKey="count" fill="var(--admin-primary)" radius={[0, 4, 4, 0]} />
            </BarChart>
        </AnalyticsChartFrame>
      )}
    </AdminPageCard>
  );
}
