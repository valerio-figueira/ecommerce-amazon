import { PageStatus } from '@ecommerce-amazon/domain';
import { ChevronRight, FileText, Layers } from 'lucide-react';
import Link from 'next/link';

import { AdminPageCard } from '@/components/admin/AdminPageCard';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminToastOnMount } from '@/components/ui/admin-toast';
import { Button } from '@/components/ui/button';
import { listAdminPages } from '@/lib/api/cms-pages';
import { cn } from '@/lib/utils';

export default async function PaginasPage(): Promise<React.JSX.Element> {
  let pages: Awaited<ReturnType<typeof listAdminPages>> = [];
  let error: string | null = null;

  try {
    pages = await listAdminPages();
  } catch (fetchError) {
    error = fetchError instanceof Error ? fetchError.message : 'Erro ao carregar páginas';
  }

  return (
    <>
      {error ? <AdminToastOnMount message={error} variant="error" /> : null}
      <AdminPageHeader
        title="Páginas"
        breadcrumbs={[
          { label: 'Painel', href: '/' },
          { label: 'Páginas' },
        ]}
      />
      <AdminPageCard>
        <div className="cms-shell">
          <header className="cms-toolbar">
            <div>
              <p className="cms-toolbar-title">Layout editorial</p>
              <p className="cms-toolbar-meta">
                Gerencie blocos dinâmicos e a ordem de exibição na vitrine pública.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--admin-text-muted)]">
              <Layers className="h-4 w-4 text-[var(--admin-primary)]" aria-hidden />
              <span>
                <strong className="text-[var(--admin-navy)]">{pages.length}</strong> página
                {pages.length === 1 ? '' : 's'}
              </span>
            </div>
          </header>

          {error ? null : pages.length === 0 ? (
            <div className="cms-empty-state">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--admin-accent-muted)] text-[var(--admin-primary)]">
                <FileText className="h-5 w-5" aria-hidden />
              </div>
              <p className="text-sm font-semibold text-[var(--admin-navy-deep)]">
                Nenhuma página cadastrada
              </p>
              <p className="mx-auto mt-1 max-w-sm text-xs text-[var(--admin-text-muted)]">
                Crie páginas no banco ou via seed para começar a montar o layout.
              </p>
            </div>
          ) : (
            <ul className="space-y-1">
              {pages.map((page) => (
                <li key={page.id}>
                  <div className="cms-page-row">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="cms-type-picker-icon shrink-0">
                        <FileText className="h-4 w-4" aria-hidden />
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-semibold text-[var(--admin-navy-deep)]">
                            {page.title}
                          </p>
                          <span
                            className={cn(
                              'cms-status-pill',
                              page.status === PageStatus.PUBLISHED ? 'is-published' : 'is-draft',
                            )}
                          >
                            {page.status === PageStatus.PUBLISHED ? 'Publicada' : 'Rascunho'}
                          </span>
                        </div>
                        <p className="mt-0.5 font-mono text-xs text-[var(--admin-text-muted)]">
                          /{page.slug}
                        </p>
                      </div>
                    </div>

                    <Button asChild variant="primary" size="sm" className="shrink-0">
                      <Link href={`/paginas/${page.slug}`}>
                        Editar blocos
                        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                      </Link>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </AdminPageCard>
    </>
  );
}
