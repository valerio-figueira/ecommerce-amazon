import { isRecord } from '@ecommerce-amazon/shared/utils/type-guards';

export function readShopeeStringField(value: unknown, fallback: string): string {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  return fallback;
}

export function readShopeeApiError(body: unknown): string | null {
  if (!isRecord(body)) {
    return null;
  }
  const error = body['error'];
  return typeof error === 'string' && error.length > 0 ? error : null;
}

export function readShopeeResponseBlock(body: unknown): Record<string, unknown> | null {
  if (!isRecord(body)) {
    return null;
  }
  const responseBlock = body['response'];
  return isRecord(responseBlock) ? responseBlock : null;
}

export function readFirstShopeeItem(responseBlock: Record<string, unknown>): Record<string, unknown> | null {
  const itemList = responseBlock['item_list'];
  if (!Array.isArray(itemList) || itemList.length === 0) {
    return null;
  }
  const rawItem: unknown = itemList[0];
  return isRecord(rawItem) ? rawItem : null;
}

export function readShopeePriceAmount(itemRecord: Record<string, unknown>): number | undefined {
  const priceInfo = itemRecord['price_info'];
  if (!Array.isArray(priceInfo) || !isRecord(priceInfo[0])) {
    return undefined;
  }
  const currentPrice = priceInfo[0]['current_price'];
  return typeof currentPrice === 'number' ? currentPrice : undefined;
}

export function readShopeeImageUrl(itemRecord: Record<string, unknown>): string | undefined {
  const image = itemRecord['image'];
  if (!isRecord(image)) {
    return undefined;
  }
  const imageList = image['image_url_list'];
  return Array.isArray(imageList) && typeof imageList[0] === 'string' ? imageList[0] : undefined;
}
