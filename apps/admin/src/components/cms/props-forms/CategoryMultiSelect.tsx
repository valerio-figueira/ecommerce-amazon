'use client';

import { getCategoryDisplayLabel } from '@/components/cms/props-forms/dynamic-grid-form-meta';
import { cn } from '@/lib/utils';

type CategoryOption = { slug: string; label: string };

type CategoryMultiSelectProps = {
  categories: CategoryOption[];
  value: string[];
  onChange: (slugs: string[]) => void;
};

export function CategoryMultiSelect({
  categories,
  value,
  onChange,
}: CategoryMultiSelectProps): React.JSX.Element {
  function toggle(slug: string): void {
    if (value.includes(slug)) {
      onChange(value.filter((item) => item !== slug));
      return;
    }
    onChange([...value, slug]);
  }

  function moveUp(index: number): void {
    if (index <= 0) return;
    const next = [...value];
    const current = next[index];
    const previous = next[index - 1];
    if (!current || !previous) return;
    next[index - 1] = current;
    next[index] = previous;
    onChange(next);
  }

  function moveDown(index: number): void {
    if (index >= value.length - 1) return;
    const next = [...value];
    const current = next[index];
    const following = next[index + 1];
    if (!current || !following) return;
    next[index + 1] = current;
    next[index] = following;
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <div className="cms-category-checklist">
        {categories.map((category) => {
          const checked = value.includes(category.slug);
          const order = value.indexOf(category.slug);
          return (
            <label
              key={category.slug}
              className={cn('cms-category-check-item', checked && 'is-checked')}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(category.slug)}
                className="h-4 w-4 accent-[var(--admin-primary)]"
              />
              <span className="flex-1 text-sm">
                {getCategoryDisplayLabel(category.slug, category.label)}
              </span>
              {checked && <span className="cms-category-order-badge">{order + 1}</span>}
            </label>
          );
        })}
      </div>

      {value.length > 0 && (
        <div className="space-y-1.5 rounded-lg border border-[var(--admin-gray)] bg-[var(--admin-bg)] p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-text-muted)]">
            Ordem na faixa
          </p>
          {value.map((slug, index) => {
            const category = categories.find((item) => item.slug === slug);
            return (
              <div key={slug} className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate">
                  {index + 1}. {category ? getCategoryDisplayLabel(slug, category.label) : slug}
                </span>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    className="cms-order-nudge-btn"
                    disabled={index === 0}
                    onClick={() => moveUp(index)}
                    aria-label="Mover para cima"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="cms-order-nudge-btn"
                    disabled={index === value.length - 1}
                    onClick={() => moveDown(index)}
                    aria-label="Mover para baixo"
                  >
                    ↓
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
