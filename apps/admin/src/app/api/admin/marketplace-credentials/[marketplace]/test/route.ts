import { NextResponse } from 'next/server';

import { getBffErrorMessage, resolveBffStatus } from '@/lib/api/bff-error-status';
import { testMarketplaceConnectivity } from '@/lib/api/marketplace-credentials';
import {
  marketplaceCredentialMarketplaceSchema,
  marketplaceConnectivityTestBodySchema,
  saveAmazonCredentialsBodySchema,
  saveShopeeCredentialsBodySchema,
} from '@ecommerce-amazon/shared/admin';

type RouteParams = { params: Promise<{ marketplace: string }> };

export async function POST(request: Request, context: RouteParams) {
  try {
    const { marketplace: rawMarketplace } = await context.params;
    const marketplace = marketplaceCredentialMarketplaceSchema.parse(rawMarketplace);
    if (marketplace === 'mercadolivre_br') {
      return NextResponse.json(
        { error: 'Mercado Livre OAuth será disponibilizado na Fase 3' },
        { status: 400 },
      );
    }

    const body: unknown = await request.json().catch(() => ({}));
    const parsedBody = marketplaceConnectivityTestBodySchema.parse(body);
    const credentials =
      parsedBody?.credentials && marketplace === 'amazon_br'
        ? saveAmazonCredentialsBodySchema.parse(parsedBody.credentials)
        : parsedBody?.credentials && marketplace === 'shopee_br'
          ? saveShopeeCredentialsBodySchema.parse(parsedBody.credentials)
          : undefined;

    const result = await testMarketplaceConnectivity(marketplace, credentials);
    return NextResponse.json(result);
  } catch (error) {
    const status = resolveBffStatus(error, 400);
    const message = getBffErrorMessage(error);
    return NextResponse.json({ error: message }, { status });
  }
}
