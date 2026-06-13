'use client';

import { Heart, Search } from 'lucide-react';
import Link from 'next/link';

import { useWishlist } from '@/components/wishlist/WishlistProvider';
import { WishlistDrawer } from '@/components/wishlist/WishlistDrawer';

type NavCategory = {
  slug: string;
  label: string;
  children?: Array<{ slug: string; label: string }> | undefined;
};

const STATIC_LINKS = [
  { href: '#', label: 'Artigos' },
  { href: '#', label: 'Cupons' },
  { href: '#', label: 'Sobre' },
];

type SiteHeaderProps = {
  navCategories?: NavCategory[];
};

export function SiteHeader({ navCategories = [] }: SiteHeaderProps): React.JSX.Element {
  const { items, setOpen } = useWishlist();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-[var(--background)]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <nav className="hidden items-center gap-5 text-sm font-medium md:flex">
            <Link href="/" className="hover:text-neutral-600">
              Catálogo
            </Link>
            {navCategories.map((category) => (
              <div key={category.slug} className="group relative">
                <Link href={`/categorias/${category.slug}`} className="hover:text-neutral-600">
                  {category.label}
                </Link>
                {category.children && category.children.length > 0 && (
                  <div className="invisible absolute left-0 top-full z-50 min-w-48 rounded-lg border border-neutral-200 bg-white py-2 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
                    {category.children.map((child) => (
                      <Link
                        key={child.slug}
                        href={`/categorias/${child.slug}`}
                        className="block px-4 py-2 text-sm hover:bg-neutral-50"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {STATIC_LINKS.map((link) => (
              <Link key={link.label} href={link.href} className="hover:text-neutral-600">
                {link.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/"
            className="text-xl font-bold tracking-tight md:absolute md:left-1/2 md:-translate-x-1/2"
          >
            VITRINE
          </Link>

          <div className="flex items-center gap-3">
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
