import { NextResponse } from 'next/server';

import { getBffErrorMessage, getBffErrorStatus } from '@/lib/api/bff-error-status';
import { listMarketplaceCredentials } from '@/lib/api/marketplace-credentials';

export async function GET() {
  try {
    const items = await listMarketplaceCredentials();
    return NextResponse.json({ items });
  } catch (error) {
    const status = getBffErrorStatus(error);
    const message = getBffErrorMessage(error);
    return NextResponse.json({ error: message }, { status });
  }
}
