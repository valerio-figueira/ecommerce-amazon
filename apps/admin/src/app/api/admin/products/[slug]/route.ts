import { NextResponse } from 'next/server';
import { getBffErrorMessage, resolveBffStatus } from '@/lib/api/bff-error-status';

import { getAdminProduct, updateAdminProduct } from '@/lib/api/admin-products';
import { updateProductBodySchema } from '@ecommerce-amazon/shared/admin';

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const product = await getAdminProduct(slug);
    return NextResponse.json(product);
  } catch (error) {
    const message = getBffErrorMessage(error);
    const status = resolveBffStatus(error, message.includes('not found') ? 404 : 500);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const body: unknown = await request.json();
    const parsed = updateProductBodySchema.parse(body);
    const product = await updateAdminProduct(slug, parsed);
    return NextResponse.json(product);
  } catch (error) {
    const message = getBffErrorMessage(error);
    const status = resolveBffStatus(
      error,
      message.includes('not found') ? 404 : message.includes('already exists') ? 409 : 400,
    );
    return NextResponse.json({ error: message }, { status });
  }
}
