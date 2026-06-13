'use client';

import { ChevronDown, LogOut, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import type { AdminSession } from '@/lib/auth/session';
import { cn } from '@/lib/utils';

export function AdminUserMenu({ session }: { session: AdminSession }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target;
      if (
        target instanceof Node &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initial = session.name.trim().charAt(0).toUpperCase() || session.email.charAt(0).toUpperCase();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        className="admin-user-pill flex items-center gap-2 rounded-full border border-[color:var(--admin-gray)] bg-[color:var(--admin-surface)] px-3 py-1.5 text-sm text-[color:var(--admin-navy)] shadow-sm"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
      >
        <span
          className="flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-[color:var(--admin-primary)] to-[color:var(--admin-navy)] text-xs font-semibold text-white"
          aria-hidden="true"
        >
          {initial}
        </span>
        <span className="hidden max-w-[10rem] truncate sm:inline">{session.name}</span>
        <ChevronDown className="size-4 text-[color:var(--admin-text-muted)]" aria-hidden="true" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-lg border border-[color:var(--admin-gray)] bg-[color:var(--admin-surface)] shadow-lg"
        >
          <div className="border-b border-[color:var(--admin-gray)] px-4 py-3">
            <p className="truncate text-sm font-medium text-[color:var(--admin-navy)]">
              {session.name}
            </p>
            <p className="truncate text-xs text-[color:var(--admin-text-muted)]">{session.email}</p>
          </div>
          <button
            type="button"
            role="menuitem"
            className={cn(
              'flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-[color:var(--admin-navy)]',
              'hover:bg-[color:var(--admin-bg)]',
            )}
            onClick={() => void handleLogout()}
          >
            <LogOut className="size-4" aria-hidden="true" />
            Sair
          </button>
          <div className="border-t border-[color:var(--admin-gray)] px-4 py-2 text-xs text-[color:var(--admin-text-muted)]">
            <User className="mr-1 inline size-3" aria-hidden="true" />
            Operador CMS
          </div>
        </div>
      )}
    </div>
  );
}
