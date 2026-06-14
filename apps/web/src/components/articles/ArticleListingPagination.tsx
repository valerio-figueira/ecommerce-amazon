'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

import { cn } from '@/lib/utils';

type ArticleListingPaginationProps = {
  page: number;
  totalPages: number;
};

function buildPageHref(
  pathname: string,
  searchParams: URLSearchParams,
  page: number,
): string {
  const params = new URLSearchParams(searchParams.toString());
  if (page <= 1) {
    params.delete('page');
  } else {
    params.set('page', String(page));
  }
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function ArticleListingPagination({
  page,
  totalPages,
}: ArticleListingPaginationProps): React.JSX.Element | null {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      aria-label="Paginação de artigos"
      className={cn(
        'flex flex-col items-center justify-between gap-3 border-t border-neutral-200 pt-6 sm:flex-row',
        isPending && 'opacity-70',
      )}
    >
      <p className="text-sm text-neutral-500">
        Página {page} de {totalPages}
      </p>
      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Link
            href={buildPageHref(pathname, searchParams, page - 1)}
            className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50"
            onClick={() => startTransition(() => undefined)}
          >
            Anterior
          </Link>
        ) : (
          <span className="rounded-full border border-neutral-200 px-4 py-2 text-sm text-neutral-400">
            Anterior
          </span>
        )}
        {page < totalPages ? (
          <Link
            href={buildPageHref(pathname, searchParams, page + 1)}
            className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50"
            onClick={() => startTransition(() => undefined)}
          >
            Próxima
          </Link>
        ) : (
          <span className="rounded-full border border-neutral-200 px-4 py-2 text-sm text-neutral-400">
            Próxima
          </span>
        )}
      </div>
    </nav>
  );
}
