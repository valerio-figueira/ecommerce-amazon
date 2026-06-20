import type { BrandConfig } from '../config/brand.js';
import { formatWebHomeTitle } from '../config/brand.js';

const DEFAULT_DESCRIPTION = 'Descubra ofertas selecionadas com histórico de preços e alertas.';

export type SiteMetadata = {
  metadataBase?: URL;
  title?: string | { default: string; template: string };
  description?: string;
  openGraph?: {
    type?: string;
    locale?: string;
    siteName?: string;
    url?: string;
    title?: string;
    description?: string;
    images?: Array<{ url: string }>;
  };
  alternates?: {
    canonical?: string;
  };
  robots?: {
    index?: boolean;
    follow?: boolean;
  };
};

export function buildRootMetadata(brand: BrandConfig): SiteMetadata {
  return {
    metadataBase: new URL(brand.url),
    title: {
      default: formatWebHomeTitle(brand),
      template: `%s | ${brand.name}`,
    },
    description: DEFAULT_DESCRIPTION,
    openGraph: {
      type: 'website',
      locale: 'pt_BR',
      siteName: brand.name,
      url: brand.url,
    },
    alternates: { canonical: brand.url },
  };
}

export function buildPageCanonical(path: string, brand: BrandConfig): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${brand.url}${normalizedPath}`;
}

export type NotFoundMetadata = {
  title: string;
  robots: { index: false; follow: false };
};

export function buildNotFoundMetadata(title: string): NotFoundMetadata {
  return {
    title,
    robots: { index: false, follow: false },
  };
}

export type FacetedListingMetadataInput = {
  title: string;
  description: string;
  canonicalPath: string;
  brand: BrandConfig;
  page?: number;
  hasFacetParams?: boolean;
  openGraph?: SiteMetadata['openGraph'];
};

export function buildFacetedListingMetadata(input: FacetedListingMetadataInput): SiteMetadata {
  const page = input.page ?? 1;
  const shouldNoindex = page > 1 || Boolean(input.hasFacetParams);

  return {
    title: input.title,
    description: input.description,
    alternates: {
      canonical: buildPageCanonical(input.canonicalPath, input.brand),
    },
    ...(input.openGraph ? { openGraph: input.openGraph } : {}),
    ...(shouldNoindex && {
      robots: { index: false, follow: true },
    }),
  };
}

export function hasCategoryFacetParams(
  searchParams: Record<string, string | string[] | undefined>,
): boolean {
  const facetKeys = ['sort', 'filter_brand', 'filter', 'q'];
  return facetKeys.some((key) => {
    const value = searchParams[key];
    if (value === undefined) return false;
    if (Array.isArray(value)) return value.length > 0;
    return value.length > 0;
  });
}

export function hasArticleFacetParams(
  searchParams: Record<string, string | string[] | undefined>,
): boolean {
  const facetKeys = ['q', 'categoria', 'category'];
  return facetKeys.some((key) => {
    const value = searchParams[key];
    if (value === undefined) return false;
    if (Array.isArray(value)) return value.length > 0;
    return value.length > 0;
  });
}

export function parseListingPage(
  searchParams: Record<string, string | string[] | undefined>,
): number {
  const raw = searchParams['page'];
  const pageStr = Array.isArray(raw) ? raw[0] : raw;
  const page = Number(pageStr ?? '1');
  return Number.isFinite(page) && page > 0 ? page : 1;
}
