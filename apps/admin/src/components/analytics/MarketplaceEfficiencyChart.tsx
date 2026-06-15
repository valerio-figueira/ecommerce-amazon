'use client';

import { Scale } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { AdminPageCard } from '@/components/admin/AdminPageCard';
import { AnalyticsChartFrame } from '@/components/analytics/AnalyticsChartFrame';
import { formatClickIndex, marketplaceLabel } from '@/lib/analytics/labels';

type MarketplaceEfficiencyItem = {
  marketplace: string;
  count: number;
  sharePercent: number;
  catalogCount: number;
  catalogSharePercent: number;
  clickIndex: number | null;
};

type MarketplaceEfficiencyChartProps = {
  data: MarketplaceEfficiencyItem[];
};

function formatTooltipValue(value: unknown, name: unknown): [string, string] {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (name === 'catalogSharePercent') {
    return [`${numeric}%`, 'Mix do catálogo'];
  }
  if (name === 'sharePercent') {
    return [`${numeric}%`, 'Mix de cliques'];
  }
  return [String(value), String(name)];
}

export function MarketplaceEfficiencyChart({
  data,
}: MarketplaceEfficiencyChartProps): React.JSX.Element {
  const chartData = data.map((item) => ({
    marketplace: marketplaceLabel(item.marketplace),
    sharePercent: item.sharePercent ?? 0,
    catalogSharePercent: item.catalogSharePercent ?? 0,
    clickIndex: item.clickIndex ?? null,
    clickCount: item.count ?? 0,
    catalogCount: item.catalogCount ?? 0,
  }));

  return (
    <AdminPageCard className="p-5">
      <div className="mb-1">
        <h3 className="text-sm font-semibold text-[color:var(--admin-navy)]">
          Eficiência por marketplace
        </h3>
        <p className="mt-1 text-xs text-[color:var(--admin-text-muted)]">
          Compara o mix de cliques de saída com a composição do catálogo visível. Índice &gt; 1
          indica marketplace que converte acima da sua representação no catálogo.
        </p>
      </div>

      {chartData.length === 0 ? (
        <AdminEmptyState
          icon={Scale}
          title="Sem dados de marketplace"
          hint="Cadastre produtos visíveis e aguarde cliques de afiliado no período."
        />
      ) : (
        <>
          <AnalyticsChartFrame height={256}>
            <BarChart data={chartData} margin={{ left: 8, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" />
              <XAxis dataKey="marketplace" fontSize={12} />
              <YAxis
                allowDecimals={false}
                fontSize={12}
                unit="%"
                domain={[0, 'auto']}
              />
              <Tooltip
                formatter={formatTooltipValue}
                labelFormatter={(label) => String(label)}
                content={({ active, payload, label }) => {
                  if (!active || !payload || payload.length === 0) return null;
                  const row = payload[0]?.payload as (typeof chartData)[number] | undefined;
                  if (!row) return null;

                  return (
                    <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs shadow-sm">
                      <p className="mb-1 font-semibold text-neutral-900">{label}</p>
                      <p className="text-neutral-600">
                        Catálogo: {row.catalogSharePercent}% ({row.catalogCount} produtos)
                      </p>
                      <p className="text-neutral-600">
                        Cliques: {row.sharePercent}% ({row.clickCount} cliques)
                      </p>
                      <p className="mt-1 font-medium text-[color:var(--admin-primary)]">
                        Índice: {formatClickIndex(row.clickIndex)}
                      </p>
                    </div>
                  );
                }}
              />
              <Legend
                formatter={(value) =>
                  value === 'catalogSharePercent' ? 'Mix do catálogo' : 'Mix de cliques'
                }
              />
              <Bar
                dataKey="catalogSharePercent"
                name="catalogSharePercent"
                fill="#94a3b8"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="sharePercent"
                name="sharePercent"
                fill="var(--admin-primary)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </AnalyticsChartFrame>

          <ul className="mt-4 space-y-2 border-t border-neutral-100 pt-3">
            {chartData.map((item) => (
              <li
                key={item.marketplace}
                className="flex flex-wrap items-center justify-between gap-2 text-xs"
              >
                <span className="font-medium text-neutral-800">{item.marketplace}</span>
                <span className="text-neutral-500">
                  {item.clickCount} cliques · catálogo {item.catalogCount}
                </span>
                <span
                  className={
                    item.clickIndex != null && item.clickIndex >= 1
                      ? 'font-semibold text-emerald-700'
                      : item.clickIndex != null && item.clickIndex < 1
                        ? 'font-semibold text-amber-700'
                        : 'text-neutral-400'
                  }
                >
                  {formatClickIndex(item.clickIndex)}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </AdminPageCard>
  );
}
