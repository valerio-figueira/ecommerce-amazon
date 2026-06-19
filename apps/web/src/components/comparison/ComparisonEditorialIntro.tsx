'use client';

import { useId, useState } from 'react';

import { cn } from '@/lib/utils';

type ComparisonEditorialIntroProps = {
  text: string;
  /** When true, intro starts collapsed with fade-out and toggle control. */
  collapsible?: boolean;
  className?: string;
};

export function ComparisonEditorialIntro({
  text,
  collapsible = true,
  className,
}: ComparisonEditorialIntroProps): React.JSX.Element {
  const [expanded, setExpanded] = useState(false);
  const contentId = useId();

  const proseClassName =
    'prose prose-neutral max-w-none whitespace-pre-line text-sm leading-relaxed text-neutral-700 sm:text-base';

  if (!collapsible) {
    return <div className={cn(proseClassName, className)}>{text}</div>;
  }

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <div
          id={contentId}
          className={cn(
            proseClassName,
            'transition-[max-height] duration-300 ease-in-out',
            expanded ? 'max-h-none overflow-visible' : 'max-h-32 overflow-hidden',
          )}
        >
          {text}
        </div>

        {!expanded ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[var(--background)] to-transparent"
          />
        ) : null}
      </div>

      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={contentId}
        onClick={() => setExpanded((previous) => !previous)}
        className="relative mt-2 flex items-center gap-1 text-sm font-semibold text-neutral-900 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
      >
        {expanded ? 'Ler menos ▲' : 'Ler descrição completa ▼'}
      </button>
    </div>
  );
}
