import { Suspense } from 'react';
import { AlertTriangle, MousePointerClick, Newspaper, Package } from 'lucide-react';

import { formatAdminPageTitle } from '@ecommerce-amazon/shared/config/brand';

import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { BlockAttributionTable } from '@/components/analytics/BlockAttributionTable';
import { ClicksTrendChart } from '@/components/analytics/ClicksTrendChart';
import { ConvertingArticlesTable } from '@/components/analytics/ConvertingArticlesTable';
import { DashboardKpiCard } from '@/components/analytics/DashboardKpiCard';
import { DateRangeSelect } from '@/components/analytics/DateRangeSelect';
import { EditorialFunnelSection } from '@/components/analytics/EditorialFunnelSection';
import { Ga4TrafficSection } from '@/components/analytics/Ga4TrafficSection';
import { MarketplaceEfficiencyChart } from '@/components/analytics/MarketplaceEfficiencyChart';
import { OriginBarChart } from '@/components/analytics/OriginBarChart';
import { OriginTrendStackedChart } from '@/components/analytics/OriginTrendStackedChart';
import { PagePathTable } from '@/components/analytics/PagePathTable';
import { PlacementBarChart } from '@/components/analytics/PlacementBarChart';
import { TopProductsTable } from '@/components/analytics/TopProductsTable';
import {
  loadDashboardAnalytics,
  resolveDateRangeFromSearchParams,
} from '@/lib/api/analytics';
import { getServerBrandConfig } from '@/lib/brand';

const brand = getServerBrandConfig();

export const metadata = {
  title: formatAdminPageTitle('Painel', brand),
};

type DashboardPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps): Promise<React.JSX.Element> {
  const params = await searchParams;
  const range = resolveDateRangeFromSearchParams(params);

  const {
    apiUnavailable,
    overview,
    byOrigin,
    byMarketplace,
    topProducts,
    convertingArticles,
    ga4Traffic,
    byPlacement,
    byBlock,
    byPage,
    trendByOrigin,
    editorialFunnel,
  } = await loadDashboardAnalytics(range);

  const topArticleClicks = convertingArticles.items[0]?.clickCount ?? 0;

  return (
    <>
      <AdminPageHeader title="Painel" breadcrumbs={[{ label: 'Painel' }]} />
      <section className="admin-dashboard-board w-full max-w-[var(--admin-page-max-width)] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[color:var(--admin-text-muted)]">
            Cockpit de conversão, atribuição e saúde do catálogo.
          </p>
          <Suspense fallback={<div className="h-8 w-48 animate-pulse rounded-full bg-neutral-100" />}>
            <DateRangeSelect />
          </Suspense>
        </div>

        {apiUnavailable ? (
          <div
            role="status"
            className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          >
            Não foi possível carregar os dados analíticos. Verifique se a API está em execução e
            tente atualizar a página.
          </div>
        ) : null}

        {!apiUnavailable && (overview.pendingEventCount ?? 0) > 0 ? (
          <div
            role="status"
            className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900"
          >
            Inclui {(overview.pendingEventCount ?? 0).toLocaleString('pt-BR')} eventos recentes
            ainda não consolidados no PostgreSQL.
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <DashboardKpiCard
            label="Cliques de saída"
            value={overview.totalClicks.toLocaleString('pt-BR')}
            hint="CTAs de afiliado no período"
            icon={MousePointerClick}
          />
          <DashboardKpiCard
            label="Preços defasados"
            value={`${overview.catalogHealth.staleRatePercent}%`}
            hint={`${overview.catalogHealth.staleCount} de ${overview.catalogHealth.totalVisibleProducts} produtos visíveis`}
            icon={AlertTriangle}
          />
          <DashboardKpiCard
            label="Produtos esgotados"
            value={overview.catalogHealth.outOfStockCount.toLocaleString('pt-BR')}
            hint="Disponibilidade out_of_stock"
            icon={Package}
          />
          <DashboardKpiCard
            label="Top artigo conversor"
            value={topArticleClicks.toLocaleString('pt-BR')}
            hint="Maior volume de cliques via embed/comparador"
            icon={Newspaper}
          />
        </div>

        <EditorialFunnelSection data={editorialFunnel} />

        <div className="grid gap-4 lg:grid-cols-2 [&>*]:min-w-0">
          <ClicksTrendChart data={overview.clicksTrend} />
          <OriginTrendStackedChart data={trendByOrigin.items} />
        </div>

        <div className="grid gap-4 lg:grid-cols-2 [&>*]:min-w-0">
          <PlacementBarChart data={byPlacement.items} />
          <BlockAttributionTable items={byBlock.items} />
        </div>

        <PagePathTable items={byPage.items} />

        <div className="grid gap-4 lg:grid-cols-2 [&>*]:min-w-0">
          <OriginBarChart data={byOrigin.items} />
          <MarketplaceEfficiencyChart data={byMarketplace.items} />
        </div>

        <div className="grid gap-4 lg:grid-cols-2 [&>*]:min-w-0">
          <TopProductsTable items={topProducts.items} />
          <ConvertingArticlesTable items={convertingArticles.items} />
        </div>

        <Ga4TrafficSection
          configured={ga4Traffic.configured}
          totalPageViews={ga4Traffic.totalPageViews}
          items={ga4Traffic.items}
        />
      </section>
    </>
  );
}
