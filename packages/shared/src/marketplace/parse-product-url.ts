import type { MarketplaceValue } from './constants.js';

export type ParsedProductUrl = {
  marketplace: MarketplaceValue;
  externalId: string;
};

function normalizeMercadoLivreId(raw: string): string {
  const digits = raw.replace(/^MLB-?/i, '');
  return `MLB${digits}`;
}

function parseAmazonUrl(url: URL): ParsedProductUrl | null {
  const dpMatch = url.pathname.match(/\/(?:dp|gp\/product|gp\/aw\/d)\/([A-Z0-9]{10})/i);
  if (dpMatch?.[1]) {
    return { marketplace: 'amazon_br', externalId: dpMatch[1].toUpperCase() };
  }
  return null;
}

function parseShopeeUrl(url: URL): ParsedProductUrl | null {
  const productMatch = url.pathname.match(/\/product\/(\d+)\/(\d+)/);
  if (productMatch?.[1] && productMatch[2]) {
    return { marketplace: 'shopee_br', externalId: `${productMatch[1]}.${productMatch[2]}` };
  }

  const shortMatch = url.pathname.match(/-i\.(\d+)\.(\d+)/);
  if (shortMatch?.[1] && shortMatch[2]) {
    return { marketplace: 'shopee_br', externalId: `${shortMatch[1]}.${shortMatch[2]}` };
  }

  return null;
}

function parseMercadoLivreUrl(url: URL): ParsedProductUrl | null {
  const pathMatch = url.pathname.match(/(MLB-?\d+)/i);
  if (pathMatch?.[1]) {
    return { marketplace: 'mercadolivre_br', externalId: normalizeMercadoLivreId(pathMatch[1]) };
  }

  const queryMatch = url.search.match(/(MLB-?\d+)/i);
  if (queryMatch?.[1]) {
    return { marketplace: 'mercadolivre_br', externalId: normalizeMercadoLivreId(queryMatch[1]) };
  }

  return null;
}

export function parseMarketplaceProductUrl(rawUrl: string): ParsedProductUrl | null {
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed);
    const host = url.hostname.toLowerCase();

    if (host.includes('amazon.com.br') || host.includes('amazon.com')) {
      return parseAmazonUrl(url);
    }
    if (host.includes('shopee.com.br') || host.includes('shopee.com')) {
      return parseShopeeUrl(url);
    }
    if (host.includes('mercadolivre.com.br') || host.includes('mercadolivre.com')) {
      return parseMercadoLivreUrl(url);
    }

    return null;
  } catch {
    return null;
  }
}
