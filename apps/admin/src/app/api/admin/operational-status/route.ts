import { NextResponse } from 'next/server';

import { getBffErrorMessage, getBffErrorStatus } from '@/lib/api/bff-error-status';
import { getOperationalStatus } from '@/lib/api/operational-status';

export async function GET() {
  try {
    const result = await getOperationalStatus();
    return NextResponse.json(result);
  } catch (error) {
    const status = getBffErrorStatus(error);
    const message = getBffErrorMessage(error);
    return NextResponse.json({ error: message }, { status });
  }
}
