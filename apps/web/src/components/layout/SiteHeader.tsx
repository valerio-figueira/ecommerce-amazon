'use client';

import { Heart, Search } from 'lucide-react';
import Link from 'next/link';

import { CategoryCatalogDrawer } from '@/components/layout/CategoryCatalogDrawer';
import { CategoryCatalogFlyout } from '@/components/layout/CategoryCatalogFlyout';
import { useWishlist } from '@/components/wishlist/WishlistProvider';
import { WishlistDrawer } from '@/components/wishlist/WishlistDrawer';
import type { CategoryNavNode } from '@ecommerce-amazon/shared/category/category-tree-nav';

const EDITORIAL_LINKS = [
  { href: '#', label: 'Artigos' },
  { href: '#', label: 'Cupons' },
  { href: '#', label: 'Sobre' },
];

type SiteHeaderProps = {
  navCategories?: CategoryNavNode[];
};

export function SiteHeader({ navCategories = [] }: SiteHeaderProps): React.JSX.Element {
  const { items, setOpen } = useWishlist();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-[var(--background)]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4">
          <div className="flex min-w-0 flex-1 items-center gap-3 md:gap-5">
            <Link
              href="/"
              className="shrink-0 text-lg font-bold tracking-tight md:text-xl"
            >
              VITRINE
            </Link>

            <CategoryCatalogFlyout categories={navCategories} />
            <CategoryCatalogDrawer categories={navCategories} />

            <nav className="hidden items-center gap-4 text-sm font-medium sm:flex md:gap-5">
              {EDITORIAL_LINKS.map((link) => (
                <Link key={link.label} href={link.href} className="hover:text-neutral-600">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-2 md:gap-3">
            <button
              type="button"
              aria-label="Buscar"
              className="rounded-full p-2 hover:bg-neutral-100"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Lista de desejos"
              className="relative rounded-full p-2 hover:bg-neutral-100"
              onClick={() => setOpen(true)}
            >
              <Heart className="h-5 w-5" />
              {items.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--primary)] px-1 text-[10px] text-white">
                  {items.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
      <WishlistDrawer />
    </>
  );
}
