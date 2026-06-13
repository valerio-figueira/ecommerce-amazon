import type { ReactNode } from 'react';

import { AdminShellLayout } from '@/components/admin/AdminShellLayout';
import type { AdminSession } from '@/lib/auth/session';
import type { AdminBreadcrumb } from '@/lib/navigation';

export function AdminShell({
  session,
  initialTitle,
  initialBreadcrumbs = [],
  children,
}: {
  session: AdminSession;
  initialTitle: string;
  initialBreadcrumbs?: AdminBreadcrumb[];
  children: ReactNode;
}) {
  return (
    <AdminShellLayout
      session={session}
      initialTitle={initialTitle}
      initialBreadcrumbs={initialBreadcrumbs}
    >
      {children}
    </AdminShellLayout>
  );
}
