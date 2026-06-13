'use client';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import type { CategoryNavNode } from '@ecommerce-amazon/shared/category/category-tree-nav';

type MobileNavDrawerProps = {
  categories: CategoryNavNode[];
};

const STATIC_LINKS = [
  { href: '#', label: 'Artigos' },
  { href: '#', label: 'Cupons' },
  { href: '#', label: 'Sobre' },
];

export function MobileNavDrawer({ categories }: MobileNavDrawerProps): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);

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

  return (
    <>
      <button
        type="button"
        className="rounded-full p-2 hover:bg-neutral-100 md:hidden"
        aria-label="Abrir menu"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <>
          <button
            type="button"
            className="mobile-nav-drawer__overlay md:hidden"
            aria-label="Fechar menu"
            onClick={() => setOpen(false)}
          />

          <div className="mobile-nav-drawer__panel md:hidden" role="dialog" aria-modal="true">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
                Menu
              </p>
              <button
                type="button"
                className="rounded-full p-2 hover:bg-neutral-100"
                aria-label="Fechar menu"
                onClick={() => setOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mobile-nav-drawer__section">
              <Link href="/" className="block py-1 text-sm font-medium" onClick={() => setOpen(false)}>
                Catálogo
              </Link>
            </div>

            {categories.map((category) => {
              const children = category.subcategories ?? [];
              const isExpanded = expandedSlug === category.slug;

              return (
                <div key={category.slug} className="mobile-nav-drawer__section">
                  {children.length > 0 ? (
                    <>
                      <button
                        type="button"
                        className="mobile-nav-drawer__accordion-trigger"
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
                            className="mobile-nav-drawer__child-link font-medium"
                            onClick={() => setOpen(false)}
                          >
                            Ver tudo em {category.label}
                          </Link>
                          {children.map((child) => (
                            <Link
                              key={child.slug}
                              href={`/categorias/${child.slug}`}
                              className="mobile-nav-drawer__child-link"
                              onClick={() => setOpen(false)}
                            >
                              {child.label}
                            </Link>
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

            <div className="mobile-nav-drawer__section">
              {STATIC_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block py-1 text-sm text-neutral-600"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
