'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, Menu, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { ADMIN_NAV_ITEMS } from '@/lib/navigation';
import { cn } from '@/lib/utils';

const SIDEBAR_STORAGE_KEY = 'vitrine-admin-sidebar-collapsed';

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (stored === 'true') {
      setCollapsed(true);
    }
  }, []);

  function toggleCollapsed() {
    setCollapsed((value) => {
      const next = !value;
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      return next;
    });
  }

  return (
    <>
      <button
        type="button"
        className="admin-open-nav fixed left-4 top-[4.75rem] z-40 rounded-lg border border-[color:var(--admin-gray)] bg-[color:var(--admin-surface)] p-2 shadow md:hidden"
        aria-label="Abrir menu de navegação"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="size-5 text-[color:var(--admin-navy)]" />
      </button>

      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          aria-label="Fechar menu"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          'admin-side-column fixed inset-y-0 left-0 z-50 flex flex-col border-r border-[color:var(--admin-gray)] bg-[color:var(--admin-surface)] transition-transform duration-200 md:static md:translate-x-0',
          collapsed ? 'w-[4.75rem]' : 'w-[16.75rem]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        )}
      >
        <div className="flex items-center justify-between border-b border-[color:var(--admin-gray)] px-4 py-4">
          <div className={cn('flex items-center gap-3 overflow-hidden', collapsed && 'justify-center')}>
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[color:var(--admin-navy)] text-sm font-bold text-white">
              V
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[color:var(--admin-navy)]">Vitrine</p>
                <p className="truncate text-xs text-[color:var(--admin-text-muted)]">Painel CMS</p>
              </div>
            )}
          </div>
          <button
            type="button"
            className="rounded-md p-1 text-[color:var(--admin-text-muted)] hover:bg-[color:var(--admin-bg)] md:hidden"
            aria-label="Fechar menu"
            onClick={() => setMobileOpen(false)}
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          {!collapsed && (
            <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-[color:var(--admin-text-muted)]">
              Navegação
            </p>
          )}
          <nav aria-label="Navegação principal">
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
                          ? 'bg-[color:color-mix(in_srgb,var(--admin-primary)_12%,white)] text-[color:var(--admin-primary)] shadow-[inset_3px_0_0_0_var(--admin-primary)]'
                          : 'text-[color:var(--admin-navy)] hover:bg-[color:var(--admin-bg)]',
                        collapsed && 'justify-center px-2',
                      )}
                      title={collapsed ? item.label : undefined}
                      onClick={() => setMobileOpen(false)}
                    >
                      <Icon className="size-[1.1em] shrink-0" aria-hidden="true" />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <button
          type="button"
          className="hidden border-t border-[color:var(--admin-gray)] p-3 text-[color:var(--admin-text-muted)] hover:bg-[color:var(--admin-bg)] md:flex md:items-center md:justify-center"
          aria-label={collapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
          onClick={toggleCollapsed}
        >
          {collapsed ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}
        </button>
      </aside>
    </>
  );
}

export function AdminHeaderBackLink() {
  return (
    <Link
      href="/"
      className="backward-link hidden items-center justify-center rounded-md p-1 text-[color:var(--admin-text-muted)] hover:bg-[color:var(--admin-bg)] md:inline-flex"
      aria-label="Voltar para o painel"
      title="Voltar"
    >
      <ChevronLeft className="size-5" />
    </Link>
  );
}
