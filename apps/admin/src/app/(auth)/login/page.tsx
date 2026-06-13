import { Suspense } from 'react';

import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="admin-login-page min-h-screen" />}>
      <LoginForm />
    </Suspense>
  );
}
