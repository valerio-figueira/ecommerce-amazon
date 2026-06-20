'use client';

import { useEffect, useState, type ReactNode } from 'react';

import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminLayoutProvider } from '@/components/admin/AdminLayoutContext';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import type { AdminSession } from '@/lib/auth/session';
import type { AdminBreadcrumb } from '@/lib/navigation';
import { getClientBrandConfig } from '@/lib/brand';
import { cn } from '@/lib/utils';

const SIDEBAR_STORAGE_KEY = 'vitrine-admin-sidebar-collapsed';
const brand = getClientBrandConfig();

export function AdminShellLayout({
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
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (stored === 'true') {
      setCollapsed(true);
    }
    setHydrated(true);
  }, []);

  function toggleCollapsed() {
    setCollapsed((value) => {
      const next = !value;
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      return next;
    });
  }

  return (
    <AdminLayoutProvider initialTitle={initialTitle} initialBreadcrumbs={initialBreadcrumbs}>
      <div className={cn('admin-app-container', hydrated && collapsed && 'admin-sidebar-narrow')}>
        <AdminSidebar
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
          onToggleCollapsed={toggleCollapsed}
        />

        <AdminHeader
          session={session}
          avatarUrl={avatarUrl ?? null}
          isManagedAvatar={isManagedAvatar ?? false}
          onOpenMobileNav={() => setMobileOpen(true)}
        />

        <main className="admin-content-column">{children}</main>

        <footer className="admin-app-footer">
          <small>
            © {new Date().getFullYear()} {brand.name} — Painel CMS interno
          </small>
        </footer>

        {mobileOpen && (
          <button
            type="button"
            className="admin-sidebar-backdrop"
            aria-label="Fechar menu"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </div>
    </AdminLayoutProvider>
  );
}
