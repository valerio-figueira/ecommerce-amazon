'use client';

import { Menu } from 'lucide-react';

import { AdminBreadcrumbs } from '@/components/admin/AdminBreadcrumbs';
import { AdminHeaderBackLink } from '@/components/admin/AdminHeaderBackLink';
import { AdminUserMenu } from '@/components/admin/AdminUserMenu';
import { useAdminLayout } from '@/components/admin/AdminLayoutContext';
import type { AdminSession } from '@/lib/auth/session';

export function AdminHeader({
  session,
  onOpenMobileNav,
}: {
  session: AdminSession;
  onOpenMobileNav: () => void;
}) {
  const { title, breadcrumbs } = useAdminLayout();
  const showBackLink = breadcrumbs.length > 0;

  return (
    <header className="admin-top-header">
      <div className="admin-header-leading flex min-w-0 items-center gap-2">
        <button
          type="button"
          id="open-nav"
          className="admin-open-nav inline-flex items-center justify-center rounded-lg border border-[color:var(--admin-gray)] bg-[color:var(--admin-surface)] p-2 text-[color:var(--admin-navy)] shadow-sm"
          aria-label="Abrir menu de navegação"
          onClick={onOpenMobileNav}
        >
          <Menu className="size-5" aria-hidden="true" />
        </button>
        {showBackLink ? <AdminHeaderBackLink /> : null}
      </div>

      <div className="admin-header-title-block min-w-0 flex-1">
        <div className="admin-title-row">
          <h2 className="admin-page-heading truncate text-xl font-semibold text-[color:var(--admin-navy)]">
            {title}
          </h2>
        </div>
        <AdminBreadcrumbs items={breadcrumbs} />
      </div>

      <AdminUserMenu session={session} />
    </header>
  );
}
