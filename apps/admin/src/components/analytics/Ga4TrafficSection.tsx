'use client';

import { Globe } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';

import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { AdminPageCard } from '@/components/admin/AdminPageCard';
import { AnalyticsChartFrame } from '@/components/analytics/AnalyticsChartFrame';

type Ga4TrafficSectionProps = {
  configured: boolean;
  totalPageViews: number;
  items: { channel: string; pageViews: number; sharePercent: number }[];
};

export function Ga4TrafficSection({
  configured,
  totalPageViews,
  items,
}: Ga4TrafficSectionProps): React.JSX.Element {
  if (!configured) {
    return (
      <AdminPageCard className="p-5">
        <h3 className="text-sm font-semibold text-[color:var(--admin-navy)]">
          Tráfego e aquisição (GA4)
        </h3>
        <p className="mt-2 text-sm text-[color:var(--admin-text-muted)]">
          Configure <code className="text-xs">GA4_PROPERTY_ID</code> e{' '}
          <code className="text-xs">GA4_SERVICE_ACCOUNT_JSON</code> na API para habilitar pageviews
          e canais de aquisição.
        </p>
      </AdminPageCard>
    );
  }

  return (
    <AdminPageCard className="p-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-[color:var(--admin-navy)]">
            Tráfego e aquisição (GA4)
          </h3>
          <p className="mt-1 text-xs text-[color:var(--admin-text-muted)]">
            Total de pageviews no período: {totalPageViews.toLocaleString('pt-BR')}
          </p>
        </div>
      </div>
      {items.length === 0 ? (
        <AdminEmptyState
          icon={Globe}
          title="Sem dados GA4 no período"
          hint="Aguarde a integração GA4 no web e o tráfego na vitrine."
        />
      ) : (
        <div className="mt-4 grid min-w-0 gap-4 lg:grid-cols-2 [&>*]:min-w-0">
          <AnalyticsChartFrame height={224} className="">
            <AreaChart data={items}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" />
              <XAxis
                dataKey="channel"
                fontSize={11}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={60}
              />
              <YAxis allowDecimals={false} fontSize={12} />
              <Tooltip formatter={(value) => [String(value), 'Pageviews']} />
              <Area
                type="monotone"
                dataKey="pageViews"
                stroke="var(--admin-primary)"
                fill="color-mix(in srgb, var(--admin-primary) 20%, transparent)"
              />
            </AreaChart>
          </AnalyticsChartFrame>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[color:var(--admin-border)] text-[color:var(--admin-text-muted)]">
                  <th className="pb-2 pr-3 font-medium">Canal</th>
                  <th className="pb-2 pr-3 font-medium text-right">Pageviews</th>
                  <th className="pb-2 font-medium text-right">%</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.channel} className="border-b border-[color:var(--admin-border)]">
                    <td className="py-2 pr-3">{item.channel}</td>
                    <td className="py-2 pr-3 text-right">{item.pageViews}</td>
                    <td className="py-2 text-right">{item.sharePercent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminPageCard>
  );
}
