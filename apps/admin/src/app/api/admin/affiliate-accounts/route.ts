import { NextResponse } from 'next/server';

import { getBffErrorMessage, getBffErrorStatus } from '@/lib/api/bff-error-status';
import { listAffiliateAccounts } from '@/lib/api/affiliate-accounts';

export async function GET() {
  try {
    const items = await listAffiliateAccounts();
    return NextResponse.json({ items });
  } catch (error) {
    const status = getBffErrorStatus(error);
    const message = getBffErrorMessage(error);
    return NextResponse.json({ error: message }, { status });
  }
}
