'use client';

import { RemoteImage } from '@/components/ui/RemoteImage';
import { useState } from 'react';

import { cn } from '@/lib/utils';

type ProductImageGalleryProps = {
  images: string[];
  alt: string;
};

export function ProductImageGallery({
  images,
  alt,
}: ProductImageGalleryProps): React.JSX.Element {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage = images[selectedIndex];

  return (
    <div>
      <div
        className={cn(
          'relative aspect-square overflow-hidden rounded-2xl border border-gray-100 bg-white',
          !selectedImage && 'bg-gray-50',
        )}
      >
        {selectedImage ? (
          <RemoteImage
            src={selectedImage}
            alt={alt}
            fill
            className="object-cover"
            priority
            sizes="(max-width:768px) 100vw, 50vw"
          />
        ) : null}
      </div>
      {images.length > 1 ? (
        <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              aria-label={`Ver imagem ${index + 1} de ${images.length}`}
              aria-pressed={selectedIndex === index}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                'relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-white p-1 transition-colors',
                selectedIndex === index
                  ? 'border-gray-900 ring-2 ring-gray-900 ring-offset-1'
                  : 'border-gray-200 hover:border-gray-300',
              )}
            >
              <RemoteImage
                src={image}
                alt=""
                fill
                className="object-contain"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
