'use client';

import { forwardRef } from 'react';

import { Textarea } from '@/components/ui/input';

type RichTextEditorHtmlPaneProps = {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  rows?: number;
  disabled?: boolean;
};

export const RichTextEditorHtmlPane = forwardRef<HTMLTextAreaElement, RichTextEditorHtmlPaneProps>(
  function RichTextEditorHtmlPane(
    { value, onChange, ariaLabel, rows = 18, disabled = false },
    ref,
  ): React.JSX.Element {
    return (
      <Textarea
        ref={ref}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        spellCheck={false}
        rows={rows}
        disabled={disabled}
        className="admin-rich-editor__html-pane"
        aria-label={ariaLabel}
      />
    );
  },
);
