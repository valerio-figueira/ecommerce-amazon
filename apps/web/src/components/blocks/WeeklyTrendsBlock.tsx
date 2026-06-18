'use client';

import { useEffect, useState } from 'react';

import { weeklyTrendsPropsSchema } from '@ecommerce-amazon/shared/cms';
import { ClickPlacement } from '@ecommerce-amazon/shared/analytics';

import { ArticleCarousel } from '@/components/articles/ArticleCarousel';
import type { BlockComponentProps } from '@/components/cms/BlockRegistry';
import { ProductCarousel } from '@/components/product/ProductCarousel';
import { mapDeliveryProductToListItem } from '@/lib/cms/map-delivery-product';
import { cn } from '@/lib/utils';

type TrendsTab = 'products' | 'articles';

function resolveInitialTab(
  defaultTab: TrendsTab,
  productsCount: number,
  articlesCount: number,
  minItems: number,
): TrendsTab {
  const productsReady = productsCount >= minItems;
  const articlesReady = articlesCount >= minItems;

  if (defaultTab === 'products' && productsReady) return 'products';
  if (defaultTab === 'articles' && articlesReady) return 'articles';
  if (productsReady) return 'products';
  if (articlesReady) return 'articles';
  return defaultTab;
}

export function WeeklyTrendsBlock({ block }: BlockComponentProps): React.JSX.Element | null {
  const props = weeklyTrendsPropsSchema.parse(block.props);
  const rendered = block.renderedWeeklyTrends;
  const minItems = props.minItems;

  const products = rendered?.products.map(mapDeliveryProductToListItem) ?? [];
  const articles = rendered?.articles ?? [];

  const productsReady = products.length >= minItems;
  const articlesReady = articles.length >= minItems;

  const [activeTab, setActiveTab] = useState<TrendsTab>(() =>
    resolveInitialTab(props.defaultTab, products.length, articles.length, minItems),
  );

  useEffect(() => {
    setActiveTab((current) => {
      if (current === 'products' && productsReady) return 'products';
      if (current === 'articles' && articlesReady) return 'articles';
      return resolveInitialTab(props.defaultTab, products.length, articles.length, minItems);
    });
  }, [props.defaultTab, products.length, articles.length, minItems, productsReady, articlesReady]);

  const tabIds = {
    products: `weekly-trends-products-${block.id}`,
    articles: `weekly-trends-articles-${block.id}`,
  };

  if (!rendered) {
    return null;
  }

  const showProductsPanel = activeTab === 'products' && productsReady;
  const showArticlesPanel = activeTab === 'articles' && articlesReady;

  if (!showProductsPanel && !showArticlesPanel) {
    return null;
  }

  const showToggle = props.showTabToggle && productsReady && articlesReady;

  const subtitle = props.subtitle ?? `Baseado na atividade dos ${rendered.periodLabel}`;

  const productsCtaHref = props.productsCtaHref ?? '/categorias';
  const productsCtaLabel = props.productsCtaLabel ?? 'Ver catálogo completo ➔';
  const articlesCtaHref = props.articlesCtaHref ?? '/artigos';
  const articlesCtaLabel = props.articlesCtaLabel ?? 'Ver todos os artigos ➔';

  return (
    <section aria-label={props.title}>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold md:text-3xl">{props.title}</h2>
          <p className="mt-1 text-sm text-neutral-600 md:text-base">{subtitle}</p>
        </div>

        {showToggle ? (
          <div
            role="tablist"
            aria-label="Tipo de tendência"
            className="inline-flex rounded-full border border-neutral-200 bg-neutral-100 p-1"
          >
            <button
              type="button"
              role="tab"
              id={tabIds.products}
              aria-selected={activeTab === 'products'}
              aria-controls={`${tabIds.products}-panel`}
              onClick={() => setActiveTab('products')}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-medium transition',
                activeTab === 'products'
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900',
              )}
            >
              Produtos
            </button>
            <button
              type="button"
              role="tab"
              id={tabIds.articles}
              aria-selected={activeTab === 'articles'}
              aria-controls={`${tabIds.articles}-panel`}
              onClick={() => setActiveTab('articles')}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-medium transition',
                activeTab === 'articles'
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900',
              )}
            >
              Artigos
            </button>
          </div>
        ) : null}
      </div>

      {showProductsPanel ? (
        <div
          role="tabpanel"
          id={`${tabIds.products}-panel`}
          aria-labelledby={tabIds.products}
          hidden={activeTab !== 'products'}
        >
          <ProductCarousel
            products={products}
            blockId={block.id}
            placement={ClickPlacement.CMS_WEEKLY_TRENDS}
            skeletonCount={props.limit}
            cardVariant="compact"
            slideSize="sm"
            catalogHref={productsCtaHref}
            catalogCtaLabel={productsCtaLabel}
          />
        </div>
      ) : null}

      {showArticlesPanel ? (
        <div
          role="tabpanel"
          id={`${tabIds.articles}-panel`}
          aria-labelledby={tabIds.articles}
          hidden={activeTab !== 'articles'}
        >
          <ArticleCarousel
            articles={articles}
            engagementPlacement={ClickPlacement.CMS_WEEKLY_TRENDS}
            skeletonCount={props.limit}
            catalogHref={articlesCtaHref}
            catalogCtaLabel={articlesCtaLabel}
          />
        </div>
      ) : null}
    </section>
  );
}
