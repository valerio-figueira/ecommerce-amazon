import Link from 'next/link';

import type { AdminBreadcrumb } from '@/lib/navigation';

export function AdminBreadcrumbs({ items }: { items: AdminBreadcrumb[] }) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Navegação estrutural">
      <ol className="admin-top-breadcrumb flex flex-wrap items-center gap-1 text-sm text-[color:var(--admin-text-muted)]">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1">
              {index > 0 && <span aria-hidden="true">›</span>}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="hover:text-[color:var(--admin-primary)] hover:underline"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={isLast ? 'font-medium text-[color:var(--admin-navy)]' : undefined}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
