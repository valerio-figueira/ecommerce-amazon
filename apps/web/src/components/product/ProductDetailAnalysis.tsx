import { Check, X } from 'lucide-react';

type ProductDetailAnalysisProps = {
  pros?: string[] | undefined;
  cons?: string[] | undefined;
};

function normalizeItems(items: string[] | undefined): string[] {
  return (items ?? []).map((item) => item.trim()).filter(Boolean);
}

export function ProductDetailAnalysis({
  pros,
  cons,
}: ProductDetailAnalysisProps): React.JSX.Element | null {
  const visiblePros = normalizeItems(pros);
  const visibleCons = normalizeItems(cons);

  if (visiblePros.length === 0 && visibleCons.length === 0) {
    return null;
  }

  return (
    <section className="mt-10 border-t border-gray-100 pt-8">
      <h2 className="text-2xl font-bold text-neutral-900">Análise do Especialista</h2>
      <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
        {visiblePros.length > 0 ? (
          <div className="rounded-2xl bg-emerald-50/30 p-6">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-emerald-700">
              Pontos positivos
            </h3>
            <ul className="m-0 list-none space-y-3 p-0">
              {visiblePros.map((item) => (
                <li key={item} className="flex items-start gap-3 text-neutral-700">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {visibleCons.length > 0 ? (
          <div className="rounded-2xl bg-rose-50/30 p-6">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-rose-700">
              Pontos de atenção
            </h3>
            <ul className="m-0 list-none space-y-3 p-0">
              {visibleCons.map((item) => (
                <li key={item} className="flex items-start gap-3 text-neutral-700">
                  <X className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
