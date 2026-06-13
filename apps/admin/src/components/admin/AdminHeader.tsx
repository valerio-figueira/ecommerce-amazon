'use client';

import { AdminBreadcrumbs } from '@/components/admin/AdminBreadcrumbs';
import { AdminHeaderBackLink } from '@/components/admin/AdminSidebar';
import { AdminUserMenu } from '@/components/admin/AdminUserMenu';
import { useAdminLayout } from '@/components/admin/AdminLayoutContext';
import type { AdminSession } from '@/lib/auth/session';

export function AdminHeader({ session }: { session: AdminSession }) {
  const { title, breadcrumbs } = useAdminLayout();
  const showBackLink = breadcrumbs.length > 0;

  return (
    <header className="admin-top-header flex items-center gap-4 border-b border-[color:var(--admin-gray)] bg-[color:var(--admin-surface)] px-4 py-4 md:px-6">
      {showBackLink ? <AdminHeaderBackLink /> : null}
      <div className="admin-header-title-block min-w-0 flex-1">
        <h2 className="admin-page-heading truncate text-xl font-semibold text-[color:var(--admin-navy)]">
          {title}
        </h2>
        <AdminBreadcrumbs items={breadcrumbs} />
      </div>
      <AdminUserMenu session={session} />
    </header>
  );
}
