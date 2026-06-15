import { RemoteImage } from '@/components/ui/RemoteImage';
import Link from 'next/link';

import type {
  BentoHubMixRendered,
  BentoHubMixRenderedSlot1,
  ProductDeliveryItem,
} from '@ecommerce-amazon/shared/cms';

import { BentoHubMixSkeleton } from '@/components/blocks/BentoHubMixSkeleton';
import { PriceDisplay } from '@/components/product/PriceDisplay';
import { computeDiscountPercent } from '@/lib/discount';
import { mapDeliveryProductToListItem } from '@/lib/cms/map-delivery-product';
import { cn } from '@/lib/utils';

type BentoHubMixGridProps = {
  rendered: BentoHubMixRendered | undefined;
  blockId: string;
};

function BentoHeroSlot({ slot }: { slot: BentoHubMixRenderedSlot1 }): React.JSX.Element {
  return (
    <Link
      href={slot.href}
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
  const listItem = mapDeliveryProductToListItem(product);
  const discountPercent = computeDiscountPercent(
    listItem.price.amount,
    listItem.price.strikethrough,
  );
  const showDiscountBadge = discountPercent !== null && !listItem.price.isStale;
  const detailHref = `/produtos/${product.slug}`;

  return (
    <Link
      href={detailHref}
      data-block-id={blockId}
      className={cn(
        'group flex min-h-[10.5rem] flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm',
        'transition-transform duration-300 hover:scale-[1.02] hover:shadow-md',
      )}
    >
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
  );
}

function BentoListSlot({
  slot,
  blockId,
}: {
  slot: NonNullable<BentoHubMixRendered['slot3']>;
  blockId: string;
}): React.JSX.Element {
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
      <ul className="flex flex-1 flex-col gap-2.5">
        {slot.products.map((product) => {
          const listItem = mapDeliveryProductToListItem(product);
          return (
            <li key={product.id}>
              <Link
                href={`/produtos/${product.slug}`}
                data-block-id={blockId}
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
    </div>
  );
}

export function BentoHubMixGrid({ rendered, blockId }: BentoHubMixGridProps): React.JSX.Element {
  const slot1 = rendered?.slot1 ?? null;
  const slot2 = rendered?.slot2 ?? null;
  const slot3 = rendered?.slot3 ?? null;

  return (
    <section>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {slot1 ? <BentoHeroSlot slot={slot1} /> : <BentoHubMixSkeleton variant="hero" />}
        {slot2 ? (
          <BentoOfferSlot product={slot2} blockId={blockId} />
        ) : (
          <BentoHubMixSkeleton variant="offer" />
        )}
        {slot3 ? (
          <BentoListSlot slot={slot3} blockId={blockId} />
        ) : (
          <BentoHubMixSkeleton variant="list" />
        )}
      </div>
    </section>
  );
}
