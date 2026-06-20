import { NextResponse } from 'next/server';

import {
  getBffErrorMessage,
  getBffErrorStatus,
  resolveBffStatus,
} from '@/lib/api/bff-error-status';
import {
  deleteMarketplaceCredentials,
  saveMarketplaceCredentials,
} from '@/lib/api/marketplace-credentials';
import {
  marketplaceCredentialMarketplaceSchema,
  saveAmazonCredentialsBodySchema,
  saveShopeeCredentialsBodySchema,
} from '@ecommerce-amazon/shared/admin';

type RouteParams = { params: Promise<{ marketplace: string }> };

export async function PUT(request: Request, context: RouteParams) {
  try {
    const { marketplace: rawMarketplace } = await context.params;
    const marketplace = marketplaceCredentialMarketplaceSchema.parse(rawMarketplace);
    if (marketplace === 'mercadolivre_br') {
      return NextResponse.json(
        { error: 'Mercado Livre OAuth será disponibilizado na Fase 3' },
        { status: 400 },
      );
    }

    const body: unknown = await request.json();
    const credentials =
      marketplace === 'amazon_br'
        ? saveAmazonCredentialsBodySchema.parse(body)
        : saveShopeeCredentialsBodySchema.parse(body);

    const result = await saveMarketplaceCredentials(marketplace, credentials);
    return NextResponse.json(result);
  } catch (error) {
    const status = resolveBffStatus(error, 400);
    const message = getBffErrorMessage(error);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request: Request, context: RouteParams) {
  try {
    const { marketplace: rawMarketplace } = await context.params;
    const marketplace = marketplaceCredentialMarketplaceSchema.parse(rawMarketplace);
    if (marketplace === 'mercadolivre_br') {
      return NextResponse.json(
        { error: 'Mercado Livre OAuth será disponibilizado na Fase 3' },
        { status: 400 },
      );
    }

    const result = await deleteMarketplaceCredentials(marketplace);
    return NextResponse.json(result);
  } catch (error) {
    const status = getBffErrorStatus(error);
    const message = getBffErrorMessage(error);
    return NextResponse.json({ error: message }, { status });
  }
}
