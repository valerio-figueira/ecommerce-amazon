import { Newspaper } from 'lucide-react';
import Link from 'next/link';

import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { AdminPageCard } from '@/components/admin/AdminPageCard';

type ConvertingArticlesTableProps = {
  items: {
    articleId: string;
    slug: string;
    title: string;
    clickCount: number;
  }[];
};

export function ConvertingArticlesTable({
  items,
}: ConvertingArticlesTableProps): React.JSX.Element {
  return (
    <AdminPageCard className="p-5">
      <h3 className="text-sm font-semibold text-[color:var(--admin-navy)]">
        Top artigos conversores
      </h3>
      <p className="mt-1 text-xs text-[color:var(--admin-text-muted)]">
        Cliques originados de embeds editoriais (`origin = embed`).
      </p>
      {items.length === 0 ? (
        <AdminEmptyState
          icon={Newspaper}
          title="Nenhum artigo conversor"
          hint="Publique artigos com embeds de produto para medir conversão editorial."
        />
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[color:var(--admin-border)] text-[color:var(--admin-text-muted)]">
                <th className="pb-2 pr-3 font-medium">#</th>
                <th className="pb-2 pr-3 font-medium">Artigo</th>
                <th className="pb-2 font-medium text-right">Cliques</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.articleId} className="border-b border-[color:var(--admin-border)]">
                  <td className="py-2 pr-3 text-[color:var(--admin-text-muted)]">{index + 1}</td>
                  <td className="py-2 pr-3">
                    <Link
                      href={`/artigos/${item.articleId}`}
                      className="font-medium text-[color:var(--admin-primary)] hover:underline"
                    >
                      {item.title}
                    </Link>
                  </td>
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
