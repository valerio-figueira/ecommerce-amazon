import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { z } from 'zod';

const revalidateBodySchema = z.object({
  paths: z.array(z.string().min(1)).optional(),
  layoutPaths: z.array(z.string().min(1)).optional(),
  tags: z.array(z.string().min(1)).optional(),
});

function isAuthorized(request: Request): boolean {
  const secret = process.env['REVALIDATE_SECRET'];
  if (!secret) {
    return false;
  }

  const authorization = request.headers.get('authorization');
  return authorization === `Bearer ${secret}`;
}

export async function POST(request: Request): Promise<NextResponse> {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: z.infer<typeof revalidateBodySchema>;
  try {
    body = revalidateBodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const paths = body.paths ?? [];
  const layoutPaths = body.layoutPaths ?? [];
  const tags = body.tags ?? [];

  if (paths.length === 0 && layoutPaths.length === 0 && tags.length === 0) {
    return NextResponse.json({ error: 'No paths or tags provided' }, { status: 400 });
  }

  for (const path of paths) {
    revalidatePath(path);
  }

  for (const path of layoutPaths) {
    revalidatePath(path, 'layout');
  }

  for (const tag of tags) {
    revalidateTag(tag);
  }

  return NextResponse.json({
    revalidated: true,
    paths,
    layoutPaths,
    tags,
  });
}
