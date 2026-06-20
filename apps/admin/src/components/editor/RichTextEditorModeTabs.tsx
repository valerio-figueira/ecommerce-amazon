'use client';

import { cn } from '@/lib/utils';

export type RichTextEditorMode = 'visual' | 'html';

type RichTextEditorModeTabsProps = {
  mode: RichTextEditorMode;
  onModeChange: (mode: RichTextEditorMode) => void;
};

export function RichTextEditorModeTabs({
  mode,
  onModeChange,
}: RichTextEditorModeTabsProps): React.JSX.Element {
  return (
    <div
      className="admin-rich-editor__mode-tabs"
      role="tablist"
      aria-label="Modo de edição do conteúdo"
    >
      <button
        type="button"
        role="tab"
        aria-selected={mode === 'visual'}
        onClick={() => onModeChange('visual')}
        className={cn('admin-rich-editor__mode-tab', mode === 'visual' && 'is-active')}
      >
        Visual
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === 'html'}
        onClick={() => onModeChange('html')}
        className={cn('admin-rich-editor__mode-tab', mode === 'html' && 'is-active')}
      >
        Código HTML
      </button>
    </div>
  );
}
