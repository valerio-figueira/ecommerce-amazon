'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import type { CategoryNavNode } from '@ecommerce-amazon/shared/category/category-tree-nav';
import { cn } from '@/lib/utils';

type CategoryMegaMenuProps = {
  category: CategoryNavNode;
};

export function CategoryMegaMenu({ category }: CategoryMegaMenuProps): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const children = category.subcategories ?? [];

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

  if (children.length === 0) {
    return (
      <Link href={`/categorias/${category.slug}`} className="hover:text-neutral-600">
        {category.icon ? <span className="mr-1">{category.icon}</span> : null}
        {category.label}
      </Link>
    );
  }

  return (
    <div
      ref={containerRef}
      className="category-mega-menu relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={(event) => {
        const related = event.relatedTarget;
        if (
          related instanceof Node &&
          !containerRef.current?.contains(related)
        ) {
          setOpen(false);
        }
      }}
    >
      <Link
        href={`/categorias/${category.slug}`}
        className="hover:text-neutral-600"
        aria-expanded={open}
        aria-haspopup="true"
        onFocus={() => setOpen(true)}
      >
        {category.icon ? <span className="mr-1">{category.icon}</span> : null}
        {category.label}
      </Link>

      <div
        className={cn(
          'category-mega-menu__panel transition-all duration-150',
          open ? 'visible opacity-100' : 'invisible opacity-0 pointer-events-none',
        )}
        role="menu"
      >
        <Link
          href={`/categorias/${category.slug}`}
          className="mb-3 block text-sm font-semibold text-neutral-900 hover:underline"
        >
          Ver tudo em {category.label}
        </Link>

        <div className="category-mega-menu__columns">
          {children.map((child) => (
            <div key={child.slug}>
              <Link
                href={`/categorias/${child.slug}`}
                className="category-mega-menu__column-title hover:underline"
              >
                {child.icon ? <span className="mr-1">{child.icon}</span> : null}
                {child.label}
              </Link>

              {(child.subcategories ?? []).map((grandchild) => (
                <Link
                  key={grandchild.slug}
                  href={`/categorias/${grandchild.slug}`}
                  className="category-mega-menu__grandchild-link"
                >
                  {grandchild.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
