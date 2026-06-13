'use client';

import { dynamicProductGridPropsSchema } from '@ecommerce-amazon/shared/cms';

import type { BlockComponentProps } from '@/components/cms/BlockRegistry';
import { ProductCard } from '@/components/product/ProductCard';
import { mapDeliveryProductToListItem } from '@/lib/cms/map-delivery-product';

export function DynamicProductGridBlock({ block }: BlockComponentProps): React.JSX.Element {
  const props = dynamicProductGridPropsSchema.parse(block.props);
  const products = (block.renderedData ?? []).map(mapDeliveryProductToListItem);

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-bold md:text-3xl">{props.title}</h2>
        {props.subtitle && (
          <p className="mt-1 text-sm text-neutral-600 md:text-base">{props.subtitle}</p>
        )}
      </div>
      {products.length === 0 ? (
        <p className="text-sm text-neutral-500">Nenhum produto encontrado para este bloco.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} blockId={block.id} />
          ))}
        </div>
      )}
    </section>
  );
}
