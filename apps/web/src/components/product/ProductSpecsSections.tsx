import type { SpecGroup } from '@ecommerce-amazon/shared/product';
import { filterActiveSpecGroups } from '@ecommerce-amazon/shared/product';

type ProductSpecsSectionsProps = {
  specGroups: SpecGroup[];
};

export function ProductSpecsSections({
  specGroups,
}: ProductSpecsSectionsProps): React.JSX.Element | null {
  const activeGroups = filterActiveSpecGroups(specGroups);

  if (activeGroups.length === 0) {
    return null;
  }

  return (
    <section className="mt-8">
      <h2 className="text-2xl font-bold text-neutral-900">Ficha técnica</h2>
      <div className="mt-4 overflow-hidden rounded-2xl border border-gray-100 px-4 sm:px-6">
        {activeGroups.map((group) => (
          <details
            key={group.group_id}
            id={group.group_id}
            open={!group.is_collapsed_default}
            className="group border-b border-gray-100 last:border-b-0"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between py-4 font-semibold text-neutral-900 [&::-webkit-details-marker]:hidden">
              {group.group_title}
              <span aria-hidden className="transition-transform group-open:rotate-180">
                ▼
              </span>
            </summary>
            <div className="pb-4">
              <table className="w-full border-collapse text-left text-sm">
                <tbody>
                  {group.properties.map((property) => (
                    <tr
                      key={`${group.group_id}-${property.key}`}
                      className="border-b border-gray-100 even:bg-gray-50/50 last:border-b-0"
                    >
                      <th
                        scope="row"
                        className="w-[40%] px-4 py-3 font-medium text-neutral-600 sm:w-[35%]"
                      >
                        {property.key}
                      </th>
                      <td className="px-4 py-3 text-neutral-800">{property.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
