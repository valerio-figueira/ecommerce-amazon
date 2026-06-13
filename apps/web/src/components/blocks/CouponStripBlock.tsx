'use client';

import { couponStripPropsSchema } from '@ecommerce-amazon/shared/cms';

import type { BlockComponentProps } from '@/components/cms/BlockRegistry';

export function CouponStripBlock({ block }: BlockComponentProps): React.JSX.Element {
  const props = couponStripPropsSchema.parse(block.props);
  return (
    <section className="rounded-[var(--radius)] bg-white p-4 text-sm text-neutral-600">
      Faixa de cupons (máx. {props.maxItems}) — disponível em fase 2.
    </section>
  );
}
