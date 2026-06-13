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
          ? 'bg-transparent p-0 shadow-none border-0'
          : 'admin-page-card p-6',
        className,
      )}
    >
      {children}
    </article>
  );
}
