import { formatSpecKey } from '@/lib/format-spec-key';

type ProductSpecsTableProps = {
  specs: Record<string, string>;
};

export function ProductSpecsTable({ specs }: ProductSpecsTableProps): React.JSX.Element | null {
  const entries = Object.entries(specs).filter(([, value]) => value.trim().length > 0);

  if (entries.length === 0) {
    return null;
  }

  return (
    <section className="mt-8">
      <h2 className="text-2xl font-bold text-neutral-900">Ficha técnica</h2>
      <div className="mt-4 overflow-hidden rounded-2xl border border-gray-100">
        <table className="w-full border-collapse text-left text-sm">
          <tbody>
            {entries.map(([key, value]) => (
              <tr key={key} className="border-b border-gray-100 even:bg-gray-50/50 last:border-b-0">
                <th
                  scope="row"
                  className="w-[40%] px-4 py-3 font-medium text-neutral-600 sm:w-[35%]"
                >
                  {formatSpecKey(key)}
                </th>
                <td className="px-4 py-3 text-neutral-800">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
