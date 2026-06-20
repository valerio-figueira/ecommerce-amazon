'use client';

import { ImageIcon } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/utils';

type ProductThumbnailProps = {
  src?: string | undefined;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'cover';
  className?: string;
};

const sizeClasses: Record<NonNullable<ProductThumbnailProps['size']>, string> = {
  xs: 'h-10 w-10 rounded-md',
  sm: 'h-12 w-12 rounded-lg',
  md: 'h-16 w-16 rounded-xl',
  cover: 'h-full w-full rounded-none border-0',
};

const iconSizes: Record<NonNullable<ProductThumbnailProps['size']>, string> = {
  xs: 'h-4 w-4',
  sm: 'h-5 w-5',
  md: 'h-6 w-6',
  cover: 'h-8 w-8',
};

export function ProductThumbnail({
  src,
  alt,
  size = 'sm',
  className,
}: ProductThumbnailProps): React.JSX.Element {
  const [failed, setFailed] = useState(false);
  const trimmed = src?.trim();
  const showImage =
    trimmed !== undefined &&
    (trimmed.startsWith('https://') || trimmed.startsWith('http://')) &&
    !failed;

  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden border border-[color-mix(in_srgb,var(--admin-navy)_10%,var(--admin-gray))] bg-[var(--admin-accent-subtle)]',
        sizeClasses[size],
        className,
      )}
    >
      {showImage ? (
        <img
          src={trimmed}
          alt={alt}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[var(--admin-primary)]">
          <ImageIcon className={iconSizes[size]} aria-hidden />
        </div>
      )}
    </div>
  );
}
