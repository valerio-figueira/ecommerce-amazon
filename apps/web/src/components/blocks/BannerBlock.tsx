'use client';

import { RemoteImage } from '@/components/ui/RemoteImage';
import Link from 'next/link';

import { bannerPropsSchema } from '@ecommerce-amazon/shared/cms';

import type { BlockComponentProps } from '@/components/cms/BlockRegistry';

export function BannerBlock({ block }: BlockComponentProps): React.JSX.Element {
  const props = bannerPropsSchema.parse(block.props);
  return (
    <Link href={props.href} className="block overflow-hidden rounded-[var(--radius)]">
      <RemoteImage
        src={props.imageUrl}
        alt={props.alt}
        width={1200}
        height={400}
        className="h-auto w-full object-cover"
      />
    </Link>
  );
}
