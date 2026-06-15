import { LayoutGrid } from 'lucide-react';

import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { AdminPageCard } from '@/components/admin/AdminPageCard';

type BlockAttributionTableProps = {
  items: {
    blockId: string;
    blockType: string;
    pageSlug: string;
    count: number;
  }[];
};

export function BlockAttributionTable({
  items,
}: BlockAttributionTableProps): React.JSX.Element {
  return (
    <AdminPageCard className="p-5">
      <h3 className="text-sm font-semibold text-[color:var(--admin-navy)]">
        Cliques por bloco CMS
      </h3>
      {items.length === 0 ? (
        <AdminEmptyState
          icon={LayoutGrid}
          title="Nenhum bloco com cliques"
          hint="Blocos CMS com CTAs de afiliado aparecerão aqui."
        />
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[color:var(--admin-border)] text-[color:var(--admin-text-muted)]">
                <th className="pb-2 pr-3 font-medium">Página</th>
                <th className="pb-2 pr-3 font-medium">Tipo do bloco</th>
                <th className="pb-2 font-medium text-right">Cliques</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.blockId} className="border-b border-[color:var(--admin-border)]">
                  <td className="py-2 pr-3 font-medium">/{item.pageSlug}</td>
                  <td className="py-2 pr-3 text-[color:var(--admin-text-muted)]">
                    {item.blockType}
                  </td>
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
