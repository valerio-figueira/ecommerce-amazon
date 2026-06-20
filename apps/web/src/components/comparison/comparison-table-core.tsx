'use client';

import { RemoteImage } from '@/components/ui/RemoteImage';
import Link from 'next/link';

import { ComparisonVolatilePrice } from '@/components/comparison/ComparisonVolatilePrice';
import { MarketplaceBadge } from '@/components/product/MarketplaceBadge';
import { ProductCardActions } from '@/components/product/ProductCardActions';
import { ProductEditorialProsCons } from '@/components/product/ProductEditorialProsCons';
import { ProductRating } from '@/components/product/ProductRating';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { AffiliateClickOrigin } from '@/components/product/AffiliateGoLink';
import type { ClickPlacementValue } from '@ecommerce-amazon/shared/analytics';
import type { ProductDetailDto } from '@/lib/api/schemas';
import { formatSpecKey } from '@/lib/format-spec-key';
import { cn } from '@/lib/utils';

export type ComparisonBadge = {
  type: 'best_overall' | 'best_value';
  label: string;
};

export function collectSpecKeys(products: (ProductDetailDto | null)[]): string[] {
  const keys: string[] = [];
  for (const product of products) {
    if (!product) continue;
    for (const key of Object.keys(product.specs)) {
      if (!keys.includes(key)) {
        keys.push(key);
      }
    }
  }
  return keys;
}

function addBadge(
  map: Map<number, ComparisonBadge[]>,
  index: number,
  badge: ComparisonBadge,
): void {
  const existing = map.get(index) ?? [];
  if (!existing.some((item) => item.type === badge.type)) {
    map.set(index, [...existing, badge]);
  }
}

export function resolveComparisonBadges(
  products: (ProductDetailDto | null)[],
): Map<number, ComparisonBadge[]> {
  const badgesByIndex = new Map<number, ComparisonBadge[]>();
  const resolved = products
    .map((product, index) => ({ product, index }))
    .filter(
      (entry): entry is { product: ProductDetailDto; index: number } => entry.product !== null,
    );

  if (resolved.length === 0) {
    return badgesByIndex;
  }

  const bestOverall = resolved.reduce((best, current) =>
    current.product.editorialScore > best.product.editorialScore ? current : best,
  );
  addBadge(badgesByIndex, bestOverall.index, {
    type: 'best_overall',
    label: 'Melhor Geral',
  });

  const priced = resolved.filter(
    (entry) => !entry.product.price.isStale && entry.product.price.amount !== null,
  );
  if (priced.length >= 2) {
    const bestValue = priced.reduce((best, current) => {
      const bestAmount = best.product.price.amount ?? Number.POSITIVE_INFINITY;
      const currentAmount = current.product.price.amount ?? Number.POSITIVE_INFINITY;
      return currentAmount < bestAmount ? current : best;
    });
    addBadge(badgesByIndex, bestValue.index, {
      type: 'best_value',
      label: 'Custo-Benefício',
    });
  }

  return badgesByIndex;
}

const comparisonBadgeStyles: Record<ComparisonBadge['type'], string> = {
  best_overall: 'bg-amber-500 text-white',
  best_value: 'bg-emerald-600 text-white',
};

export function ProductHeaderCell({
  product,
}: {
  product: ProductDetailDto | null;
}): React.JSX.Element {
  if (!product) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50 px-3 py-4 text-sm text-neutral-600">
        Produto indisponível no catálogo local.
      </div>
    );
  }

  const imageUrl = product.images[0] ?? product.imageUrl;

  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <Link
        href={`/produtos/${product.slug}`}
        className="relative block h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-100"
      >
        {imageUrl ? (
          <RemoteImage
            src={imageUrl}
            alt={product.title}
            fill
            className="object-cover"
            sizes="64px"
          />
        ) : null}
      </Link>
      <Link
        href={`/produtos/${product.slug}`}
        className="line-clamp-2 text-sm font-semibold leading-snug text-neutral-900 hover:underline"
      >
        {product.title}
      </Link>
      <ComparisonVolatilePrice product={product} compact />
    </div>
  );
}

