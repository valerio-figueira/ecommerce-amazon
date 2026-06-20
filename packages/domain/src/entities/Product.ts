import { DomainError } from '../errors/DomainError.js';
import { PriceDropped } from '../events/index.js';
import { Marketplace, ProductAvailability } from '../enums/index.js';
import {
  AffiliateLink,
  Price,
  ProductId,
  Slug,
  toProductId,
  toSlug,
} from '../value-objects/index.js';
import type { SpecsNormalized } from '../types/spec-group.js';

export type ProductProps = {
  id: string;
  marketplace: Marketplace;
  externalId: string;
  slug: string;
  titleClean: string;
  titleRaw: string;
  shortDescription?: string | undefined;
  longDescriptionHtml?: string | undefined;
  price: Price;
  strikethroughPrice?: number | undefined;
  affiliateLink: AffiliateLink;
  images: string[];
  specsNormalized: SpecsNormalized;
  editorialScore: number;
  availability: ProductAvailability;
  rating?: number | undefined;
  reviewCount?: number | undefined;
  categoryId?: string | undefined;
  tags: string[];
  metaTitle?: string | undefined;
  metaDescription?: string | undefined;
  canonicalUrl?: string | undefined;
  pros?: string[] | undefined;
  cons?: string[] | undefined;
  visible?: boolean | undefined;
  createdAt: Date;
};

export class Product {
  private readonly _domainEvents: PriceDropped[] = [];

  readonly id: ProductId;
  readonly marketplace: Marketplace;
  readonly externalId: string;
  readonly slug: Slug;
  titleClean: string;
  titleRaw: string;
  shortDescription?: string | undefined;
  longDescriptionHtml?: string | undefined;
  price: Price;
  strikethroughPrice?: number | undefined;
  affiliateLink: AffiliateLink;
  images: string[];
  specsNormalized: SpecsNormalized;
  editorialScore: number;
  availability: ProductAvailability;
  rating?: number | undefined;
  reviewCount?: number | undefined;
  categoryId?: string | undefined;
  tags: string[];
  metaTitle?: string | undefined;
  metaDescription?: string | undefined;
  canonicalUrl?: string | undefined;
  pros?: string[] | undefined;
  cons?: string[] | undefined;
  visible: boolean;
  readonly createdAt: Date;

  private constructor(props: ProductProps) {
    this.id = toProductId(props.id);
    this.marketplace = props.marketplace;
    this.externalId = props.externalId;
    this.slug = toSlug(props.slug);
    this.titleClean = props.titleClean;
    this.titleRaw = props.titleRaw;
    this.shortDescription = props.shortDescription;
    this.longDescriptionHtml = props.longDescriptionHtml;
    this.price = props.price;
    this.strikethroughPrice = props.strikethroughPrice;
    this.affiliateLink = props.affiliateLink;
    this.images = props.images;
    this.specsNormalized = props.specsNormalized;
    this.editorialScore = props.editorialScore;
    this.availability = props.availability;
    this.rating = props.rating;
    this.reviewCount = props.reviewCount;
    this.categoryId = props.categoryId;
    this.tags = props.tags;
    this.metaTitle = props.metaTitle;
    this.metaDescription = props.metaDescription;
    this.canonicalUrl = props.canonicalUrl;
    this.pros = props.pros;
    this.cons = props.cons;
    this.visible = props.visible ?? true;
    this.createdAt = props.createdAt;
  }

  static create(props: ProductProps): Product {
    return new Product(props);
  }

  get shouldShowPrice(): boolean {
    return !this.price.isStale;
  }

  updatePrice(newPrice: Price): void {
    if (newPrice.amount < 0) {
      throw new DomainError('Price cannot be negative', 'INVALID_PRICE');
    }
    const previous = this.price;
    if (previous.amount !== newPrice.amount && newPrice.amount < previous.amount) {
      this._domainEvents.push(new PriceDropped(this.id, previous, newPrice, new Date()));
    }
    this.price = newPrice;
  }

  markPriceStale(): void {
    this.price = this.price.withStale(true);
  }

  pullDomainEvents(): PriceDropped[] {
    const events = [...this._domainEvents];
    this._domainEvents.length = 0;
    return events;
  }
}
