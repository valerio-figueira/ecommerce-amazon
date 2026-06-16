'use client';

import { RemoteImage } from '@/components/ui/RemoteImage';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import type {
  BentoHubMixRendered,
  BentoHubMixRenderedSlot1,
  ProductDeliveryItem,
} from '@ecommerce-amazon/shared/cms';
import { ClickPlacement } from '@ecommerce-amazon/shared/analytics';

import { BlockUnavailableFallback } from '@/components/errors/BlockUnavailableFallback';
import { AffiliateGoLink } from '@/components/product/AffiliateGoLink';
import { PriceDisplay } from '@/components/product/PriceDisplay';
import { useWishlist } from '@/components/wishlist/WishlistProvider';
import { computeDiscountPercent } from '@/lib/discount';
import { mapDeliveryProductToListItem } from '@/lib/cms/map-delivery-product';
import { setAttribution } from '@/lib/attribution/context';
import { marketplaceLabel } from '@/lib/format';
import { cn } from '@/lib/utils';

type BentoHubMixGridProps = {
  rendered: BentoHubMixRendered | undefined;
  blockId: string;
  heroPriority?: boolean;
};

function BentoHeroSlot({
  slot,
  blockId,
  priority = false,
}: {
  slot: BentoHubMixRenderedSlot1;
  blockId: string;
  priority?: boolean;
}): React.JSX.Element {
  const handleClick = (): void => {
    if (slot.contentType === 'article') {
      setAttribution({
        entryPath: slot.href,
        entryPlacement: ClickPlacement.CMS_BENTO_ARTICLE,
        blockId,
      });
    }
  };

  return (
    <Link
      href={slot.href}
      onClick={handleClick}
      className={cn(
        'group relative block min-h-[18rem] overflow-hidden rounded-3xl border border-gray-100 shadow-sm',
        'transition-transform duration-300 hover:scale-[1.02] hover:shadow-md md:col-span-2 md:row-span-2 md:min-h-[22rem]',
      )}
    >
      <RemoteImage
        src={slot.coverImageUrl}
        alt=""
        fill
        sizes="(max-width: 768px) 100vw, 66vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        aria-hidden
        {...(priority ? { priority: true } : { loading: 'lazy' as const, decoding: 'async' as const })}
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"
        aria-hidden
      />
      <div className="absolute bottom-0 left-0 right-0 z-10 p-5 md:p-6">
        <span className="mb-2 inline-flex rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium uppercase tracking-wide text-white/90 backdrop-blur-sm">
          {slot.contentType === 'collection' ? 'Coleção' : 'Artigo'}
        </span>
        <h3 className="text-xl font-bold text-white md:text-2xl">{slot.title}</h3>
        {slot.subtitle && (
          <p className="mt-1.5 max-w-lg text-sm text-white/85 md:text-base">{slot.subtitle}</p>
        )}
      </div>
    </Link>
  );
}