export function ComparisonBadgesCell({ badges }: { badges: ComparisonBadge[] }): React.JSX.Element {
  if (badges.length === 0) {
    return <span className="text-neutral-400">—</span>;
  }

  return (
    <div className="flex flex-wrap justify-center gap-1">
      {badges.map((badge) => (
        <span
          key={badge.type}
          className={cn(
            'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
            comparisonBadgeStyles[badge.type],
          )}
        >
          {badge.label}
        </span>
      ))}
    </div>
  );
}

type ComparisonActionsProps = {
  product: ProductDetailDto;
  sessionId: string;
  clickOrigin: AffiliateClickOrigin;
  placement: ClickPlacementValue;
  articleId?: string | undefined;
  comparisonSlug?: string | undefined;
};

function ComparisonActions({
  product,
  sessionId,
  clickOrigin,
  placement,
  articleId,
  comparisonSlug,
}: ComparisonActionsProps): React.JSX.Element {
  return (
    <ProductCardActions
      product={product}
      sessionId={sessionId}
      clickOrigin={clickOrigin}
      placement={placement}
      {...(articleId !== undefined ? { articleId } : {})}
      {...(comparisonSlug !== undefined ? { comparisonSlug } : {})}
      editorial
      className="w-full"
    />
  );
}

type ComparisonTableCoreProps = {
  slugs: string[];
  products: (ProductDetailDto | null)[];
  sessionId: string;
  clickOrigin: AffiliateClickOrigin;
  placement: ClickPlacementValue;
  articleId?: string | undefined;
  comparisonSlug?: string | undefined;
  showMarketplace?: boolean;
  footerExtra?: React.ReactNode;
};

