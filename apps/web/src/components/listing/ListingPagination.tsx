'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

import { cn } from '@/lib/utils';

type ListingPaginationProps = {
  page: number;
  totalPages: number;
  ariaLabel: string;
  className?: string;
  isPending?: boolean;
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

export function ListingPagination({
  page,
  totalPages,
  ariaLabel,
  className,
  isPending = false,
}: ListingPaginationProps): React.JSX.Element | null {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      aria-label={ariaLabel}
      className={cn(
        'flex items-center justify-center gap-2 border-t border-neutral-200 pt-6',
        isPending && 'opacity-70',
        className,
      )}
    >
      {page > 1 ? (
        <Link
          href={buildPageHref(pathname, searchParams, page - 1)}
          className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50"
        >
          Anterior
        </Link>
      ) : (
        <span className="rounded-full border border-neutral-200 px-4 py-2 text-sm text-neutral-400">
          Anterior
        </span>
      )}
      <span className="px-2 text-sm tabular-nums text-neutral-500">
        {page} / {totalPages}
      </span>
      {page < totalPages ? (
        <Link
          href={buildPageHref(pathname, searchParams, page + 1)}
          className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50"
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
