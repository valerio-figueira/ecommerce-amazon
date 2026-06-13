export function getPrimaryImageUrl(images: string[]): string | undefined {
  return images.map((url) => url.trim()).find((url) => url.startsWith('https://'));
}
