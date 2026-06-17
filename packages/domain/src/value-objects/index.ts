import { DomainError } from '../errors/DomainError.js';

export type ProductId = string & { readonly __brand: 'ProductId' };
export type AutoLinkId = string & { readonly __brand: 'AutoLinkId' };
export type Slug = string & { readonly __brand: 'Slug' };

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isProductId(value: string): value is ProductId {
  return UUID_REGEX.test(value);
}

export function toProductId(id: string): ProductId {
  if (!isProductId(id)) {
    throw new DomainError('Invalid product id', 'INVALID_PRODUCT_ID');
  }
  return id;
}

export function isAutoLinkId(value: string): value is AutoLinkId {
  return UUID_REGEX.test(value);
}

export function toAutoLinkId(id: string): AutoLinkId {
  if (!isAutoLinkId(id)) {
    throw new DomainError('Invalid auto link id', 'INVALID_AUTO_LINK_ID');
  }
  return id;
}

export function isSlug(value: string): value is Slug {
  return SLUG_REGEX.test(value.trim().toLowerCase());
}

export function toSlug(value: string): Slug {
  const normalized = value.trim().toLowerCase();
  if (!isSlug(normalized)) {
    throw new DomainError('Invalid slug format', 'INVALID_SLUG');
  }
  return normalized;
}

export type Currency = 'BRL' | 'USD';

export class Price {
  private constructor(
    readonly amount: number,
    readonly currency: Currency,
    readonly updatedAt: Date,
    readonly isStale: boolean,
  ) {}

  static create(props: {
    amount: number;
    currency: Currency;
    updatedAt: Date;
    isStale?: boolean;
  }): Price {
    if (props.amount < 0) {
      throw new DomainError('Price cannot be negative', 'INVALID_PRICE');
    }
    return new Price(
      props.amount,
      props.currency,
      props.updatedAt,
      props.isStale ?? false,
    );
  }

  droppedByPercent(other: Price): number | null {
    if (this.currency !== other.currency || other.amount === 0) return null;
    return ((other.amount - this.amount) / other.amount) * 100;
  }

  meetsTarget(target: number): boolean {
    return !this.isStale && this.amount <= target;
  }

  withStale(isStale: boolean): Price {
    return Price.create({
      amount: this.amount,
      currency: this.currency,
      updatedAt: this.updatedAt,
      isStale,
    });
  }
}

export class Email {
  private constructor(readonly value: string) {}

  static create(raw: string): Email {
    const normalized = raw.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      throw new DomainError('Invalid email address', 'INVALID_EMAIL');
    }
    return new Email(normalized);
  }
}

export type {
  BlockVisibilitySetting,
  SiteSettings,
  SiteSettingsCms,
  SiteSettingsFeatures,
  SiteSettingsSeo,
} from './SiteSettings.js';

export class AffiliateLink {
  private constructor(
    readonly url: string,
    readonly marketplace: string,
  ) {}

  static create(url: string, marketplace: string): AffiliateLink {
    if (!url.startsWith('https://')) {
      throw new DomainError('Affiliate link must use HTTPS', 'INVALID_AFFILIATE_LINK');
    }
    return new AffiliateLink(url, marketplace);
  }
}
