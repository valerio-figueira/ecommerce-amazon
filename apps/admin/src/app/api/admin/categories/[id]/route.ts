import { NextResponse } from 'next/server';

import { deleteAdminCategory, updateAdminCategory } from '@/lib/api/categories';
import { updateCategoryBodySchema } from '@ecommerce-amazon/shared/admin';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body: unknown = await request.json();
    const parsed = updateCategoryBodySchema.parse(body);
    await updateAdminCategory(id, parsed);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    const status = message === 'Unauthorized' ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    await deleteAdminCategory(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    const status =
      message === 'Unauthorized' ? 401 : message.includes('linked') ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
