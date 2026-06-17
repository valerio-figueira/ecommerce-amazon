import Link from 'next/link';

import { getServerBrandConfig } from '@/lib/brand';

const brand = getServerBrandConfig();

export default function ServicoIndisponivelPage(): React.JSX.Element {
  return (
    <div className="admin-login-page flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-[24rem] rounded-[15px] border border-[color:rgba(24,42,90,0.12)] bg-[color:var(--admin-surface)] p-9 shadow-[0_0.35rem_1.25rem_var(--admin-shadow),0_1.25rem_2.5rem_rgba(24,42,90,0.07)]">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-[color:var(--admin-navy)] text-sm font-bold text-white">
            {brand.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-[color:var(--admin-navy)]">{brand.name}</h1>
            <p className="text-sm text-[color:var(--admin-text-muted)]">Painel CMS</p>
          </div>
        </div>

        <h2 className="text-lg font-semibold text-[color:var(--admin-navy)]">
          Serviço temporariamente indisponível
        </h2>
        <p className="mt-2 text-sm text-[color:var(--admin-text-muted)]">
          Não foi possível acessar o painel neste momento. Tente novamente em instantes.
        </p>

        <div className="mt-6 flex flex-col gap-2">
          <Link
            href="/login"
            className="inline-flex w-full items-center justify-center rounded-lg bg-[color:var(--admin-primary)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[color:var(--admin-primary-hover)]"
          >
            Voltar ao login
          </Link>
          <Link
            href="/"
            className="inline-flex w-full items-center justify-center rounded-lg border border-[color:var(--admin-gray)] px-4 py-2.5 text-sm font-semibold text-[color:var(--admin-navy)] transition-colors hover:bg-neutral-50"
          >
            Tentar novamente
          </Link>
        </div>
      </div>
    </div>
  );
}