function BentoOfferSlot({
  product,
  blockId,
}: {
  product: ProductDeliveryItem;
  blockId: string;
}): React.JSX.Element {
  const { sessionId } = useWishlist();
  const listItem = mapDeliveryProductToListItem(product);
  const discountPercent = computeDiscountPercent(
    listItem.price.amount,
    listItem.price.strikethrough,
  );
  const showDiscountBadge = discountPercent !== null && !listItem.price.isStale;
  const detailHref = `/produtos/${product.slug}`;
  const marketplace = marketplaceLabel(product.marketplace);

  return (
    <article
      className={cn(
        'group flex min-h-[10.5rem] flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm',
        'transition-transform duration-300 hover:scale-[1.02] hover:shadow-md',
      )}
    >
      <Link href={detailHref} data-block-id={blockId} className="flex flex-1 flex-col">
        <div className="relative aspect-[4/3] shrink-0 overflow-hidden bg-neutral-100">
          {product.imageUrl && (
            <RemoteImage
              src={product.imageUrl}
              alt={product.title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
          {showDiscountBadge && (
            <span className="absolute left-3 top-3 rounded-full bg-rose-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
              -{discountPercent}%
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1.5 p-3">
          <h4 className="line-clamp-2 text-sm font-semibold text-neutral-900">{product.title}</h4>
          <PriceDisplay
            price={listItem.price}
            strikethrough={listItem.price.strikethrough}
            compact
          />
        </div>
      </Link>
      <div className="border-t border-neutral-100 p-3 pt-0">
        <AffiliateGoLink
          productId={product.id}
          slug={product.slug}
          sessionId={sessionId}
          blockId={blockId}
          origin="listagem"
          placement={ClickPlacement.CMS_BENTO_OFFER}
          className="mt-3 text-xs"
        >
          Ver preço na {marketplace}
        </AffiliateGoLink>
      </div>
    </article>
  );
}

function BentoListSlot({
  slot,
  blockId,
}: {
  slot: NonNullable<BentoHubMixRendered['slot3']>;
  blockId: string;
}): React.JSX.Element {
  const pathname = usePathname();

  const handleProductClick = (): void => {
    setAttribution({
      entryPath: pathname,
      entryPlacement: ClickPlacement.CMS_BENTO_LIST,
      blockId,
    });
  };

  return (
    <div
      className={cn(
        'flex min-h-[10.5rem] flex-col rounded-3xl border border-gray-100 bg-white p-4 shadow-sm',
      )}
    >
      {slot.mode === 'category' && slot.categoryHref && (
        <Link
          href={slot.categoryHref}
          data-block-id={blockId}
          className="mb-3 text-sm font-bold text-neutral-900 hover:text-[var(--primary)]"
        >
          {slot.categoryTitle ?? 'Top da categoria'} →
        </Link>
      )}
      {slot.mode === 'products' && (
        <p className="mb-3 text-sm font-bold text-neutral-900">Seleção do editor</p>
      )}
      {slot.products.length === 0 ? (
        <p className="flex flex-1 items-center text-xs text-neutral-500">
          Nenhum produto publicado nesta seleção.
        </p>
      ) : (
      <ul className="flex flex-1 flex-col gap-2.5">
        {slot.products.map((product) => {
          const listItem = mapDeliveryProductToListItem(product);
          return (
            <li key={product.id}>
              <Link
                href={`/produtos/${product.slug}`}
                data-block-id={blockId}
                onClick={handleProductClick}
                className="group flex items-center gap-3 rounded-xl p-1 transition-colors hover:bg-neutral-50"
              >
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                  {product.imageUrl && (
                    <RemoteImage
                      src={product.imageUrl}
                      alt=""
                      fill
                      sizes="48px"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-xs font-medium text-neutral-900">
                    {product.title}
                  </p>
                  <PriceDisplay
                    price={listItem.price}
                    strikethrough={listItem.price.strikethrough}
                    compact
                  />
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
      )}
    </div>
  );
}

export function BentoHubMixGrid({
  rendered,
  blockId,
  heroPriority = false,
}: BentoHubMixGridProps): React.JSX.Element {
  const slot1 = rendered?.slot1 ?? null;
  const slot2 = rendered?.slot2 ?? null;
  const slot3 = rendered?.slot3 ?? null;

  return (
    <section>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {slot1 ? (
          <BentoHeroSlot slot={slot1} blockId={blockId} priority={heroPriority} />
        ) : (
          <BlockUnavailableFallback variant="hero" />
        )}
        {slot2 ? (
          <BentoOfferSlot product={slot2} blockId={blockId} />
        ) : (
          <BlockUnavailableFallback variant="offer" />
        )}
        {slot3 ? (
          <BentoListSlot slot={slot3} blockId={blockId} />
        ) : (
          <BlockUnavailableFallback variant="list" />
        )}
      </div>
    </section>
  );
}
