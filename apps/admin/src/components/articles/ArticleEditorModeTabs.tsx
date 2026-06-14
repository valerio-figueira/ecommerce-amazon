'use client';

import { cn } from '@/lib/utils';

export type ArticleEditorMode = 'visual' | 'html';

type ArticleEditorModeTabsProps = {
  mode: ArticleEditorMode;
  onModeChange: (mode: ArticleEditorMode) => void;
};

export function ArticleEditorModeTabs({
  mode,
  onModeChange,
}: ArticleEditorModeTabsProps): React.JSX.Element {
  return (
    <div
      className="ml-auto flex shrink-0 items-center rounded-md border border-neutral-200 bg-neutral-100 p-0.5"
      role="tablist"
      aria-label="Modo de edição do conteúdo"
    >
      <button
        type="button"
        role="tab"
        aria-selected={mode === 'visual'}
        onClick={() => onModeChange('visual')}
        className={cn(
          'rounded px-2.5 py-1 text-xs font-medium transition-colors',
          mode === 'visual'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-neutral-500 hover:text-neutral-700',
        )}
      >
        Visual
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === 'html'}
        onClick={() => onModeChange('html')}
        className={cn(
          'rounded px-2.5 py-1 text-xs font-medium transition-colors',
          mode === 'html'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-neutral-500 hover:text-neutral-700',
        )}
      >
        Código HTML
      </button>
    </div>
  );
}
