import {
  AffiliateLink,
  ConflictError,
  Price,
  ProductAvailability,
  ValidationError,
  parseMarketplace,
  type Marketplace,
  type ProductRepository,
} from '@ecommerce-amazon/domain';
import type { CreateProductBody } from '@ecommerce-amazon/shared/admin';
import { resolveProductShortDescription } from '@ecommerce-amazon/shared/seo';
import { parseMarketplaceProductUrl } from '@ecommerce-amazon/shared/marketplace';

export function parseProductAvailability(value: string): ProductAvailability {
  switch (value) {
    case 'in_stock':
      return ProductAvailability.IN_STOCK;
    case 'out_of_stock':
      return ProductAvailability.OUT_OF_STOCK;
    default:
      return ProductAvailability.UNKNOWN;
  }
}

export function toStoredEditorialScore(uiScore: number): number {
  return Math.round(uiScore * 10);
}

export function toUiEditorialScore(storedScore: number): number {
  return storedScore / 10;
}

export function filterNonEmptyStrings(items: string[]): string[] {
  return items.map((item) => item.trim()).filter((item) => item.length > 0);
}

export type ResolvedProductLink = {
  marketplace: Marketplace;
  externalId: string;
};

export function resolveProductLink(input: CreateProductBody): ResolvedProductLink {
  const marketplace = parseMarketplace(input.marketplace);
  let externalId = input.externalId.trim();

  const parsedFromUrl = parseMarketplaceProductUrl(input.affiliateLink);
  if (parsedFromUrl) {
    if (parsedFromUrl.marketplace !== input.marketplace) {
      throw new ValidationError('Marketplace does not match affiliate link');
    }
    if (!externalId) {
      externalId = parsedFromUrl.externalId;
    } else if (externalId !== parsedFromUrl.externalId) {
      throw new ValidationError('External ID does not match affiliate link');
    }
  }

  if (!externalId) {
    throw new ValidationError('External ID is required');
  }

  return { marketplace, externalId };
}

export async function assertExternalIdAvailable(
  productRepository: ProductRepository,
  marketplace: Marketplace,
  externalId: string,
  excludeProductId?: string,
): Promise<void> {
  const duplicate = await productRepository.findByExternalId(marketplace, externalId);
  if (duplicate && duplicate.id !== excludeProductId) {
    throw new ConflictError('Product already exists for this marketplace and external ID');
  }
}

export function buildPriceFromForm(
  input: Pick<CreateProductBody, 'price' | 'shouldShowPrice'>,
  options: { updatedAt?: Date; preserveUpdatedAtWhenStale?: boolean } = {},
): Price {
  const now = options.updatedAt ?? new Date();
  const priceIsStale = !input.shouldShowPrice;

  return Price.create({
    amount: input.price,
    currency: 'BRL',
    updatedAt: priceIsStale && options.preserveUpdatedAtWhenStale ? now : now,
    isStale: priceIsStale,
  });
}

export function createAffiliateLink(input: CreateProductBody): AffiliateLink {
  return AffiliateLink.create(input.affiliateLink, input.marketplace);
}

export function resolveOptionalTrimmed(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed !== undefined && trimmed.length > 0 ? trimmed : undefined;
}

export function resolveEditorialContentFields(
  input: Pick<
    CreateProductBody,
    'shortDescription' | 'longDescriptionHtml' | 'metaTitle' | 'metaDescription' | 'pros'
  >,
  filteredPros: string[],
): {
  shortDescription?: string | undefined;
  longDescriptionHtml?: string | undefined;
  metaTitle?: string | undefined;
  metaDescription?: string | undefined;
} {
  return {
    shortDescription: resolveProductShortDescription(input.shortDescription, filteredPros),
    longDescriptionHtml: resolveOptionalTrimmed(input.longDescriptionHtml),
    metaTitle: resolveOptionalTrimmed(input.metaTitle),
    metaDescription: resolveOptionalTrimmed(input.metaDescription),
  };
}
