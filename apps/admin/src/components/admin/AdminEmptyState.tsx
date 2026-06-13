import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

export function AdminEmptyState({
  icon: Icon,
  title,
  hint,
  className,
}: {
  icon: LucideIcon;
  title: string;
  hint: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      className={cn(
        'admin-empty-state flex flex-col items-center justify-center rounded-xl border border-[color:var(--admin-gray)] bg-[color:var(--admin-surface)] px-6 py-12 text-center shadow-[0_0.35rem_1.25rem_var(--admin-shadow)]',
        className,
      )}
    >
      <Icon
        className="admin-empty-state__icon mb-4 size-10 text-[color:var(--admin-text-muted)]"
        aria-hidden="true"
      />
      <h3 className="admin-empty-state__title text-lg font-semibold text-[color:var(--admin-navy)]">
        {title}
      </h3>
      <p className="admin-empty-state__hint mt-2 max-w-md text-sm text-[color:var(--admin-text-muted)]">
        {hint}
      </p>
    </div>
  );
}
