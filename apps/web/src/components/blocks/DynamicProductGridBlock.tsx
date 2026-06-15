'use client';

import { dynamicProductGridPropsSchema } from '@ecommerce-amazon/shared/cms';
import { ClickPlacement } from '@ecommerce-amazon/shared/analytics';

import type { BlockComponentProps } from '@/components/cms/BlockRegistry';
import { ProductCarousel } from '@/components/product/ProductCarousel';
import { mapDeliveryProductToListItem } from '@/lib/cms/map-delivery-product';

export function DynamicProductGridBlock({ block }: BlockComponentProps): React.JSX.Element | null {
  const props = dynamicProductGridPropsSchema.parse(block.props);
  const products = (block.renderedData ?? []).map(mapDeliveryProductToListItem);

  if (products.length === 0) {
    return null;
  }

  const emphasizeDiscount =
    props.minDiscountPercentage !== undefined && props.minDiscountPercentage > 0;
  const isFlashDeals =
    emphasizeDiscount &&
    (props.sortBy === 'discount_percent_desc' || (props.minDiscountPercentage ?? 0) >= 20);

  return (
    <section>
      <div className="mb-6">
        {isFlashDeals && (
          <span className="mb-2 inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-red-600 ring-1 ring-red-100">
            Promoção relâmpago
          </span>
        )}
        <h2 className="text-2xl font-bold md:text-3xl">{props.title}</h2>
        {props.subtitle && (
          <p className="mt-1 text-sm text-neutral-600 md:text-base">{props.subtitle}</p>
        )}
      </div>

      <ProductCarousel
        products={products}
        blockId={block.id}
        placement={ClickPlacement.CMS_PRODUCT_GRID}
        skeletonCount={props.limit}
        emphasizeDiscount={emphasizeDiscount}
        cardVariant="compact"
        slideSize="sm"
      />
    </section>
  );
}
