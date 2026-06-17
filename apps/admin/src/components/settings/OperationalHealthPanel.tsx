import Link from 'next/link';
import { Activity, ExternalLink } from 'lucide-react';

import type { OperationalStatusResponse } from '@ecommerce-amazon/shared/admin';

type OperationalHealthPanelProps = {
  status: OperationalStatusResponse;
};

export function OperationalHealthPanel({
  status,
}: OperationalHealthPanelProps): React.JSX.Element {
  return (
    <div className="cms-float-panel cms-blocks-panel">
      <p className="cms-blocks-panel__meta">
        Saúde da plataforma ·{' '}
        <strong>{status.affiliateGate.readyForScale ? 'Pronta para escala' : 'Bloqueada'}</strong>
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        <HealthChip label="Resend" ok={status.env.resendConfigured} />
        <HealthChip label="GA4 Data API" ok={status.env.ga4Configured} />
        <HealthChip label={`Storage: ${status.env.storageDriver}`} ok />
      </div>

      {!status.affiliateGate.readyForScale ? (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Contas pendentes: {status.affiliateGate.pendingMarketplaces.join(', ') || '—'}
        </p>
      ) : null}

      <div className="mb-4 flex flex-wrap gap-3 text-sm">
        <QuickLink href="/paginas" label="Páginas CMS" />
        <QuickLink href="/auto-links" label="Auto-Links" />
        <QuickLink href="/" label="Dashboard" />
      </div>

      <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-[var(--admin-text)]">
        <Activity className="h-4 w-4" />
        Últimas falhas de sync
      </h3>
      {status.recentSyncFailures.length === 0 ? (
        <p className="text-sm text-[var(--admin-text-muted)]">Nenhuma falha recente registrada.</p>
      ) : (
        <div className="cms-block-list space-y-2">
          {status.recentSyncFailures.map((job) => (
            <article key={job.id} className="cms-block-card cms-block-card--plain p-3 text-sm">
              <p className="font-medium text-[var(--admin-text)]">
                {job.jobType} · {job.itemsProcessed} itens
              </p>
              <p className="text-xs text-[var(--admin-text-muted)]">
                {new Date(job.startedAt).toLocaleString('pt-BR')}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function HealthChip({ label, ok = true }: { label: string; ok?: boolean }): React.JSX.Element {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        ok
          ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200'
          : 'bg-neutral-100 text-neutral-600 ring-1 ring-neutral-200'
      }`}
    >
      {label}
    </span>
  );
}

function QuickLink({ href, label }: { href: string; label: string }): React.JSX.Element {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-[var(--admin-primary)] hover:underline"
    >
      {label}
      <ExternalLink className="h-3.5 w-3.5" />
    </Link>
  );
}
