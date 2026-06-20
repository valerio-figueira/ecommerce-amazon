import { createHash, createHmac } from 'node:crypto';

import type { AmazonStaticCredentials } from '@ecommerce-amazon/domain';

import { parseErrorMessage, parseGetItemsResponse } from './amazon-pa-api-parsers.js';

const DEFAULT_HOST = 'webservices.amazon.com.br';
const DEFAULT_REGION = 'us-east-1';
const SERVICE = 'ProductAdvertisingAPI';
const TARGET_GET_ITEMS = 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems';

export type AmazonPaApiGetItemsParams = {
  itemIds: string[];
  partnerTag: string;
  marketplace?: string;
};

export type AmazonPaApiItemSummary = {
  asin: string;
  title?: string;
  priceAmount?: number;
  priceCurrency?: string;
  imageUrl?: string;
  availability?: string;
};

export type AmazonPaApiResponse = {
  httpStatus: number;
  ok: boolean;
  message: string;
  items: AmazonPaApiItemSummary[];
  rateLimitHint?: string;
};

function sha256(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

function hmacSha256(key: Buffer | string, value: string): Buffer {
  return createHmac('sha256', key).update(value, 'utf8').digest();
}

function toAmzDate(date: Date): { amzDate: string; dateStamp: string } {
  const iso = date.toISOString().replace(/[:-]|\.\d{3}/g, '');
  return {
    amzDate: iso,
    dateStamp: iso.slice(0, 8),
  };
}

function signRequest(
  credentials: AmazonStaticCredentials,
  host: string,
  region: string,
  target: string,
  payload: string,
): Record<string, string> {
  const { amzDate, dateStamp } = toAmzDate(new Date());
  const canonicalUri = '/paapi5/getitems';
  const canonicalQueryString = '';
  const payloadHash = sha256(payload);

  const canonicalHeaders =
    `content-encoding:amz-1.0\n` +
    `content-type:application/json; charset=utf-8\n` +
    `host:${host}\n` +
    `x-amz-date:${amzDate}\n` +
    `x-amz-target:${target}\n`;

  const signedHeaders = 'content-encoding;content-type;host;x-amz-date;x-amz-target';
  const canonicalRequest = [
    'POST',
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n');

  const credentialScope = `${dateStamp}/${region}/${SERVICE}/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    sha256(canonicalRequest),
  ].join('\n');

  const kDate = hmacSha256(`AWS4${credentials.secretAccessKey}`, dateStamp);
  const kRegion = hmacSha256(kDate, region);
  const kService = hmacSha256(kRegion, SERVICE);
  const kSigning = hmacSha256(kService, 'aws4_request');
  const signature = hmacSha256(kSigning, stringToSign).toString('hex');

  const authorization =
    `AWS4-HMAC-SHA256 Credential=${credentials.accessKeyId}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return {
    'content-encoding': 'amz-1.0',
    'content-type': 'application/json; charset=utf-8',
    host,
    'x-amz-date': amzDate,
    'x-amz-target': target,
    authorization,
  };
}

export async function amazonPaApiGetItems(
  credentials: AmazonStaticCredentials,
  params: AmazonPaApiGetItemsParams,
): Promise<AmazonPaApiResponse> {
  const host = credentials.host?.trim() || DEFAULT_HOST;
  const region = credentials.region?.trim() || DEFAULT_REGION;
  const marketplace = params.marketplace ?? 'www.amazon.com.br';

  const payload = JSON.stringify({
    ItemIds: params.itemIds,
    PartnerTag: params.partnerTag,
    PartnerType: 'Associates',
    Marketplace: marketplace,
    Resources: [
      'Images.Primary.Large',
      'ItemInfo.Title',
      'Offers.Listings.Price',
      'Offers.Listings.Availability.Type',
    ],
  });

  const headers = signRequest(credentials, host, region, TARGET_GET_ITEMS, payload);
  const response = await fetch(`https://${host}/paapi5/getitems`, {
    method: 'POST',
    headers,
    body: payload,
  });

  const text = await response.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = null;
  }

  const rateLimitHint = response.headers.get('x-amzn-ratelimit-limit') ?? undefined;

  if (!response.ok) {
    const failure: AmazonPaApiResponse = {
      httpStatus: response.status,
      ok: false,
      message: parseErrorMessage(body, `HTTP ${response.status}: ${text.slice(0, 200)}`),
      items: [],
    };
    if (rateLimitHint) failure.rateLimitHint = rateLimitHint;
    return failure;
  }

  const items = parseGetItemsResponse(body);
  const success: AmazonPaApiResponse = {
    httpStatus: response.status,
    ok: true,
    message: items.length > 0 ? 'Conectado' : 'Resposta OK sem itens',
    items,
  };
  if (rateLimitHint) success.rateLimitHint = rateLimitHint;
  return success;
}

export async function amazonPaApiTestConnectivity(
  credentials: AmazonStaticCredentials,
  affiliateTag?: string,
): Promise<AmazonPaApiResponse> {
  if (!affiliateTag?.trim()) {
    return {
      httpStatus: 400,
      ok: false,
      message: 'Configure a Associate Tag em Contas de afiliado antes de testar a Amazon PA-API',
      items: [],
    };
  }

  return amazonPaApiGetItems(credentials, {
    itemIds: ['B08N5WRWNW'],
    partnerTag: affiliateTag.trim(),
  });
}
