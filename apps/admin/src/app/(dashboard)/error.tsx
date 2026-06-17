'use client';

import Link from 'next/link';

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.JSX.Element {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4 rounded-lg border border-[color:var(--admin-gray)] bg-[color:var(--admin-surface)] p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-[color:var(--admin-navy)]">
        Não foi possível carregar esta página
      </h2>
      <p className="text-sm text-[color:var(--admin-text-muted)]">
        Ocorreu um erro inesperado. Tente novamente ou volte ao painel principal.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-lg bg-[color:var(--admin-primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[color:var(--admin-primary-hover)]"
        >
          Tentar novamente
        </button>
        <Link
          href="/"
          className="rounded-lg border border-[color:var(--admin-gray)] px-4 py-2 text-sm font-semibold text-[color:var(--admin-navy)] hover:bg-neutral-50"
        >
          Ir ao painel
        </Link>
      </div>
    </div>
  );
}
