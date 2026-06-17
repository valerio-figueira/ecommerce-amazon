import { NextResponse } from 'next/server';

import { getBffErrorMessage, resolveBffStatus } from '@/lib/api/bff-error-status';
import {
  getAdminInstitutionalPage,
  updateAdminInstitutionalPage,
} from '@/lib/api/institutional-pages';
import { updateInstitutionalPageBodySchema } from '@ecommerce-amazon/shared/about';

type RouteParams = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const page = await getAdminInstitutionalPage(slug);
    return NextResponse.json(page);
  } catch (error) {
    const message = getBffErrorMessage(error);
    const status = resolveBffStatus(error, message.includes('not found') ? 404 : 500);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const body = updateInstitutionalPageBodySchema.parse(await request.json());
    const page = await updateAdminInstitutionalPage(slug, body);
    return NextResponse.json(page);
  } catch (error) {
    const message = getBffErrorMessage(error);
    const status = resolveBffStatus(error, message.includes('not found') ? 404 : 500);
    return NextResponse.json({ error: message }, { status });
  }
}
