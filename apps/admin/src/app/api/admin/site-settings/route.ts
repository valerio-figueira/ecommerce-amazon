import { NextResponse } from 'next/server';

import {
  getBffErrorMessage,
  getBffErrorStatus,
  resolveBffStatus,
} from '@/lib/api/bff-error-status';
import { getSiteSettings, updateSiteSettings } from '@/lib/api/site-settings';
import { updateSiteSettingsBodySchema } from '@ecommerce-amazon/shared/admin';

export async function GET() {
  try {
    const result = await getSiteSettings();
    return NextResponse.json(result);
  } catch (error) {
    const status = getBffErrorStatus(error);
    const message = getBffErrorMessage(error);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = updateSiteSettingsBodySchema.parse(body);
    const result = await updateSiteSettings(parsed);
    return NextResponse.json(result);
  } catch (error) {
    const status = resolveBffStatus(error, 400);
    const message = getBffErrorMessage(error);
    return NextResponse.json({ error: message }, { status });
  }
}
