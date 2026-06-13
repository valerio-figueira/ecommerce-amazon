'use client';

import { ChevronDown, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import type { CategoryNavNode } from '@ecommerce-amazon/shared/category/category-tree-nav';
import { cn } from '@/lib/utils';

type CategoryCatalogFlyoutProps = {
  categories: CategoryNavNode[];
};

export function CategoryCatalogFlyout({
  categories,
}: CategoryCatalogFlyoutProps): React.JSX.Element | null {
  const [open, setOpen] = useState(false);
  const [activeRootSlug, setActiveRootSlug] = useState<string | null>(
    categories[0]?.slug ?? null,
  );
  const containerRef = useRef<HTMLDivElement>(null);

  const activeRoot = categories.find((node) => node.slug === activeRootSlug) ?? categories[0];
  const children = activeRoot?.subcategories ?? [];

  useEffect(() => {
    if (categories.length > 0 && !activeRootSlug) {
      setActiveRootSlug(categories[0]?.slug ?? null);
    }
  }, [categories, activeRootSlug]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target;
      if (
        containerRef.current &&
        target instanceof Node &&
        !containerRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handlePointerDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [open]);

  if (categories.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="category-catalog-flyout relative hidden md:block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium hover:bg-neutral-100"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((current) => !current)}
        onFocus={() => setOpen(true)}
      >
        <LayoutGrid className="size-4" aria-hidden />
        Categorias
        <ChevronDown
          className={cn('size-4 transition-transform', open && 'rotate-180')}
          aria-hidden
        />
      </button>

      <div
        className={cn(
          'category-catalog-flyout__panel transition-all duration-150',
          open ? 'visible opacity-100' : 'invisible pointer-events-none opacity-0',
        )}
        role="menu"
      >
        <div className="category-catalog-flyout__grid">
          <div className="category-catalog-flyout__left">
            <p className="category-catalog-flyout__heading">Explorar</p>
            <ul className="category-catalog-flyout__root-list">
              {categories.map((root) => (
                <li key={root.slug}>
                  <button
                    type="button"
                    className={cn(
                      'category-catalog-flyout__root-item',
                      activeRoot?.slug === root.slug && 'category-catalog-flyout__root-item--active',
                    )}
                    onMouseEnter={() => setActiveRootSlug(root.slug)}
                    onFocus={() => setActiveRootSlug(root.slug)}
                  >
                    {root.icon ? <span className="mr-1.5">{root.icon}</span> : null}
                    {root.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="category-catalog-flyout__right">
            {activeRoot ? (
              <>
                <p className="category-catalog-flyout__heading">{activeRoot.label}</p>
                {children.length > 0 ? (
                  <ul className="category-catalog-flyout__child-list">
                    {children.map((child) => (
                      <li key={child.slug} className="category-catalog-flyout__child-group">
                        <Link
                          href={`/categorias/${child.slug}`}
                          className="category-catalog-flyout__child-link"
                          onClick={() => setOpen(false)}
                        >
                          {child.icon ? <span className="mr-1">{child.icon}</span> : null}
                          {child.label}
                        </Link>
                        {(child.subcategories ?? []).map((grandchild) => (
                          <Link
                            key={grandchild.slug}
                            href={`/categorias/${grandchild.slug}`}
                            className="category-catalog-flyout__grandchild-link"
                            onClick={() => setOpen(false)}
                          >
                            {grandchild.label}
                          </Link>
                        ))}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-neutral-500">Sem subcategorias cadastradas.</p>
                )}
                <Link
                  href={`/categorias/${activeRoot.slug}`}
                  className="category-catalog-flyout__view-all"
                  onClick={() => setOpen(false)}
                >
                  Ver tudo em {activeRoot.label}
                </Link>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
