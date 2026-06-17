import { createHmac } from 'node:crypto';

import type { ShopeeStaticCredentials } from '@ecommerce-amazon/domain';

const DEFAULT_BASE_URL = 'https://partner.shopeemobile.com';

export type ShopeeApiResponse = {
  httpStatus: number;
  ok: boolean;
  message: string;
  rateLimitHint?: string;
};

function buildSign(
  partnerId: string,
  partnerKey: string,
  path: string,
  timestamp: number,
  accessToken = '',
  shopId = '',
): string {
  const baseString = `${partnerId}${path}${timestamp}${accessToken}${shopId}`;
  return createHmac('sha256', partnerKey).update(baseString).digest('hex');
}

export async function shopeeTestConnectivity(
  credentials: ShopeeStaticCredentials,
  baseUrl = DEFAULT_BASE_URL,
): Promise<ShopeeApiResponse> {
  const path = '/api/v2/public/get_shopee_openapi_path';
  const timestamp = Math.floor(Date.now() / 1000);
  const sign = buildSign(credentials.partnerId, credentials.partnerKey, path, timestamp);
  const url = new URL(`${baseUrl}${path}`);
  url.searchParams.set('partner_id', credentials.partnerId);
  url.searchParams.set('timestamp', String(timestamp));
  url.searchParams.set('sign', sign);

  const response = await fetch(url.toString(), { method: 'GET' });
  const text = await response.text();

  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = null;
  }

  if (!response.ok) {
    return {
      httpStatus: response.status,
      ok: false,
      message: `HTTP ${response.status}: ${text.slice(0, 200)}`,
    };
  }

  if (body && typeof body === 'object') {
    const record = body as Record<string, unknown>;
    const error = record['error'];
    if (typeof error === 'string' && error.length > 0) {
      return {
        httpStatus: response.status,
        ok: false,
        message: `Shopee API error: ${error}`,
      };
    }
  }

  return {
    httpStatus: response.status,
    ok: true,
    message: 'Conectado',
  };
}

export type ShopeeItemDetail = {
  itemId: string;
  title: string;
  priceAmount?: number;
  imageUrl?: string;
};

function parseShopeeItemId(externalId: string): { itemId: number; shopId?: number } | null {
  const dotMatch = externalId.match(/^(\d+)\.(\d+)$/);
  if (dotMatch) {
    return { shopId: Number(dotMatch[1]), itemId: Number(dotMatch[2]) };
  }

  const compact = externalId.replace(/[^\d.]/g, '');
  const parts = compact.split('.').filter(Boolean);
  if (parts.length === 2) {
    return { shopId: Number(parts[0]), itemId: Number(parts[1]) };
  }

  const digits = externalId.replace(/\D/g, '');
  if (digits.length > 0) {
    return { itemId: Number(digits) };
  }

  return null;
}

export async function shopeeGetItemBaseInfo(
  credentials: ShopeeStaticCredentials,
  externalId: string,
  baseUrl = DEFAULT_BASE_URL,
): Promise<{ response: ShopeeApiResponse; item?: ShopeeItemDetail }> {
  const parsed = parseShopeeItemId(externalId);
  if (!parsed) {
    return {
      response: {
        httpStatus: 400,
        ok: false,
        message: `Invalid Shopee external id: ${externalId}`,
      },
    };
  }

  const path = '/api/v2/product/get_item_base_info';
  const timestamp = Math.floor(Date.now() / 1000);
  const sign = buildSign(credentials.partnerId, credentials.partnerKey, path, timestamp);
  const url = new URL(`${baseUrl}${path}`);
  url.searchParams.set('partner_id', credentials.partnerId);
  url.searchParams.set('timestamp', String(timestamp));
  url.searchParams.set('sign', sign);
  url.searchParams.set('item_id_list', String(parsed.itemId));

  const response = await fetch(url.toString(), { method: 'GET' });
  const text = await response.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = null;
  }

  if (!response.ok) {
    return {
      response: {
        httpStatus: response.status,
        ok: false,
        message: `HTTP ${response.status}: ${text.slice(0, 200)}`,
      },
    };
  }

  if (!body || typeof body !== 'object') {
    return {
      response: {
        httpStatus: response.status,
        ok: false,
        message: 'Invalid Shopee response',
      },
    };
  }

  const record = body as Record<string, unknown>;
  const error = record['error'];
  if (typeof error === 'string' && error.length > 0) {
    return {
      response: {
        httpStatus: response.status,
        ok: false,
        message: `Shopee API error: ${error}`,
      },
    };
  }

  const responseBlock = record['response'];
  if (!responseBlock || typeof responseBlock !== 'object') {
    return {
      response: {
        httpStatus: response.status,
        ok: true,
        message: 'Resposta OK sem itens',
      },
    };
  }

  const itemList = (responseBlock as Record<string, unknown>)['item_list'];
  if (!Array.isArray(itemList) || itemList.length === 0) {
    return {
      response: {
        httpStatus: response.status,
        ok: true,
        message: 'Resposta OK sem itens',
      },
    };
  }

  const rawItem = itemList[0];
  if (!rawItem || typeof rawItem !== 'object') {
    return {
      response: {
        httpStatus: response.status,
        ok: true,
        message: 'Resposta OK sem itens',
      },
    };
  }

  const itemRecord = rawItem as Record<string, unknown>;
  const priceInfo = itemRecord['price_info'];
  let priceAmount: number | undefined;
  if (Array.isArray(priceInfo) && priceInfo[0] && typeof priceInfo[0] === 'object') {
    const currentPrice = (priceInfo[0] as Record<string, unknown>)['current_price'];
    if (typeof currentPrice === 'number') {
      priceAmount = currentPrice;
    }
  }

  const image = itemRecord['image'];
  let imageUrl: string | undefined;
  if (image && typeof image === 'object') {
    const imageList = (image as Record<string, unknown>)['image_url_list'];
    if (Array.isArray(imageList) && typeof imageList[0] === 'string') {
      imageUrl = imageList[0];
    }
  }

  return {
    response: {
      httpStatus: response.status,
      ok: true,
      message: 'Conectado',
    },
    item: {
      itemId: String(itemRecord['item_id'] ?? parsed.itemId),
      title: String(itemRecord['item_name'] ?? `Shopee Product ${externalId}`),
      ...(typeof priceAmount === 'number' ? { priceAmount } : {}),
      ...(imageUrl ? { imageUrl } : {}),
    },
  };
}
