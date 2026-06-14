import { NextResponse } from 'next/server';

import {
  createArticleCategory,
  listArticleCategories,
} from '@/lib/api/article-categories';
import { createArticleCategoryBodySchema } from '@ecommerce-amazon/shared/admin';

export async function GET() {
  try {
    const items = await listArticleCategories();
    return NextResponse.json({ items });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    const status = message === 'Unauthorized' ? 401 : 500;
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
    const message = error instanceof Error ? error.message : 'Request failed';
    const status = message === 'Unauthorized' ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
