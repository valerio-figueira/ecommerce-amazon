export const PRICE_STALE_HOURS = 24;

export class PriceComplianceService {
  isStale(priceUpdatedAt: Date, now: Date = new Date()): boolean {
    const hoursElapsed =
      (now.getTime() - priceUpdatedAt.getTime()) / (1000 * 60 * 60);
    return hoursElapsed > PRICE_STALE_HOURS;
  }

  applyStaleFlag(priceUpdatedAt: Date): boolean {
    return this.isStale(priceUpdatedAt);
  }
}

export class TitleHygieneService {
  private static readonly NOISE_PATTERNS = [
    /\s*[-|–]\s*Frete\s*GR[ÁA]TIS\s*/gi,
    /\s*OFERTA!?\s*/gi,
    /\s*\[\d{4}\s*Novo\]\s*/gi,
    /[\u{1F300}-\u{1FAFF}]{3,}/gu,
  ];

  clean(rawTitle: string, maxLength = 120): string {
    let title = rawTitle.trim();
    for (const pattern of TitleHygieneService.NOISE_PATTERNS) {
      title = title.replace(pattern, ' ');
    }
    title = title.replace(/\s+/g, ' ').trim();
    if (title.length > maxLength) {
      title = `${title.slice(0, maxLength - 1).trim()}…`;
    }
    return title;
  }
}

export class ComparisonSpecMatcher {
  getComparableKeys(products: { specsNormalized: { properties: { key: string }[] }[] }[]): string[] {
    if (products.length === 0) return [];

    const flattenKeys = (groups: { properties: { key: string }[] }[]): Set<string> => {
      const keys = new Set<string>();
      for (const group of groups) {
        for (const property of group.properties) {
          if (property.key.trim().length > 0) {
            keys.add(property.key.trim());
          }
        }
      }
      return keys;
    };

    const keys = flattenKeys(products[0]?.specsNormalized ?? []);
    for (const product of products.slice(1)) {
      const productKeys = flattenKeys(product.specsNormalized);
      for (const key of keys) {
        if (!productKeys.has(key)) {
          keys.delete(key);
        }
      }
    }
    return [...keys].sort();
  }
}

export type RefreshCriteria = {
  hotTrafficHours?: number;
  limit?: number;
  onlyStale?: boolean;
};

export {
  ADMIN_AVATAR_KEY_REGEX,
  extractManagedKeyFromUrl,
  isManagedAvatarKey,
} from './avatar-storage.js';
