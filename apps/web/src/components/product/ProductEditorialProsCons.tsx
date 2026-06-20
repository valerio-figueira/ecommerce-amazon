import { Check, X } from 'lucide-react';

import { cn } from '@/lib/utils';

type ProductEditorialProsConsProps = {
  pros?: string[] | undefined;
  cons?: string[] | undefined;
  maxPros?: number;
  maxCons?: number;
  className?: string;
};

export function ProductEditorialProsCons({
  pros = [],
  cons = [],
  maxPros = 2,
  maxCons = 1,
  className,
}: ProductEditorialProsConsProps): React.JSX.Element | null {
  const visiblePros = pros
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, maxPros);
  const visibleCons = cons
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, maxCons);

  if (visiblePros.length === 0 && visibleCons.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-1.5 sm:space-y-2', className)}>
      {visiblePros.length > 0 ? (
        <ul className="m-0 list-none space-y-1 p-0">
          {visiblePros.map((item) => (
            <li key={item} className="flex items-start gap-2 text-neutral-700">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {visibleCons.length > 0 ? (
        <ul className="m-0 list-none space-y-1 p-0">
          {visibleCons.map((item) => (
            <li key={item} className="flex items-start gap-2 text-neutral-600">
              <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-400" aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
