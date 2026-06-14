import { NextResponse } from 'next/server';

import {
  createAdminArticle,
  listAdminArticlePicker,
  listAdminArticles,
} from '@/lib/api/articles';
import { createArticleBodySchema } from '@ecommerce-amazon/shared/admin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    if (searchParams.get('picker') === 'true') {
      const items = await listAdminArticlePicker();
      return NextResponse.json({ items });
    }

    const status = searchParams.get('status') ?? undefined;
    const items = await listAdminArticles(status);
    return NextResponse.json({ items });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    const status = message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const body = createArticleBodySchema.parse(await request.json());
    const result = await createAdminArticle(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    const status = message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
