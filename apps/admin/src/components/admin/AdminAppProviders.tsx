'use client';

import type { ReactNode } from 'react';

import { AdminToastProvider } from '@/components/ui/admin-toast';

export function AdminAppProviders({ children }: { children: ReactNode }): React.JSX.Element {
  return <AdminToastProvider>{children}</AdminToastProvider>;
}
