import type { ReactNode } from 'react';

import { AdminShellLayout } from '@/components/admin/AdminShellLayout';
import type { AdminSession } from '@/lib/auth/session';
import { getServerBrandConfig } from '@/lib/brand';
import type { AdminBreadcrumb } from '@/lib/navigation';

export function AdminShell({
  session,
  avatarUrl,
  isManagedAvatar,
  initialTitle,
  initialBreadcrumbs = [],
  children,
}: {
  session: AdminSession;
  avatarUrl?: string | null;
  isManagedAvatar?: boolean;
  initialTitle: string;
  initialBreadcrumbs?: AdminBreadcrumb[];
  children: ReactNode;
}) {
  const brand = getServerBrandConfig();

  return (
    <AdminShellLayout
      session={session}
      avatarUrl={avatarUrl ?? null}
      isManagedAvatar={isManagedAvatar ?? false}
      initialTitle={initialTitle}
      initialBreadcrumbs={initialBreadcrumbs}
      siteName={brand.name}
    >
      {children}
    </AdminShellLayout>
  );
}
