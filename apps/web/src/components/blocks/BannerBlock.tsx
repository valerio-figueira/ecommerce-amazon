'use client';

import { RemoteImage } from '@/components/ui/RemoteImage';
import Link from 'next/link';

import { bannerPropsSchema } from '@ecommerce-amazon/shared/cms';

import type { BlockComponentProps } from '@/components/cms/BlockRegistry';

export function BannerBlock({
  block,
  isFirstBlock = false,
}: BlockComponentProps): React.JSX.Element {
  const props = bannerPropsSchema.parse(block.props);
  return (
    <Link href={props.href} className="block overflow-hidden rounded-[var(--radius)]">
      <RemoteImage
        src={props.imageUrl}
        alt={props.alt}
        width={1200}
        height={400}
        sizes="100vw"
        className="h-auto w-full object-cover"
        {...(isFirstBlock
          ? { priority: true }
          : { loading: 'lazy' as const, decoding: 'async' as const })}
      />
    </Link>
  );
}
