'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useTransition } from 'react';

import type { PublishedArticlesListResponse } from '@ecommerce-amazon/shared/admin';
import { ClickPlacement } from '@ecommerce-amazon/shared/analytics';

import { ArticleCard } from '@/components/articles/ArticleCard';
import { ListingPagination } from '@/components/listing/ListingPagination';
import { ProductCard } from '@/components/product/ProductCard';
import { SearchTypeSwitch } from '@/components/search/SearchTypeSwitch';
import {
  searchTypeToParam,
  totalSearchPages,
  type SearchResultType,
} from '@/lib/api/search';
import type { ProductsPageDto } from '@/lib/api/schemas';

type SearchResultsViewProps = {
  query: string;
  activeType: SearchResultType;
  page: number;
  products: ProductsPageDto;
  articles: PublishedArticlesListResponse;
};

function buildSearchHref(
  query: string,
  type: SearchResultType,
  page: number,
): string {
  const params = new URLSearchParams();
  params.set('q', query);
  if (type === 'articles') {
    params.set('tipo', searchTypeToParam(type));
  }
  if (page > 1) {
    params.set('page', String(page));
  }
  return `/busca?${params.toString()}`;
}

export function SearchResultsView({
  query,
  activeType,
  page,
  products,
  articles,
}: SearchResultsViewProps): React.JSX.Element {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const productTotal = products.total;
  const articleTotal = articles.total;
  const activeTotal = activeType === 'products' ? productTotal : articleTotal;
  const activePageSize =
    activeType === 'products' ? products.pageSize : articles.limit;
  const totalPages = totalSearchPages(activeTotal, activePageSize);
  const activeItems = activeType === 'products' ? products.items : articles.items;

  const handleTypeChange = useCallback(
    (nextType: SearchResultType): void => {
      if (nextType === activeType) return;
      startTransition(() => {
        router.replace(buildSearchHref(query, nextType, 1));
      });
    },
    [activeType, query, router],
  );

  const resultSummary =
    activeTotal === 0
      ? `Nenhum ${activeType === 'products' ? 'produto' : 'artigo'} encontrado`
      : `${activeTotal} ${activeType === 'products' ? 'produto' : 'artigo'}${activeTotal === 1 ? '' : 's'} encontrado${activeTotal === 1 ? '' : 's'}`;

  return (
    <div className={isPending ? 'opacity-70 transition-opacity' : undefined}>
      <div className="mb-6 max-w-md">
        <SearchTypeSwitch
          activeType={activeType}
          productCount={productTotal}
          articleCount={articleTotal}
          onChange={handleTypeChange}
        />
      </div>

      <p className="mb-6 text-sm text-neutral-500">{resultSummary}</p>

      <div
        role="tabpanel"
        id={activeType === 'products' ? 'search-panel-products' : 'search-panel-articles'}
        aria-labelledby={
          activeType === 'products' ? 'search-tab-products' : 'search-tab-articles'
        }
      >
        {activeItems.length === 0 ? (
          <div className="rounded-[var(--radius)] border border-dashed border-neutral-300 bg-white px-6 py-12 text-center">
            <p className="text-sm text-neutral-500">
              {activeType === 'products'
                ? 'Nenhum produto encontrado para esta busca.'
                : 'Nenhum artigo encontrado para esta busca.'}
            </p>
            {activeType === 'products' && articleTotal > 0 ? (
              <button
                type="button"
                className="mt-4 text-sm font-medium text-[var(--primary)] hover:underline"
                onClick={() => handleTypeChange('articles')}
              >
                Ver {articleTotal} artigo{articleTotal === 1 ? '' : 's'}
              </button>
            ) : null}
            {activeType === 'articles' && productTotal > 0 ? (
              <button
                type="button"
                className="mt-4 text-sm font-medium text-[var(--primary)] hover:underline"
                onClick={() => handleTypeChange('products')}
              >
                Ver {productTotal} produto{productTotal === 1 ? '' : 's'}
              </button>
            ) : null}
          </div>
        ) : activeType === 'products' ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.items.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                variant="compact"
                placement={ClickPlacement.CATEGORY_LISTING}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.items.map((article) => (
              <ArticleCard key={article.slug} article={article} showExcerpt />
            ))}
          </div>
        )}
      </div>

      <ListingPagination
        page={page}
        totalPages={totalPages}
        ariaLabel={`Paginação de ${activeType === 'products' ? 'produtos' : 'artigos'}`}
        isPending={isPending}
        className="mt-8"
      />
    </div>
  );
}
