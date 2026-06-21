import { Suspense } from 'react';

import { LoginForm } from '@/components/auth/LoginForm';
import { getServerBrandConfig } from '@/lib/brand';

export default function LoginPage() {
  const brand = getServerBrandConfig();

  return (
    <Suspense fallback={<div className="admin-login-page min-h-screen" />}>
      <LoginForm siteName={brand.name} />
    </Suspense>
  );
}
