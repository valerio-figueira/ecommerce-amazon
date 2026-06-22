import { NextResponse } from 'next/server';

import { getBffErrorMessage, resolveBffStatus } from '@/lib/api/bff-error-status';
import {
  assertInstitutionalSlug,
  getAdminInstitutionalPage,
  updateAdminInstitutionalPage,
} from '@/lib/api/institutional-pages';
import { parseUpdateInstitutionalPageBody } from '@ecommerce-amazon/shared/institutional';

type RouteParams = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { slug: rawSlug } = await params;
    const slug = assertInstitutionalSlug(rawSlug);

    const page =
      slug === 'sobre'
        ? await getAdminInstitutionalPage('sobre')
        : slug === 'contato'
          ? await getAdminInstitutionalPage('contato')
          : await getAdminInstitutionalPage('legal');

    return NextResponse.json(page);
  } catch (error) {
    const message = getBffErrorMessage(error);
    const status = resolveBffStatus(error, message.includes('not found') ? 404 : 500);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { slug: rawSlug } = await params;
    const slug = assertInstitutionalSlug(rawSlug);
    const rawBody: unknown = await request.json();

    switch (slug) {
      case 'sobre': {
        const body = parseUpdateInstitutionalPageBody('sobre', rawBody);
        const page = await updateAdminInstitutionalPage('sobre', body);
        return NextResponse.json(page);
      }
      case 'contato': {
        const body = parseUpdateInstitutionalPageBody('contato', rawBody);
        const page = await updateAdminInstitutionalPage('contato', body);
        return NextResponse.json(page);
      }
      case 'legal': {
        const body = parseUpdateInstitutionalPageBody('legal', rawBody);
        const page = await updateAdminInstitutionalPage('legal', body);
        return NextResponse.json(page);
      }
    }
  } catch (error) {
    const message = getBffErrorMessage(error);
    const status = resolveBffStatus(error, message.includes('not found') ? 404 : 500);
    return NextResponse.json({ error: message }, { status });
  }
}
