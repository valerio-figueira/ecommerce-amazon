'use client';

import { Layers } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';

import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { AdminPageCard } from '@/components/admin/AdminPageCard';
import { AnalyticsChartFrame } from '@/components/analytics/AnalyticsChartFrame';
import { clickPlacementLabel } from '@/lib/analytics/labels';
import { formatCountWithShare } from '@/lib/analytics/tooltip';

type PlacementBarChartProps = {
  data: { placement: string; count: number; sharePercent: number }[];
};

export function PlacementBarChart({ data }: PlacementBarChartProps): React.JSX.Element {
  const chartData = data.map((item) => ({
    placement: clickPlacementLabel(item.placement),
    count: item.count,
    sharePercent: item.sharePercent,
  }));

  return (
    <AdminPageCard className="p-5">
      <h3 className="text-sm font-semibold text-[color:var(--admin-navy)]">
        Cliques por componente
      </h3>
      {chartData.length === 0 ? (
        <AdminEmptyState
          icon={Layers}
          title="Sem placement registrado"
          hint="Os componentes passam placement nos CTAs de afiliado."
        />
      ) : (
        <AnalyticsChartFrame height={288}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" />
            <XAxis type="number" allowDecimals={false} fontSize={12} />
            <YAxis type="category" dataKey="placement" width={150} fontSize={11} />
            <Tooltip formatter={(value, _name, item) => formatCountWithShare(value, item)} />
            <Bar dataKey="count" fill="var(--admin-primary)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </AnalyticsChartFrame>
      )}
    </AdminPageCard>
  );
}
