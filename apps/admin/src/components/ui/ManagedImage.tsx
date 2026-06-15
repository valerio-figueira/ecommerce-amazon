'use client';

import { useState } from 'react';

import { cn } from '@/lib/utils';

type ManagedImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  fallback?: React.ReactNode;
};

export function ManagedImage({
  src,
  alt,
  fallback = null,
  className,
  onError,
  ...rest
}: ManagedImageProps): React.JSX.Element | null {
  const [failed, setFailed] = useState(false);
  const trimmed = typeof src === 'string' ? src.trim() : '';

  if (!trimmed || failed) {
    return fallback !== null ? <>{fallback}</> : null;
  }

  return (
    <img
      src={trimmed}
      alt={alt ?? ''}
      className={cn(className)}
      onError={(event) => {
        setFailed(true);
        onError?.(event);
      }}
      {...rest}
    />
  );
}
