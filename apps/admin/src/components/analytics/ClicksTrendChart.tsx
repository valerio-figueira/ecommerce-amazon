'use client';

import { LineChart as LineChartIcon } from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { AdminPageCard } from '@/components/admin/AdminPageCard';
import { AnalyticsChartFrame } from '@/components/analytics/AnalyticsChartFrame';

type ClicksTrendChartProps = {
  data: { date: string; count: number }[];
};

function formatDateLabel(value: string): string {
  const [, month, day] = value.split('-');
  return `${day}/${month}`;
}

export function ClicksTrendChart({ data }: ClicksTrendChartProps): React.JSX.Element {
  return (
    <AdminPageCard className="p-5">
      <h3 className="text-sm font-semibold text-[color:var(--admin-navy)]">Cliques por dia</h3>
      {data.length === 0 ? (
        <AdminEmptyState
          icon={LineChartIcon}
          title="Sem cliques no período"
          hint="Os gráficos aparecerão quando houver tráfego de saída registrado."
        />
      ) : (
        <AnalyticsChartFrame height={256}>
          <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" />
              <XAxis dataKey="date" tickFormatter={formatDateLabel} fontSize={12} />
              <YAxis allowDecimals={false} fontSize={12} />
              <Tooltip
                labelFormatter={(label) => `Data: ${String(label)}`}
                formatter={(value) => [String(value), 'Cliques']}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="var(--admin-primary)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
        </AnalyticsChartFrame>
      )}
    </AdminPageCard>
  );
}
