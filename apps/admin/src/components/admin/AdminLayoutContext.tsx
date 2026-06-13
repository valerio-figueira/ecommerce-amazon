'use client';

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { AdminBreadcrumb } from '@/lib/navigation';

type AdminLayoutContextValue = {
  title: string;
  setTitle: (title: string) => void;
  breadcrumbs: AdminBreadcrumb[];
  setBreadcrumbs: (items: AdminBreadcrumb[]) => void;
};

const AdminLayoutContext = createContext<AdminLayoutContextValue | null>(null);

export function AdminLayoutProvider({
  children,
  initialTitle,
  initialBreadcrumbs = [],
}: {
  children: ReactNode;
  initialTitle: string;
  initialBreadcrumbs?: AdminBreadcrumb[];
}) {
  const [title, setTitle] = useState(initialTitle);
  const [breadcrumbs, setBreadcrumbs] = useState<AdminBreadcrumb[]>(initialBreadcrumbs);

  const value = useMemo(
    () => ({ title, setTitle, breadcrumbs, setBreadcrumbs }),
    [title, breadcrumbs],
  );

  return (
    <AdminLayoutContext.Provider value={value}>{children}</AdminLayoutContext.Provider>
  );
}

export function useAdminLayout() {
  const context = useContext(AdminLayoutContext);
  if (!context) {
    throw new Error('useAdminLayout must be used within AdminLayoutProvider');
  }
  return context;
}
