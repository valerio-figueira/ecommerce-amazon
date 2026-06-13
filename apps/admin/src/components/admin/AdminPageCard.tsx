import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export function AdminPageCard({
  children,
  className,
  transparent = false,
}: {
  children: ReactNode;
  className?: string;
  transparent?: boolean;
}) {
  return (
    <article
      className={cn(
        'admin-page-card mx-auto w-full max-w-[82.5rem]',
        transparent
          ? 'bg-transparent p-0 shadow-none'
          : 'rounded-xl border border-[color:var(--admin-gray)] bg-[color:var(--admin-surface)] p-6 shadow-[0_0.35rem_1.25rem_var(--admin-shadow)]',
        className,
      )}
    >
      {children}
    </article>
  );
}
