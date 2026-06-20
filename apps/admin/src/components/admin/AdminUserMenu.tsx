'use client';

import { ChevronDown, LogOut, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import type { AdminSession } from '@/lib/auth/session';
import { cn } from '@/lib/utils';

export type AdminUserMenuProps = {
  session: AdminSession;
  avatarUrl?: string | null;
  isManagedAvatar?: boolean;
};

export function AdminUserMenu({
  session,
  avatarUrl = null,
  isManagedAvatar = false,
}: AdminUserMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target;
      if (target instanceof Node && menuRef.current && !menuRef.current.contains(target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initial =
    session.name.trim().charAt(0).toUpperCase() || session.email.charAt(0).toUpperCase();
  const [avatarFailed, setAvatarFailed] = useState(false);
  const showAvatar = Boolean(avatarUrl && isManagedAvatar && !avatarFailed);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        className="admin-user-pill"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
      >
        {showAvatar ? (
          <img
            src={avatarUrl ?? ''}
            alt=""
            width={32}
            height={32}
            className="admin-user-pill-avatar"
            decoding="async"
            onError={() => setAvatarFailed(true)}
          />
        ) : (
          <span className="admin-user-pill-initial" aria-hidden="true">
            {initial}
          </span>
        )}
        <span className="admin-user-pill-name hidden sm:inline">{session.name}</span>
        <ChevronDown className="admin-user-pill-chevron" aria-hidden="true" />
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
          <Link
            href="/perfil"
            role="menuitem"
            className={cn(
              'flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-[color:var(--admin-navy)]',
              'hover:bg-[color:var(--admin-bg)]',
            )}
            onClick={() => setOpen(false)}
          >
            <User className="size-4" aria-hidden="true" />
            Meu perfil
          </Link>
          <button
            type="button"
            role="menuitem"
            className={cn(
              'flex w-full items-center gap-2 border-t border-[color:var(--admin-gray)] px-4 py-2.5 text-left text-sm text-[color:var(--admin-navy)]',
              'hover:bg-[color:var(--admin-bg)]',
            )}
            onClick={() => void handleLogout()}
          >
            <LogOut className="size-4" aria-hidden="true" />
            Sair
          </button>
        </div>
      )}
    </div>
  );
}
