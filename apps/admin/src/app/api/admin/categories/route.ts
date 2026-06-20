import { NextResponse } from 'next/server';
import {
  getBffErrorMessage,
  getBffErrorStatus,
  resolveBffStatus,
} from '@/lib/api/bff-error-status';

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
    const status = getBffErrorStatus(error);
    const message = getBffErrorMessage(error);
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
    const status = resolveBffStatus(error, 400);
    const message = getBffErrorMessage(error);
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
    const status = resolveBffStatus(error, 400);
    const message = getBffErrorMessage(error);
    return NextResponse.json({ error: message }, { status });
  }
}
