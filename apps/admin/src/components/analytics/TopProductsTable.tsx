import { Package } from 'lucide-react';
import Link from 'next/link';

import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { AdminPageCard } from '@/components/admin/AdminPageCard';
import { marketplaceLabel } from '@/lib/analytics/labels';

type TopProductsTableProps = {
  items: {
    productId: string;
    slug: string;
    title: string;
    marketplace: string;
    clickCount: number;
  }[];
};

export function TopProductsTable({ items }: TopProductsTableProps): React.JSX.Element {
  return (
    <AdminPageCard className="p-5">
      <h3 className="text-sm font-semibold text-[color:var(--admin-navy)]">Top 10 produtos</h3>
      {items.length === 0 ? (
        <AdminEmptyState
          icon={Package}
          title="Nenhum produto clicado"
          hint="O ranking será preenchido conforme os CTAs forem utilizados."
        />
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[color:var(--admin-border)] text-[color:var(--admin-text-muted)]">
                <th className="pb-2 pr-3 font-medium">#</th>
                <th className="pb-2 pr-3 font-medium">Produto</th>
                <th className="pb-2 pr-3 font-medium">Marketplace</th>
                <th className="pb-2 font-medium text-right">Cliques</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.productId} className="border-b border-[color:var(--admin-border)]">
                  <td className="py-2 pr-3 text-[color:var(--admin-text-muted)]">{index + 1}</td>
                  <td className="py-2 pr-3">
                    <Link
                      href={`/produtos/${item.slug}`}
                      className="font-medium text-[color:var(--admin-primary)] hover:underline"
                    >
                      {item.title}
                    </Link>
                  </td>
                  <td className="py-2 pr-3">{marketplaceLabel(item.marketplace)}</td>
                  <td className="py-2 text-right font-semibold">{item.clickCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminPageCard>
  );
}
