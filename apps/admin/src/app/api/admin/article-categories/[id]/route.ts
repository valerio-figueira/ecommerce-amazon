import { NextResponse } from 'next/server';
import { getBffErrorMessage, resolveBffStatus } from '@/lib/api/bff-error-status';

import { deleteArticleCategory, updateArticleCategory } from '@/lib/api/article-categories';
import {
  articleCategoryIdParamsSchema,
  updateArticleCategoryBodySchema,
} from '@ecommerce-amazon/shared/admin';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = articleCategoryIdParamsSchema.parse(await context.params);
    const body: unknown = await request.json();
    const parsed = updateArticleCategoryBodySchema.parse(body);
    await updateArticleCategory(id, parsed);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const status = resolveBffStatus(error, 400);
    const message = getBffErrorMessage(error);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = articleCategoryIdParamsSchema.parse(await context.params);
    await deleteArticleCategory(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const status = resolveBffStatus(error, 400);
    const message = getBffErrorMessage(error);
    return NextResponse.json({ error: message }, { status });
  }
}
