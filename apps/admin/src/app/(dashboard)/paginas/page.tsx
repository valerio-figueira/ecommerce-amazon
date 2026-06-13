import Link from 'next/link';

import { AdminPageCard } from '@/components/admin/AdminPageCard';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { listAdminPages } from '@/lib/api/cms-pages';

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
      <AdminPageHeader
        title="Páginas"
        breadcrumbs={[
          { label: 'Painel', href: '/' },
          { label: 'Páginas' },
        ]}
      />
      <AdminPageCard>
        {error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : pages.length === 0 ? (
          <p className="text-sm text-[var(--admin-text-muted)]">Nenhuma página cadastrada.</p>
        ) : (
          <ul className="divide-y divide-[var(--admin-gray)]">
            {pages.map((page) => (
              <li key={page.id} className="flex items-center justify-between py-4">
                <div>
                  <p className="font-semibold text-[var(--admin-navy)]">{page.title}</p>
                  <p className="text-xs text-[var(--admin-text-muted)]">
                    /{page.slug} · {page.status}
                  </p>
                </div>
                <Link
                  href={`/paginas/${page.slug}`}
                  className="rounded-md bg-[var(--admin-primary)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[var(--admin-primary-hover)]"
                >
                  Editar blocos
                </Link>
              </li>
            ))}
          </ul>
        )}
      </AdminPageCard>
    </>
  );
}
