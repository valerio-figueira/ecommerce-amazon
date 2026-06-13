import type { ReactNode } from 'react';

import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminLayoutProvider } from '@/components/admin/AdminLayoutContext';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
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
    <AdminLayoutProvider initialTitle={initialTitle} initialBreadcrumbs={initialBreadcrumbs}>
      <div className="admin-app-container grid min-h-screen bg-[color:var(--admin-bg)] md:grid-cols-[auto_1fr] md:grid-rows-[auto_1fr_auto]">
        <div className="md:row-span-3">
          <AdminSidebar />
        </div>

        <AdminHeader session={session} />

        <main className="admin-content-column px-4 py-6 md:px-6">
          {children}
        </main>

        <footer className="border-t border-[color:var(--admin-gray)] bg-[color:var(--admin-surface)] px-6 py-3 text-xs text-[color:var(--admin-text-muted)] md:col-start-2">
          © {new Date().getFullYear()} Vitrine — Painel CMS interno
        </footer>
      </div>
    </AdminLayoutProvider>
  );
}
