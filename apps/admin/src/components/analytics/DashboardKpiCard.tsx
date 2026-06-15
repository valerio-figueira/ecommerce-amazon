import type { LucideIcon } from 'lucide-react';

import { AdminPageCard } from '@/components/admin/AdminPageCard';
import { cn } from '@/lib/utils';

type DashboardKpiCardProps = {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  className?: string;
};

export function DashboardKpiCard({
  label,
  value,
  hint,
  icon: Icon,
  className,
}: DashboardKpiCardProps): React.JSX.Element {
  return (
    <AdminPageCard className={cn('p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-[color:var(--admin-text-muted)]">{label}</p>
          <p className="mt-1 text-3xl font-semibold text-[color:var(--admin-navy)]">{value}</p>
          {hint ? (
            <p className="mt-2 text-xs text-[color:var(--admin-text-muted)]">{hint}</p>
          ) : null}
        </div>
        <Icon className="size-5 text-[color:var(--admin-primary)]" aria-hidden="true" />
      </div>
    </AdminPageCard>
  );
}
