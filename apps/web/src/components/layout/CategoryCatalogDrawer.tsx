'use client';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import type { CategoryNavNode } from '@ecommerce-amazon/shared/category/category-tree-nav';

type CategoryCatalogDrawerProps = {
  categories: CategoryNavNode[];
};

export function CategoryCatalogDrawer({
  categories,
}: CategoryCatalogDrawerProps): React.JSX.Element | null {
  const [open, setOpen] = useState(false);
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  if (categories.length === 0) {
    return null;
  }

  const drawerContent =
    open && mounted ? (
      <>
        <button
          type="button"
          className="category-catalog-drawer__overlay md:hidden"
          aria-label="Fechar categorias"
          onClick={() => setOpen(false)}
        />

        <div
          className="category-catalog-drawer__panel md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Explorar categorias"
        >
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
              Categorias
            </p>
            <button
              type="button"
              className="rounded-full p-2 hover:bg-neutral-100"
              aria-label="Fechar categorias"
              onClick={() => setOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {categories.map((category) => {
            const children = category.subcategories ?? [];
            const isExpanded = expandedSlug === category.slug;

            return (
              <div key={category.slug} className="category-catalog-drawer__section">
                {children.length > 0 ? (
                  <>
                    <button
                      type="button"
                      className="category-catalog-drawer__accordion-trigger"
                      aria-expanded={isExpanded}
                      onClick={() =>
                        setExpandedSlug((current) =>
                          current === category.slug ? null : category.slug,
                        )
                      }
                    >
                      <span>
                        {category.icon ? <span className="mr-1">{category.icon}</span> : null}
                        {category.label}
                      </span>
                      <span aria-hidden>{isExpanded ? '−' : '+'}</span>
                    </button>

                    {isExpanded && (
                      <div className="mt-1">
                        <Link
                          href={`/categorias/${category.slug}`}
                          className="category-catalog-drawer__child-link font-medium"
                          onClick={() => setOpen(false)}
                        >
                          Ver tudo em {category.label}
                        </Link>
                        {children.map((child) => (
                          <div key={child.slug}>
                            <Link
                              href={`/categorias/${child.slug}`}
                              className="category-catalog-drawer__child-link"
                              onClick={() => setOpen(false)}
                            >
                              {child.label}
                            </Link>
                            {(child.subcategories ?? []).map((grandchild) => (
                              <Link
                                key={grandchild.slug}
                                href={`/categorias/${grandchild.slug}`}
                                className="category-catalog-drawer__grandchild-link"
                                onClick={() => setOpen(false)}
                              >
                                {grandchild.label}
                              </Link>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={`/categorias/${category.slug}`}
                    className="block py-1 text-sm font-semibold"
                    onClick={() => setOpen(false)}
                  >
                    {category.icon ? <span className="mr-1">{category.icon}</span> : null}
                    {category.label}
                  </Link>
                )}
              </div>
            );
          })}

          <div className="category-catalog-drawer__section mt-4 border-t border-neutral-200 pt-4">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-500">
              Explorar
            </p>
            <Link
              href="/artigos"
              className="block py-1.5 text-sm font-medium text-neutral-800 hover:text-neutral-600"
              onClick={() => setOpen(false)}
            >
              Artigos
            </Link>
            <Link
              href="/sobre"
              className="block py-1.5 text-sm font-medium text-neutral-800 hover:text-neutral-600"
              onClick={() => setOpen(false)}
            >
              Sobre
            </Link>
          </div>
        </div>
      </>
    ) : null;

  return (
    <>
      <button
        type="button"
        className="inline-flex items-center gap-1.5 rounded-full px-2 py-2 text-sm font-medium hover:bg-neutral-100 md:hidden"
        aria-label="Explorar categorias"
        onClick={() => setOpen(true)}
      >
        <Menu className="size-5" />
        <span className="sr-only sm:not-sr-only sm:inline">Categorias</span>
      </button>

      {drawerContent && createPortal(drawerContent, document.body)}
    </>
  );
}
