'use client';

import type { ReactNode } from 'react';

import {
  RichTextEditorModeTabs,
  type RichTextEditorMode,
} from '@/components/editor/RichTextEditorModeTabs';
import { cn } from '@/lib/utils';

type RichTextEditorShellProps = {
  toolbar: ReactNode;
  mode: RichTextEditorMode;
  onModeChange: (mode: RichTextEditorMode) => void;
  visualContent: ReactNode;
  htmlContent: ReactNode;
  className?: string;
  size?: 'default' | 'compact';
};

export function RichTextEditorShell({
  toolbar,
  mode,
  onModeChange,
  visualContent,
  htmlContent,
  className,
  size = 'default',
}: RichTextEditorShellProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'admin-rich-editor',
        size === 'compact' && 'admin-rich-editor--compact',
        className,
      )}
    >
      <div className="admin-rich-editor__toolbar-row">
        {toolbar}
        <RichTextEditorModeTabs mode={mode} onModeChange={onModeChange} />
      </div>

      <div className="admin-rich-editor__body">
        {mode === 'visual' ? visualContent : htmlContent}
      </div>
    </div>
  );
}