function MobileComparisonCard({
  product,
  slug,
  badges,
  specKeys,
  sessionId,
  clickOrigin,
  placement,
  articleId,
  showMarketplace,
  comparisonSlug,
}: {
  product: ProductDetailDto | null;
  slug: string;
  badges: ComparisonBadge[];
  specKeys: string[];
  sessionId: string;
  clickOrigin: AffiliateClickOrigin;
  placement: ClickPlacementValue;
  articleId?: string | undefined;
  showMarketplace?: boolean;
  comparisonSlug?: string | undefined;
}): React.JSX.Element {
  if (!product) {
    return (
      <article className="flex min-w-[240px] shrink-0 flex-col rounded-[var(--radius)] border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
        Produto &quot;{slug}&quot; indisponível no catálogo local.
      </article>
    );
  }

  return (
    <article className="flex min-w-[260px] shrink-0 flex-col rounded-[var(--radius)] border border-neutral-200/80 p-3 sm:min-w-[280px] sm:p-4">
      <ProductHeaderCell product={product} />
      <div className="mt-3">
        <ComparisonBadgesCell badges={badges} />
      </div>
      {showMarketplace ? (
        <div className="mt-3 flex justify-center">
          <MarketplaceBadge marketplace={product.marketplace} />
        </div>
      ) : null}
      <dl className="mt-4 space-y-2 border-t border-neutral-100 pt-3">
        {specKeys.map((key) => (
          <div key={key}>
            <dt className="text-xs font-medium text-neutral-500">{formatSpecKey(key)}</dt>
            <dd className="text-sm text-neutral-800">{product.specs[key] ?? '—'}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 border-t border-neutral-100 pt-3">
        <ProductEditorialProsCons
          pros={product.pros}
          cons={product.cons}
          className="text-xs sm:text-sm"
        />
      </div>
      <div className="mt-auto shrink-0 pt-3">
        <ProductRating rating={product.rating} reviewCount={product.reviewCount} compact />
        <div className="mt-4">
          <ComparisonActions
            product={product}
            sessionId={sessionId}
            clickOrigin={clickOrigin}
            placement={placement}
            articleId={articleId}
            comparisonSlug={comparisonSlug}
          />
        </div>
      </div>
    </article>
  );
}

const LABEL_COLUMN_WIDTH = '11rem';

export function ComparisonTableCore({
  slugs,
  products,
  sessionId,
  clickOrigin,
  placement,
  articleId,
  comparisonSlug,
  showMarketplace = false,
  footerExtra,
}: ComparisonTableCoreProps): React.JSX.Element {
  const specKeys = collectSpecKeys(products);
  const badgesByIndex = resolveComparisonBadges(products);

  return (
    <div aria-label="Comparativo de produtos" className="min-w-0 w-full">
      <div className="min-w-0 overflow-x-auto md:hidden">
        <div className="flex flex-row items-stretch gap-4 pb-2">
          {products.map((product, index) => (
            <MobileComparisonCard
              key={`mobile-${slugs[index] ?? index}`}
              product={product}
              slug={slugs[index] ?? ''}
              badges={badgesByIndex.get(index) ?? []}
              specKeys={specKeys}
              sessionId={sessionId}
              clickOrigin={clickOrigin}
              placement={placement}
              articleId={articleId}
              showMarketplace={showMarketplace}
              comparisonSlug={comparisonSlug}
            />
          ))}
        </div>
      </div>

      <div className="hidden min-w-0 w-full overflow-x-auto md:block">
        <Table className="table-fixed w-full min-w-0">
          <colgroup>
            <col style={{ width: LABEL_COLUMN_WIDTH }} />
            {products.map((_, index) => (
              <col key={`col-${slugs[index] ?? index}`} />
            ))}
          </colgroup>
          <TableHeader>
            <TableRow>
              <TableHead className="text-neutral-400">Critério</TableHead>
              {products.map((product, index) => (
                <TableHead
                  key={`head-${slugs[index] ?? index}`}
                  className="text-center text-[11px] font-semibold normal-case tracking-normal text-neutral-500"
                >
                  <span className="sr-only">{product ? product.title : slugs[index]}</span>
                  <span aria-hidden>Produto {index + 1}</span>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium text-neutral-600">Resumo</TableCell>
              {products.map((product, index) => (
                <TableCell key={`summary-${slugs[index] ?? index}`} className="text-center">
                  <ProductHeaderCell product={product} />
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="font-medium text-neutral-600">Destaques</TableCell>
              {products.map((product, index) => (
                <TableCell key={`highlights-${slugs[index] ?? index}`} className="text-center">
                  <ComparisonBadgesCell badges={badgesByIndex.get(index) ?? []} />
                </TableCell>
              ))}
            </TableRow>
            {showMarketplace ? (
              <TableRow>
                <TableCell className="font-medium text-neutral-600">Marketplace</TableCell>
                {products.map((product, index) => (
                  <TableCell key={`marketplace-${slugs[index] ?? index}`} className="text-center">
                    {product ? <MarketplaceBadge marketplace={product.marketplace} /> : '—'}
                  </TableCell>
                ))}
              </TableRow>
            ) : null}
            {specKeys.map((key) => (
              <TableRow key={key}>
                <TableCell className="font-medium text-neutral-600">{formatSpecKey(key)}</TableCell>
                {products.map((product, index) => (
                  <TableCell
                    key={`${key}-${slugs[index] ?? index}`}
                    className="break-words text-center text-sm"
                  >
                    {product?.specs[key] ?? '—'}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            <TableRow>
              <TableCell className="font-medium text-neutral-600">Prós e contras</TableCell>
              {products.map((product, index) => (
                <TableCell key={`pros-cons-${slugs[index] ?? index}`} className="text-left">
                  {product ? (
                    <ProductEditorialProsCons pros={product.pros} cons={product.cons} />
                  ) : (
                    '—'
                  )}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="font-medium text-neutral-600">Avaliação</TableCell>
              {products.map((product, index) => (
                <TableCell key={`rating-${slugs[index] ?? index}`} className="text-center">
                  {product ? (
                    <ProductRating
                      rating={product.rating}
                      reviewCount={product.reviewCount}
                      compact
                    />
                  ) : (
                    '—'
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell className="font-medium text-neutral-600">Ação</TableCell>
              {products.map((product, index) => (
                <TableCell key={`action-${slugs[index] ?? index}`} className="align-bottom">
                  {product ? (
                    <ComparisonActions
                      product={product}
                      sessionId={sessionId}
                      clickOrigin={clickOrigin}
                      placement={placement}
                      articleId={articleId}
                      comparisonSlug={comparisonSlug}
                    />
                  ) : (
                    '—'
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableFooter>
        </Table>
      </div>
      {footerExtra ? <div className="mt-4 flex justify-center">{footerExtra}</div> : null}
    </div>
  );
}
