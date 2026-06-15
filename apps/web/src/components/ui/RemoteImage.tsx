'use client';

import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';

import { isNextImageRemoteUrl } from '@ecommerce-amazon/shared/next-image';

import { WEB_IMAGE_REMOTE_PATTERNS } from '@/lib/next-image-patterns';

type RemoteImageProps = ImageProps & {
  fallback?: React.ReactNode;
};

export function RemoteImage({
  src,
  alt,
  fallback = null,
  onError,
  fill,
  width,
  height,
  className,
  ...rest
}: RemoteImageProps): React.JSX.Element | null {
  const [failed, setFailed] = useState(false);
  const srcString = typeof src === 'string' ? src.trim() : '';

  if (!srcString || failed) {
    return fallback !== null ? <>{fallback}</> : null;
  }

  const canUseNextImage = isNextImageRemoteUrl(srcString, WEB_IMAGE_REMOTE_PATTERNS);

  const handleError: React.ReactEventHandler<HTMLImageElement> = (event) => {
    setFailed(true);
    onError?.(event);
  };

  if (canUseNextImage) {
    const imageProps = {
      src: srcString,
      alt,
      className,
      onError: handleError,
      ...rest,
      ...(fill !== undefined ? { fill } : {}),
      ...(width !== undefined ? { width } : {}),
      ...(height !== undefined ? { height } : {}),
    } satisfies ImageProps;

    return <Image {...imageProps} />;
  }

  if (fill) {
    return (
      <img
        src={srcString}
        alt={alt}
        className={className}
        onError={handleError}
        style={{
          position: 'absolute',
          height: '100%',
          width: '100%',
          inset: 0,
          objectFit: 'cover',
        }}
      />
    );
  }

  return (
    <img
      src={srcString}
      alt={alt}
      width={typeof width === 'number' ? width : undefined}
      height={typeof height === 'number' ? height : undefined}
      className={className}
      onError={handleError}
    />
  );
}
