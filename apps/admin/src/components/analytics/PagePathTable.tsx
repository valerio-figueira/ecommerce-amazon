import { FileText } from 'lucide-react';

import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { AdminPageCard } from '@/components/admin/AdminPageCard';

type PagePathTableProps = {
  items: { pagePath: string; count: number }[];
};

export function PagePathTable({ items }: PagePathTableProps): React.JSX.Element {
  return (
    <AdminPageCard className="p-5">
      <h3 className="text-sm font-semibold text-[color:var(--admin-navy)]">Cliques por página</h3>
      {items.length === 0 ? (
        <AdminEmptyState
          icon={FileText}
          title="Sem page_path registrado"
          hint="Os CTAs enviam a rota onde o clique ocorreu."
        />
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[color:var(--admin-border)] text-[color:var(--admin-text-muted)]">
                <th className="pb-2 pr-3 font-medium">Rota</th>
                <th className="pb-2 font-medium text-right">Cliques</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.pagePath} className="border-b border-[color:var(--admin-border)]">
                  <td className="py-2 pr-3 font-mono text-xs">{item.pagePath}</td>
                  <td className="py-2 text-right font-semibold">{item.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminPageCard>
  );
}
