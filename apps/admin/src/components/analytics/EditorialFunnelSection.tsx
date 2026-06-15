'use client';

import { Filter } from 'lucide-react';

import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { AdminPageCard } from '@/components/admin/AdminPageCard';
import type { EditorialFunnelResponse } from '@ecommerce-amazon/shared/admin';

type EditorialFunnelSectionProps = {
  data: EditorialFunnelResponse;
};

function formatRate(value: number | null): string {
  if (value === null) return '—';
  return `${value.toLocaleString('pt-BR')}%`;
}

export function EditorialFunnelSection({ data }: EditorialFunnelSectionProps): React.JSX.Element {
  const hasData =
    data.articleCardClicks > 0 || data.articlePageViews > 0 || data.embedAffiliateClicks > 0;

  return (
    <AdminPageCard className="p-5">
      <h3 className="text-sm font-semibold text-[color:var(--admin-navy)]">Funil editorial</h3>
      <p className="mt-1 text-xs text-[color:var(--admin-text-muted)]">
        Listagem → leitura do artigo → clique afiliado no embed/comparador.
      </p>

      {!hasData ? (
        <AdminEmptyState
          icon={Filter}
          title="Funil sem eventos no período"
          hint="Navegue pela listagem /artigos, abra um artigo e clique em um CTA de afiliado."
        />
      ) : (
        <div className="mt-4 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-lg border border-[color:var(--admin-border)] p-4">
              <p className="text-xs text-[color:var(--admin-text-muted)]">Cliques em cards</p>
              <p className="mt-1 text-2xl font-bold text-[color:var(--admin-navy)]">
                {data.articleCardClicks.toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="rounded-lg border border-[color:var(--admin-border)] p-4">
              <p className="text-xs text-[color:var(--admin-text-muted)]">Views de artigo</p>
              <p className="mt-1 text-2xl font-bold text-[color:var(--admin-navy)]">
                {data.articlePageViews.toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="rounded-lg border border-[color:var(--admin-border)] p-4">
              <p className="text-xs text-[color:var(--admin-text-muted)]">Cliques afiliado</p>
              <p className="mt-1 text-2xl font-bold text-[color:var(--admin-navy)]">
                {data.embedAffiliateClicks.toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="rounded-lg border border-[color:var(--admin-border)] p-4">
              <p className="text-xs text-[color:var(--admin-text-muted)]">Card → view</p>
              <p className="mt-1 text-2xl font-bold text-[color:var(--admin-navy)]">
                {formatRate(data.cardToViewRatePercent)}
              </p>
            </div>
            <div className="rounded-lg border border-[color:var(--admin-border)] p-4">
              <p className="text-xs text-[color:var(--admin-text-muted)]">View → clique</p>
              <p className="mt-1 text-2xl font-bold text-[color:var(--admin-navy)]">
                {formatRate(data.viewToClickRatePercent)}
              </p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {[
              { title: 'Top por cliques em card', items: data.topArticlesByCardClicks },
              { title: 'Top por views', items: data.topArticlesByPageViews },
              { title: 'Top por cliques afiliado', items: data.topArticlesByAffiliateClicks },
            ].map((section) => (
              <div key={section.title}>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[color:var(--admin-text-muted)]">
                  {section.title}
                </h4>
                {section.items.length === 0 ? (
                  <p className="text-sm text-[color:var(--admin-text-muted)]">Sem dados.</p>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {section.items.map((item) => (
                      <li
                        key={`${section.title}-${item.articleId}`}
                        className="flex items-center justify-between gap-2"
                      >
                        <span className="line-clamp-1">{item.title}</span>
                        <span className="shrink-0 font-semibold">{item.count}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </AdminPageCard>
  );
}
