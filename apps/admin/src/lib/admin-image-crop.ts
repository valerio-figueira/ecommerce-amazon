import type { Area } from 'react-easy-crop';

export type CropOutputOptions = {
  width: number;
  height: number;
  quality?: number;
};

export async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', () => reject(new Error('Falha ao carregar imagem')));
    image.src = src;
  });
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

  context.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    width,
    height,
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
