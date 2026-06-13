import { NextResponse } from 'next/server';

import {
  createAdminCategory,
  listAdminCategories,
  reorderAdminCategories,
} from '@/lib/api/categories';
import {
  createCategoryBodySchema,
  reorderCategoriesBodySchema,
} from '@ecommerce-amazon/shared/admin';

export async function GET() {
  try {
    const items = await listAdminCategories();
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
    const parsed = createCategoryBodySchema.parse(body);
    const result = await createAdminCategory(parsed);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    const status = message === 'Unauthorized' ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = reorderCategoriesBodySchema.parse(body);
    await reorderAdminCategories(parsed);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    const status = message === 'Unauthorized' ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
