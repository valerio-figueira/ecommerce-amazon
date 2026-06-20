'use client';

import { useMemo } from 'react';
import { LineChart as LineChartIcon } from 'lucide-react';
import { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts';

import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { AdminPageCard } from '@/components/admin/AdminPageCard';
import { AnalyticsChartFrame } from '@/components/analytics/AnalyticsChartFrame';
import { clickOriginLabel } from '@/lib/analytics/labels';

const ORIGIN_COLORS = [
  'var(--admin-primary)',
  '#16a34a',
  '#ea580c',
  '#9333ea',
  '#0891b2',
  '#be123c',
  '#ca8a04',
  '#64748b',
];

type OriginTrendStackedChartProps = {
  data: { date: string; origin: string; count: number }[];
};

function formatDateLabel(value: string): string {
  const [, month, day] = value.split('-');
  return `${day}/${month}`;
}

export function OriginTrendStackedChart({ data }: OriginTrendStackedChartProps): React.JSX.Element {
  const { chartData, origins } = useMemo(() => {
    const originSet = new Set<string>();
    const byDate = new Map<string, Record<string, number | string>>();

    for (const point of data) {
      originSet.add(point.origin);
      const row = byDate.get(point.date) ?? { date: point.date };
      row[point.origin] = point.count;
      byDate.set(point.date, row);
    }

    return {
      origins: Array.from(originSet),
      chartData: Array.from(byDate.values()).sort((a, b) =>
        String(a['date']).localeCompare(String(b['date'])),
      ),
    };
  }, [data]);

  return (
    <AdminPageCard className="p-5">
      <h3 className="text-sm font-semibold text-[color:var(--admin-navy)]">Tendência por origem</h3>
      {chartData.length === 0 ? (
        <AdminEmptyState
          icon={LineChartIcon}
          title="Sem tendência por origem"
          hint="Cliques com origin contextual aparecerão aqui."
        />
      ) : (
        <AnalyticsChartFrame height={256}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" />
            <XAxis dataKey="date" tickFormatter={formatDateLabel} fontSize={12} />
            <YAxis allowDecimals={false} fontSize={12} />
            <Tooltip labelFormatter={(label) => `Data: ${String(label)}`} />
            <Legend formatter={(value) => clickOriginLabel(String(value))} />
            {origins.map((origin, index) => {
              const stroke = ORIGIN_COLORS[index % ORIGIN_COLORS.length] ?? 'var(--admin-primary)';
              return (
                <Line
                  key={origin}
                  type="monotone"
                  dataKey={origin}
                  name={origin}
                  stroke={stroke}
                  strokeWidth={2}
                  dot={false}
                />
              );
            })}
          </LineChart>
        </AnalyticsChartFrame>
      )}
    </AdminPageCard>
  );
}
