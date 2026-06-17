import { NextResponse } from 'next/server';
import { getBffErrorMessage, getBffErrorStatus } from '@/lib/api/bff-error-status';

import {
  deleteAdminArticle,
  getAdminArticle,
  updateAdminArticle,
} from '@/lib/api/articles';
import { updateArticleBodySchema } from '@ecommerce-amazon/shared/admin';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const article = await getAdminArticle(id);
    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }
    return NextResponse.json(article);
  } catch (error) {
    const status = getBffErrorStatus(error);
    const message = getBffErrorMessage(error);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = updateArticleBodySchema.parse(await request.json());
    await updateAdminArticle(id, body);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const status = getBffErrorStatus(error);
    const message = getBffErrorMessage(error);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    await deleteAdminArticle(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const status = getBffErrorStatus(error);
    const message = getBffErrorMessage(error);
    return NextResponse.json({ error: message }, { status });
  }
}
