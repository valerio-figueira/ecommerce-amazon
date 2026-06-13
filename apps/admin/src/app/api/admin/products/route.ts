import { NextResponse } from 'next/server';

import { createAdminProduct, listAdminProducts } from '@/lib/api/admin-products';
import { createProductBodySchema } from '@ecommerce-amazon/shared/admin';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const page = url.searchParams.get('page');
    const pageSize = url.searchParams.get('pageSize');
    const marketplace = url.searchParams.get('marketplace');

    const products = await listAdminProducts({
      ...(page !== null ? { page: Number(page) } : {}),
      ...(pageSize !== null ? { pageSize: Number(pageSize) } : {}),
      ...(marketplace !== null ? { marketplace } : {}),
    });
    return NextResponse.json(products);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    const status = message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = createProductBodySchema.parse(body);
    const product = await createAdminProduct(parsed);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    const status =
      message === 'Unauthorized' ? 401 : message.includes('already exists') ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
