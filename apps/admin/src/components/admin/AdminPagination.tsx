'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type AdminPaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  loading?: boolean;
  itemLabel?: string;
  onPageChange: (page: number) => void;
  className?: string;
};

type PageToken = number | 'ellipsis';

function buildPageTokens(currentPage: number, totalPages: number): PageToken[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const tokens: PageToken[] = [1];

  if (currentPage > 3) {
    tokens.push('ellipsis');
  }

  const rangeStart = Math.max(2, currentPage - 1);
  const rangeEnd = Math.min(totalPages - 1, currentPage + 1);

  for (let page = rangeStart; page <= rangeEnd; page += 1) {
    tokens.push(page);
  }

  if (currentPage < totalPages - 2) {
    tokens.push('ellipsis');
  }

  tokens.push(totalPages);
  return tokens;
}

export function AdminPagination({
  page,
  pageSize,
  total,
  loading = false,
  itemLabel = 'itens',
  onPageChange,
  className,
}: AdminPaginationProps): React.JSX.Element | null {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  if (totalPages <= 1 && total <= pageSize) {
    return null;
  }

  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, total);
  const pageTokens = buildPageTokens(page, totalPages);

  return (
    <nav
      aria-label="Paginação"
      className={cn(
        'flex flex-col gap-3 border-t border-[var(--admin-border)] pt-4 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <p className="text-xs text-[var(--admin-text-muted)]">
        {total === 0 ? (
          <>Nenhum resultado</>
        ) : (
          <>
            Mostrando{' '}
            <strong className="text-[var(--admin-navy)]">
              {rangeStart}–{rangeEnd}
            </strong>{' '}
            de <strong className="text-[var(--admin-navy)]">{total}</strong> {itemLabel}
            <span className="mx-1.5 text-[var(--admin-border)]" aria-hidden>
              ·
            </span>
            Página <strong className="text-[var(--admin-navy)]">{page}</strong> de{' '}
            <strong className="text-[var(--admin-navy)]">{totalPages}</strong>
          </>
        )}
      </p>

      <div className="flex flex-wrap items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1 || loading}
          onClick={() => onPageChange(page - 1)}
          aria-label="Página anterior"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">Anterior</span>
        </Button>

        <div className="flex items-center gap-1" role="group" aria-label="Números de página">
          {pageTokens.map((token, index) =>
            token === 'ellipsis' ? (
              <span
                key={`ellipsis-${index}`}
                className="px-1 text-xs text-[var(--admin-text-muted)]"
                aria-hidden
              >
                …
              </span>
            ) : (
              <Button
                key={token}
                type="button"
                variant={token === page ? 'primary' : 'outline'}
                size="sm"
                disabled={loading}
                aria-current={token === page ? 'page' : undefined}
                className={cn('min-w-9 px-2', token === page && 'pointer-events-none shadow-sm')}
                onClick={() => onPageChange(token)}
              >
                {token}
              </Button>
            ),
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= totalPages || loading}
          onClick={() => onPageChange(page + 1)}
          aria-label="Próxima página"
        >
          <span className="hidden sm:inline">Próxima</span>
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Button>
      </div>
    </nav>
  );
}
