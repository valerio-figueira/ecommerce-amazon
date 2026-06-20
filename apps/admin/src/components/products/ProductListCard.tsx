import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  adminMarketplaceLabel,
  formatAdminProductPrice,
  formatEditorialScore,
} from '@/lib/product-admin-format';
import { cn } from '@/lib/utils';
import type { AdminProductListItem } from '@ecommerce-amazon/shared/admin';

import { ProductThumbnail } from './ProductThumbnail';

type ProductListCardProps = {
  product: AdminProductListItem;
};

export function ProductListCard({ product }: ProductListCardProps): React.JSX.Element {
  const priceLabel = formatAdminProductPrice(product.price);
  const showNumericPrice = !product.price.isStale && product.price.amount !== null;

  return (
    <article className="admin-product-card">
      <div className="admin-product-card__media-wrap">
        <Link
          href={`/produtos/${product.slug}`}
          className="admin-product-card__media"
          aria-label={`Editar ${product.title}`}
        >
          <ProductThumbnail src={product.imageUrl} alt={product.title} size="cover" />
        </Link>
        <span className="admin-product-card__marketplace">
          {adminMarketplaceLabel(product.marketplace)}
        </span>
      </div>

      <div className="admin-product-card__body">
        <Link
          href={`/produtos/${product.slug}`}
          className="admin-product-card__title hover:text-[var(--admin-primary)] hover:underline"
        >
          {product.title}
        </Link>

        <p className="admin-product-card__meta">
          {product.externalId} · Nota {formatEditorialScore(product.editorialScore)} · /
          {product.slug}
        </p>

        <div className="admin-product-card__pills">
          <span className={cn('cms-status-pill', product.visible ? 'is-published' : 'is-draft')}>
            {product.visible ? 'Visível' : 'Oculto'}
          </span>
          <span
            className={cn('cms-status-pill', product.price.isStale ? 'is-draft' : 'is-published')}
          >
            {product.price.isStale ? 'Preço oculto' : 'Preço ok'}
          </span>
        </div>

        <div className="admin-product-card__spacer" aria-hidden />

        <div className="admin-product-card__footer">
          <p
            className={cn(
              'admin-product-card__price',
              showNumericPrice ? 'text-[var(--admin-navy-deep)]' : 'text-[var(--admin-text-muted)]',
            )}
          >
            {priceLabel}
          </p>
          <Button asChild variant="primary" size="sm" className="h-8 w-full px-3 text-xs">
            <Link href={`/produtos/${product.slug}`}>Editar produto</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
