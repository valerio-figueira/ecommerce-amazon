import type { AmazonPaApiItemSummary } from './amazon-pa-api.client.js';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readRecordString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return '';
}

function parseNestedRecord(value: unknown): Record<string, unknown> | null {
  return isRecord(value) ? value : null;
}

export function parseGetItemsResponse(body: unknown): AmazonPaApiItemSummary[] {
  const record = parseNestedRecord(body);
  if (!record) return [];

  const itemsResult = parseNestedRecord(record['ItemsResult']);
  if (!itemsResult) return [];

  const items = itemsResult['Items'];
  if (!Array.isArray(items)) return [];

  const summaries: AmazonPaApiItemSummary[] = [];
  for (const item of items) {
    const itemRecord = parseNestedRecord(item);
    if (!itemRecord) continue;

    const asin = readRecordString(itemRecord, 'ASIN');
    if (!asin) continue;

    const summary: AmazonPaApiItemSummary = { asin };

    const itemInfo = parseNestedRecord(itemRecord['ItemInfo']);
    if (itemInfo) {
      const titleInfo = parseNestedRecord(itemInfo['Title']);
      if (titleInfo) {
        const title = readRecordString(titleInfo, 'DisplayValue');
        if (title) summary.title = title;
      }
    }

    const images = parseNestedRecord(itemRecord['Images']);
    if (images) {
      const primary = parseNestedRecord(images['Primary']);
      if (primary) {
        const large = parseNestedRecord(primary['Large']);
        if (large) {
          const imageUrl = readRecordString(large, 'URL');
          if (imageUrl) summary.imageUrl = imageUrl;
        }
      }
    }

    const offers = parseNestedRecord(itemRecord['Offers']);
    if (offers) {
      const listings = offers['Listings'];
      if (Array.isArray(listings)) {
        const listing = parseNestedRecord(listings[0]);
        if (listing) {
          const availability = parseNestedRecord(listing['Availability']);
          if (availability) {
            const availabilityType = readRecordString(availability, 'Type');
            if (availabilityType) summary.availability = availabilityType;
          }

          const price = parseNestedRecord(listing['Price']);
          if (price) {
            const amountRaw = price['Amount'];
            const amount = typeof amountRaw === 'number' ? amountRaw : Number(amountRaw);
            if (Number.isFinite(amount)) summary.priceAmount = amount;

            const currency = readRecordString(price, 'Currency');
            if (currency) summary.priceCurrency = currency;
          }
        }
      }
    }

    summaries.push(summary);
  }

  return summaries;
}

export function parseErrorMessage(body: unknown, fallback: string): string {
  const record = parseNestedRecord(body);
  if (!record) return fallback;

  const errors = record['Errors'];
  if (!Array.isArray(errors) || errors.length === 0) return fallback;

  const first = parseNestedRecord(errors[0]);
  if (!first) return fallback;

  const code = readRecordString(first, 'Code');
  const message = readRecordString(first, 'Message') || fallback;
  return code ? `${code}: ${message}` : message;
}
