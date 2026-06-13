import { Package, Plus } from 'lucide-react';
import Link from 'next/link';

import { AdminPageCard } from '@/components/admin/AdminPageCard';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminToastOnMount } from '@/components/ui/admin-toast';
import { Button } from '@/components/ui/button';
import { listAdminProducts } from '@/lib/api/admin-products';
import {
  adminMarketplaceLabel,
  formatEditorialScore,
} from '@/lib/product-admin-format';
import { cn } from '@/lib/utils';

export const metadata = {
  title: 'Produtos — Vitrine CMS',
};

export default async function ProdutosPage(): Promise<React.JSX.Element> {
  let products: Awaited<ReturnType<typeof listAdminProducts>> | null = null;
  let error: string | null = null;

  try {
    products = await listAdminProducts({ pageSize: 50 });
  } catch (fetchError) {
    error = fetchError instanceof Error ? fetchError.message : 'Erro ao carregar produtos';
  }

  return (
    <>
      {error ? <AdminToastOnMount message={error} variant="error" /> : null}
      <AdminPageHeader
        title="Produtos"
        breadcrumbs={[
          { label: 'Painel', href: '/' },
          { label: 'Produtos' },
        ]}
      />
      <AdminPageCard>
        <div className="cms-shell">
          <header className="cms-toolbar">
            <div>
              <p className="cms-toolbar-title">Catálogo manual e híbrido</p>
              <p className="cms-toolbar-meta">
                Cadastre produtos via link de afiliado enquanto as APIs oficiais não estão
                disponíveis.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {products ? (
                <div className="flex items-center gap-2 text-xs text-[var(--admin-text-muted)]">
                  <Package className="h-4 w-4 text-[var(--admin-primary)]" aria-hidden />
                  <span>
                    <strong className="text-[var(--admin-navy)]">{products.total}</strong> produto
                    {products.total === 1 ? '' : 's'}
                  </span>
                </div>
              ) : null}
              <Button asChild variant="primary" size="sm">
                <Link href="/produtos/novo">
                  <Plus className="mr-1.5 h-4 w-4" />
                  Novo produto
                </Link>
              </Button>
            </div>
          </header>

          {error ? null : products && products.items.length === 0 ? (
            <div className="cms-empty-state">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--admin-accent-muted)] text-[var(--admin-primary)]">
                <Package className="h-5 w-5" aria-hidden />
              </div>
              <p className="text-sm font-semibold text-[var(--admin-navy-deep)]">
                Nenhum produto cadastrado
              </p>
              <p className="mx-auto mt-1 max-w-sm text-xs text-[var(--admin-text-muted)]">
                Cole um link de afiliado da Amazon, Shopee ou Mercado Livre para começar.
              </p>
              <Button asChild variant="primary" size="sm" className="mt-4">
                <Link href="/produtos/novo">Cadastrar primeiro produto</Link>
              </Button>
            </div>
          ) : products ? (
            <ul className="space-y-1">
              {products.items.map((product) => (
                <li key={product.id}>
                  <div className="cms-page-row">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="cms-type-picker-icon shrink-0">
                        <Package className="h-4 w-4" aria-hidden />
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-semibold text-[var(--admin-navy-deep)]">
                            {product.title}
                          </p>
                          <span className="cms-status-pill is-published">
                            {adminMarketplaceLabel(product.marketplace)}
                          </span>
                          <span
                            className={cn(
                              'cms-status-pill',
                              product.price.isStale ? 'is-draft' : 'is-published',
                            )}
                          >
                            {product.price.isStale ? 'Preço oculto' : 'Preço visível'}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-xs text-[var(--admin-text-muted)]">
                          {product.externalId} · Nota {formatEditorialScore(product.editorialScore)}{' '}
                          · {product.slug}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </AdminPageCard>
    </>
  );
}
