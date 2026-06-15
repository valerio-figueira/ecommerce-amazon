'use client';

import Image from 'next/image';
import Link from 'next/link';

import { PriceDisplay } from '@/components/product/PriceDisplay';
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
import type { ProductDetailDto } from '@/lib/api/schemas';
import { formatSpecKey } from '@/lib/format-spec-key';
import { cn } from '@/lib/utils';

type ComparisonTableProps = {
  slugs: string[];
  products: (ProductDetailDto | null)[];
};

type ComparisonBadge = {
  type: 'best_overall' | 'best_value';
  label: string;
};

function collectSpecKeys(products: (ProductDetailDto | null)[]): string[] {
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

function resolveComparisonBadges(
  products: (ProductDetailDto | null)[],
): Map<number, ComparisonBadge[]> {
  const badgesByIndex = new Map<number, ComparisonBadge[]>();
  const resolved = products
    .map((product, index) => ({ product, index }))
    .filter((entry): entry is { product: ProductDetailDto; index: number } => entry.product !== null);

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

const comparisonBadgeStyles: Record<ComparisonBadge['type'], string> = {
  best_overall: 'bg-amber-500 text-white',
  best_value: 'bg-emerald-600 text-white',
};

function ProductHeaderCell({ product }: { product: ProductDetailDto | null }): React.JSX.Element {
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
          <Image src={imageUrl} alt={product.title} fill className="object-cover" sizes="64px" />
        ) : null}
      </Link>
      <Link
        href={`/produtos/${product.slug}`}
        className="line-clamp-2 text-sm font-semibold leading-snug text-neutral-900 hover:underline"
      >
        {product.title}
      </Link>
      <PriceDisplay price={product.price} strikethrough={product.price.strikethrough} compact />
    </div>
  );
}

function ComparisonBadgesCell({ badges }: { badges: ComparisonBadge[] }): React.JSX.Element {
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

function MobileProductCard({
  product,
  slug,
  badges,
  specKeys,
}: {
  product: ProductDetailDto | null;
  slug: string;
  badges: ComparisonBadge[];
  specKeys: string[];
}): React.JSX.Element {
  if (!product) {
    return (
      <article className="min-w-[240px] shrink-0 rounded-[var(--radius)] border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
        Produto &quot;{slug}&quot; indisponível no catálogo local.
      </article>
    );
  }

  return (
    <article className="min-w-[240px] shrink-0 rounded-[var(--radius)] border border-neutral-200 bg-white p-4 shadow-sm">
      <ProductHeaderCell product={product} />
      <div className="mt-3">
        <ComparisonBadgesCell badges={badges} />
      </div>
      <dl className="mt-4 space-y-2 border-t border-neutral-100 pt-3">
        {specKeys.map((key) => (
          <div key={key}>
            <dt className="text-xs font-medium text-neutral-500">{formatSpecKey(key)}</dt>
            <dd className="text-sm text-neutral-800">{product.specs[key] ?? '—'}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 border-t border-neutral-100 pt-3">
        <ProductEditorialProsCons pros={product.pros} cons={product.cons} />
      </div>
      <div className="mt-3">
        <ProductRating rating={product.rating} reviewCount={product.reviewCount} compact />
      </div>
      <div className="mt-4">
        <ProductCardActions product={product} clickOrigin="embed" editorial />
      </div>
    </article>
  );
}

export function ComparisonTable({ slugs, products }: ComparisonTableProps): React.JSX.Element {
  if (slugs.length < 2 || slugs.length > 3) {
    return (
      <div className="rounded-[var(--radius)] border border-neutral-200 bg-neutral-50 px-4 py-6 text-sm text-neutral-600">
        A tabela comparativa precisa de 2 a 3 produtos. Verifique o shortcode{' '}
        <code className="text-xs">[[compare:slug-1,slug-2]]</code>.
      </div>
    );
  }

  const specKeys = collectSpecKeys(products);
  const badgesByIndex = resolveComparisonBadges(products);

  return (
    <div aria-label="Comparativo de produtos">
      <div className="md:hidden -mx-4 overflow-x-auto px-4">
        <div className="flex flex-row gap-4 pb-2">
          {products.map((product, index) => (
            <MobileProductCard
              key={`mobile-${slugs[index] ?? index}`}
              product={product}
              slug={slugs[index] ?? ''}
              badges={badgesByIndex.get(index) ?? []}
              specKeys={specKeys}
            />
          ))}
        </div>
      </div>

      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[140px]">Produto</TableHead>
              {products.map((product, index) => (
                <TableHead key={`head-${slugs[index] ?? index}`} className="min-w-[180px] text-center">
                  {product ? product.title : slugs[index]}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium text-neutral-600">Resumo</TableCell>
              {products.map((product, index) => (
                <TableCell key={`summary-${slugs[index] ?? index}`}>
                  <ProductHeaderCell product={product} />
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="font-medium text-neutral-600">Destaques</TableCell>
              {products.map((product, index) => (
                <TableCell key={`highlights-${slugs[index] ?? index}`}>
                  <ComparisonBadgesCell badges={badgesByIndex.get(index) ?? []} />
                </TableCell>
              ))}
            </TableRow>
            {specKeys.map((key) => (
              <TableRow key={key}>
                <TableCell className="font-medium text-neutral-600">{formatSpecKey(key)}</TableCell>
                {products.map((product, index) => (
                  <TableCell key={`${key}-${slugs[index] ?? index}`}>
                    {product?.specs[key] ?? '—'}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            <TableRow>
              <TableCell className="font-medium text-neutral-600">Prós e contras</TableCell>
              {products.map((product, index) => (
                <TableCell key={`pros-cons-${slugs[index] ?? index}`}>
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
                <TableCell key={`rating-${slugs[index] ?? index}`}>
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
                <TableCell key={`action-${slugs[index] ?? index}`}>
                  {product ? (
                    <ProductCardActions product={product} clickOrigin="embed" editorial />
                  ) : (
                    '—'
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
}
