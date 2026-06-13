'use client';

import { useEffect } from 'react';

import { useAdminLayout } from '@/components/admin/AdminLayoutContext';
import type { AdminBreadcrumb } from '@/lib/navigation';

export function AdminPageHeader({
  title,
  breadcrumbs = [],
}: {
  title: string;
  breadcrumbs?: AdminBreadcrumb[];
}) {
  const { setTitle, setBreadcrumbs } = useAdminLayout();

  const breadcrumbsKey = breadcrumbs.map((item) => `${item.label}:${item.href ?? ''}`).join('|');

  useEffect(() => {
    setTitle(title);
    setBreadcrumbs(breadcrumbs);
  }, [title, breadcrumbsKey, breadcrumbs, setTitle, setBreadcrumbs]);

  return null;
}
