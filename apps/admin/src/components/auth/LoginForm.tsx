'use client';

import { useSearchParams } from 'next/navigation';
import { FormEvent, useState } from 'react';

import { cn } from '@/lib/utils';

export function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        let errorMessage = 'E-mail ou senha inválidos';
        try {
          const body: unknown = await response.json();
          if (
            typeof body === 'object' &&
            body !== null &&
            'error' in body &&
            typeof body.error === 'string'
          ) {
            errorMessage = body.error;
          }
        } catch {
          // keep default message
        }
        setError(errorMessage);
        return;
      }

      const next = searchParams.get('next') ?? '/';
      window.location.assign(next);
    } catch {
      setError('Não foi possível conectar ao servidor. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="admin-login-wrapper flex min-h-screen flex-col items-center justify-center px-4 py-8">
        <div className="admin-login-box w-full max-w-[24rem] rounded-[15px] border border-[color:rgba(24,42,90,0.12)] bg-[color:var(--admin-surface)] p-9 shadow-[0_0.35rem_1.25rem_var(--admin-shadow),0_1.25rem_2.5rem_rgba(24,42,90,0.07)]">
          <div className="admin-login-head mb-6 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-[color:var(--admin-navy)] text-sm font-bold text-white">
              V
            </div>
            <div>
              <h1 className="main-title text-xl font-bold text-[color:var(--admin-navy)]">Vitrine</h1>
              <p className="subtitle text-sm text-[color:var(--admin-text-muted)]">Painel CMS</p>
            </div>
          </div>

          <form className="admin-login-form space-y-4" onSubmit={(event) => void handleSubmit(event)}>
            <div className="box w-full">
              <label className="sr-only" htmlFor="email">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                name="email"
                autoComplete="username"
                placeholder="E-mail"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-[color:var(--admin-gray)] px-3 py-2.5 text-[color:var(--admin-navy)] outline-none focus:border-[color:var(--admin-primary)] focus:ring-2 focus:ring-[color:var(--admin-focus-ring)]"
              />
            </div>
            <div className="box w-full">
              <label className="sr-only" htmlFor="password">
                Senha
              </label>
              <input
                id="password"
                type="password"
                name="password"
                autoComplete="current-password"
                placeholder="Senha"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-[color:var(--admin-gray)] px-3 py-2.5 text-[color:var(--admin-navy)] outline-none focus:border-[color:var(--admin-primary)] focus:ring-2 focus:ring-[color:var(--admin-focus-ring)]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={cn(
                'w-full rounded-lg bg-[color:var(--admin-primary)] px-4 py-2.5 text-sm font-semibold text-white transition-colors',
                'hover:bg-[color:var(--admin-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60',
              )}
            >
              {loading ? 'Entrando…' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="admin-flash-toast-container fixed bottom-4 right-4 z-[1100] max-w-sm rounded-lg border border-[#dadce0] bg-white p-4 shadow-lg"
        >
          <div className="admin-gcp-toast flex gap-3 border-l-4 border-[#d93025] pl-3">
            <div>
              <p className="text-sm font-semibold text-[#3c4043]">Erro</p>
              <p className="mt-1 text-sm text-[#3c4043]">{error}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
