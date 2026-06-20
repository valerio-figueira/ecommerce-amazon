import { NextResponse } from 'next/server';
import {
  getBffErrorMessage,
  getBffErrorStatus,
  resolveBffStatus,
} from '@/lib/api/bff-error-status';

import { createArticleCategory, listArticleCategories } from '@/lib/api/article-categories';
import { createArticleCategoryBodySchema } from '@ecommerce-amazon/shared/admin';

export async function GET() {
  try {
    const items = await listArticleCategories();
    return NextResponse.json({ items });
  } catch (error) {
    const status = getBffErrorStatus(error);
    const message = getBffErrorMessage(error);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = createArticleCategoryBodySchema.parse(body);
    const result = await createArticleCategory(parsed);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const status = resolveBffStatus(error, 400);
    const message = getBffErrorMessage(error);
    return NextResponse.json({ error: message }, { status });
  }
}
