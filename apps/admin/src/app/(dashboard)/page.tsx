import { LayoutDashboard, Package, Ticket } from 'lucide-react';

import { AdminPageCard } from '@/components/admin/AdminPageCard';

export const metadata = {
  title: 'Painel — Vitrine CMS',
};

export default function DashboardPage() {
  const kpis = [
    { label: 'Páginas CMS', value: '—', hint: 'Editor em breve', icon: LayoutDashboard },
    { label: 'Produtos ativos', value: '—', hint: 'Catálogo via worker', icon: Package },
    { label: 'Cupons verificados', value: '—', hint: 'Pipeline D', icon: Ticket },
  ];

  return (
    <section className="admin-dashboard-board w-full max-w-[var(--admin-page-max-width)] space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <AdminPageCard key={kpi.label} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-[color:var(--admin-text-muted)]">{kpi.label}</p>
                  <p className="mt-1 text-3xl font-semibold text-[color:var(--admin-navy)]">
                    {kpi.value}
                  </p>
                  <p className="mt-2 text-xs text-[color:var(--admin-text-muted)]">{kpi.hint}</p>
                </div>
                <Icon className="size-5 text-[color:var(--admin-primary)]" aria-hidden="true" />
              </div>
            </AdminPageCard>
          );
        })}
      </div>

      <AdminPageCard>
        <h3 className="text-lg font-semibold text-[color:var(--admin-navy)]">Bem-vindo ao painel</h3>
        <p className="mt-2 text-sm text-[color:var(--admin-text-muted)]">
          Esta é a estrutura inicial do CMS interno. Use o menu lateral para navegar entre os módulos
          previstos no MVP — páginas, produtos, artigos, coleções e cupons.
        </p>
      </AdminPageCard>
    </section>
  );
}
