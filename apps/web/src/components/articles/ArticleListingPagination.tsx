'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

import { useArticleListingPending } from '@/components/articles/ArticleListingPendingContext';
import { cn } from '@/lib/utils';

type ArticleListingPaginationProps = {
  page: number;
  totalPages: number;
};

function buildPageHref(pathname: string, searchParams: URLSearchParams, page: number): string {
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
  const { isPending, startListingTransition } = useArticleListingPending();

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      aria-label="Paginação de artigos"
      className={cn(
        'flex items-center justify-center gap-2 border-t border-neutral-200 pt-6',
        isPending && 'opacity-70',
      )}
    >
      {page > 1 ? (
        <Link
          href={buildPageHref(pathname, searchParams, page - 1)}
          className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50"
          onClick={() => startListingTransition(() => undefined)}
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
          onClick={() => startListingTransition(() => undefined)}
        >
          Próxima
        </Link>
      ) : (
        <span className="rounded-full border border-neutral-200 px-4 py-2 text-sm text-neutral-400">
          Próxima
        </span>
      )}
    </nav>
  );
}
