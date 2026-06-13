'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, X } from 'lucide-react';

import { ADMIN_NAV_ITEMS } from '@/lib/navigation';
import { cn } from '@/lib/utils';

type AdminSidebarProps = {
  collapsed: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
  onToggleCollapsed: () => void;
};

export function AdminSidebar({
  collapsed,
  mobileOpen,
  onMobileClose,
  onToggleCollapsed,
}: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <aside
        className={cn('admin-side-column relative', mobileOpen && 'open')}
        aria-label="Menu lateral"
      >
        <div className="admin-side-inner">
          <div className="side-brand-card">
            <div className={cn('side-brand-mark flex items-center gap-3', collapsed && 'justify-center')}>
              <div className="side-brand-logo flex size-11 shrink-0 items-center justify-center rounded-lg bg-[color:var(--admin-navy)] text-sm font-bold text-white">
                V
              </div>
              {!collapsed && (
                <div className="side-brand-text min-w-0">
                  <p className="truncate text-sm font-semibold text-[color:var(--admin-navy)]">Vitrine</p>
                  <p className="truncate text-xs text-[color:var(--admin-text-muted)]">Painel CMS</p>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            id="close-nav"
            className="admin-close-nav absolute right-3 top-3 rounded-md p-1 text-[color:var(--admin-text-muted)] hover:bg-[color:var(--admin-bg)]"
            aria-label="Fechar menu"
            onClick={onMobileClose}
          >
            <X className="size-5" />
          </button>

          {!collapsed && (
            <p className="admin-nav-section-label px-2 text-xs font-semibold uppercase tracking-wide text-[color:var(--admin-text-muted)]">
              Navegação
            </p>
          )}

          <nav className="admin-side-nav" aria-label="Navegação principal">
            <ul className="space-y-1">
              {ADMIN_NAV_ITEMS.map((item) => {
                const isActive =
                  item.href === '/'
                    ? pathname === '/'
                    : pathname.startsWith(item.href);
                const Icon = item.icon;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'admin-nav-link flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        isActive
                          ? 'is-active'
                          : 'text-[color:var(--admin-navy)] hover:bg-[color:var(--admin-bg)]',
                        collapsed && 'justify-center px-2',
                      )}
                      title={collapsed ? item.label : undefined}
                      onClick={onMobileClose}
                    >
                      <Icon className="size-[1.1em] shrink-0" aria-hidden="true" />
                      {!collapsed && <span className="admin-nav-label">{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </aside>

      <button
        type="button"
        className="admin-sidebar-collapse-btn"
        aria-label={collapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
        onClick={onToggleCollapsed}
      >
        <span className="admin-sidebar-collapse-btn-inner">
          <ChevronLeft
            className={cn('admin-sidebar-collapse-icon size-4', collapsed && 'rotate-180')}
            aria-hidden="true"
          />
        </span>
      </button>
    </>
  );
}
