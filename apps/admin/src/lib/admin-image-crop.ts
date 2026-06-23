import type { Area } from 'react-easy-crop';

export type CropOutputOptions = {
  width: number;
  height: number;
  quality?: number;
};

const MIN_ZOOM_FLOOR = 0.05;
const DEFAULT_MAX_ZOOM = 8;

/**
 * Minimum zoom so the full uploaded image can fit inside the crop frame.
 * react-easy-crop defaults to 1 (cover), which truncates tall/wide product photos.
 */
export function computeMinZoomToFitMedia(
  cropAspect: number,
  mediaWidth: number,
  mediaHeight: number,
): number {
  if (mediaWidth <= 0 || mediaHeight <= 0 || cropAspect <= 0) {
    return 1;
  }

  const mediaAspect = mediaWidth / mediaHeight;
  const fitZoom = mediaAspect > cropAspect ? cropAspect / mediaAspect : mediaAspect / cropAspect;

  return Math.min(1, Math.max(MIN_ZOOM_FLOOR, fitZoom));
}

export function computeMaxZoomForCrop(minZoom: number): number {
  return Math.max(DEFAULT_MAX_ZOOM, minZoom > 0 ? 1 / minZoom : DEFAULT_MAX_ZOOM);
}

export async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', () => reject(new Error('Falha ao carregar imagem')));
    image.src = src;
  });
}

export type DrawRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/** Clamp a crop rectangle to the natural bounds of the source image. */
export function clampSourceCrop(
  pixelCrop: Area,
  naturalWidth: number,
  naturalHeight: number,
): DrawRect {
  const x = Math.max(0, Math.min(pixelCrop.x, naturalWidth));
  const y = Math.max(0, Math.min(pixelCrop.y, naturalHeight));
  const right = Math.max(x, Math.min(pixelCrop.x + pixelCrop.width, naturalWidth));
  const bottom = Math.max(y, Math.min(pixelCrop.y + pixelCrop.height, naturalHeight));

  return {
    x,
    y,
    width: right - x,
    height: bottom - y,
  };
}

/** Fit a source region into the output canvas (letterbox) preserving aspect ratio. */
export function computeContainDrawRect(
  outputWidth: number,
  outputHeight: number,
  srcWidth: number,
  srcHeight: number,
): DrawRect {
  if (srcWidth <= 0 || srcHeight <= 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  const scale = Math.min(outputWidth / srcWidth, outputHeight / srcHeight);
  const drawWidth = srcWidth * scale;
  const drawHeight = srcHeight * scale;

  return {
    x: (outputWidth - drawWidth) / 2,
    y: (outputHeight - drawHeight) / 2,
    width: drawWidth,
    height: drawHeight,
  };
}

export async function getCroppedImageBlob(
  imageSrc: string,
  pixelCrop: Area,
  options: CropOutputOptions,
): Promise<Blob> {
  const { width, height, quality = 0.92 } = options;
  const image = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Canvas não suportado');
  }

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, width, height);

  const sourceCrop = clampSourceCrop(pixelCrop, image.naturalWidth, image.naturalHeight);
  if (sourceCrop.width <= 0 || sourceCrop.height <= 0) {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Falha ao processar imagem'));
            return;
          }
          resolve(blob);
        },
        'image/jpeg',
        quality,
      );
    });
  }

  const dest = computeContainDrawRect(width, height, sourceCrop.width, sourceCrop.height);

  context.drawImage(
    image,
    sourceCrop.x,
    sourceCrop.y,
    sourceCrop.width,
    sourceCrop.height,
    dest.x,
    dest.y,
    dest.width,
    dest.height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Falha ao processar imagem'));
          return;
        }
        resolve(blob);
      },
      'image/jpeg',
      quality,
    );
  });
}

/** @deprecated Use getCroppedImageBlob with width/height 512 */
export async function getCroppedAvatarBlob(
  imageSrc: string,
  pixelCrop: Area,
  outputSize = 512,
): Promise<Blob> {
  return getCroppedImageBlob(imageSrc, pixelCrop, {
    width: outputSize,
    height: outputSize,
  });
}
