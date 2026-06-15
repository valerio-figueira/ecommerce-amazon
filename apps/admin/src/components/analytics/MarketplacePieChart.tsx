'use client';

import { PieChart as PieChartIcon } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { AdminPageCard } from '@/components/admin/AdminPageCard';
import { marketplaceLabel } from '@/lib/analytics/labels';

const CHART_COLORS = ['#0d6efd', '#20c997', '#fd7e14', '#6f42c1', '#dc3545'];

type MarketplacePieChartProps = {
  data: { marketplace: string; count: number; sharePercent: number }[];
};

export function MarketplacePieChart({ data }: MarketplacePieChartProps): React.JSX.Element {
  const chartData = data.map((item) => ({
    name: marketplaceLabel(item.marketplace),
    value: item.count,
    sharePercent: item.sharePercent,
  }));

  return (
    <AdminPageCard className="p-5">
      <h3 className="text-sm font-semibold text-[color:var(--admin-navy)]">
        Cliques por marketplace
      </h3>
      {chartData.length === 0 ? (
        <AdminEmptyState
          icon={PieChartIcon}
          title="Sem distribuição"
          hint="Nenhum clique registrado para segmentar por marketplace."
        />
      ) : (
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={2}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={CHART_COLORS[index % CHART_COLORS.length] ?? '#0d6efd'}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [String(value), 'Cliques']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </AdminPageCard>
  );
}
