'use client';

import { CircleHelp } from 'lucide-react';

type CollectionFieldHintProps = {
  text: string;
};

export function CollectionFieldHint({ text }: CollectionFieldHintProps): React.JSX.Element {
  return (
    <button
      type="button"
      title={text}
      aria-label={text}
      className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[var(--admin-text-muted)] transition-colors hover:bg-[var(--admin-accent-subtle)] hover:text-[var(--admin-navy)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-focus-ring)]"
    >
      <CircleHelp className="h-3.5 w-3.5" />
    </button>
  );
}
