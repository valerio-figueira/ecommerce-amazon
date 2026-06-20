'use client';

import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableRow } from '@tiptap/extension-table-row';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useRef, useState } from 'react';

import { RichTextEditorHtmlPane } from '@/components/editor/RichTextEditorHtmlPane';
import type { RichTextEditorMode } from '@/components/editor/RichTextEditorModeTabs';
import { normalizeEmptyHtml } from '@/components/editor/normalize-empty-html';
import { RichTextEditorShell } from '@/components/editor/RichTextEditorShell';
import { ProductEditorToolbar } from '@/components/products/ProductEditorToolbar';

type ProductLongDescriptionEditorProps = {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
};

function toEditorContent(value: string): string {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : '<p></p>';
}

export function ProductLongDescriptionEditor({
  value,
  onChange,
  disabled = false,
}: ProductLongDescriptionEditorProps): React.JSX.Element {
  const [mode, setMode] = useState<RichTextEditorMode>('visual');
  const [htmlDraft, setHtmlDraft] = useState(value);
  const htmlTextareaRef = useRef<HTMLTextAreaElement>(null);
  const modeRef = useRef<RichTextEditorMode>(mode);
  modeRef.current = mode;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [3] },
        codeBlock: false,
      }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({
        placeholder:
          'Escreva a análise editorial… Use H3 para seções (Visão geral, Destaques e especificações…).',
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: toEditorContent(value),
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor: currentEditor }) => {
      if (modeRef.current !== 'visual') return;
      onChange(normalizeEmptyHtml(currentEditor.getHTML()));
    },
  });

  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled);
    }
  }, [editor, disabled]);

  useEffect(() => {
    if (mode === 'html') {
      if (value !== htmlDraft) {
        setHtmlDraft(value);
      }
      return;
    }

    if (!editor) return;
    const currentHtml = normalizeEmptyHtml(editor.getHTML());
    if (value !== currentHtml) {
      editor.commands.setContent(toEditorContent(value), { emitUpdate: false });
    }
  }, [editor, value, mode, htmlDraft]);

  function handleModeChange(nextMode: RichTextEditorMode): void {
    if (nextMode === mode) return;

    if (nextMode === 'html') {
      const serialized = editor ? normalizeEmptyHtml(editor.getHTML()) : value;
      setHtmlDraft(serialized);
      setMode('html');
      return;
    }

    onChange(normalizeEmptyHtml(htmlDraft));
    if (editor) {
      editor.commands.setContent(toEditorContent(htmlDraft), { emitUpdate: false });
    }
    setMode('visual');
  }

  function handleHtmlChange(next: string): void {
    setHtmlDraft(next);
    onChange(normalizeEmptyHtml(next));
  }

  return (
    <RichTextEditorShell
      mode={mode}
      onModeChange={handleModeChange}
      toolbar={
        <ProductEditorToolbar editor={editor} formatDisabled={mode === 'html' || disabled} />
      }
      visualContent={
        <EditorContent
          editor={editor}
          className="admin-rich-editor__prose admin-rich-editor__prose--product"
        />
      }
      htmlContent={
        <RichTextEditorHtmlPane
          ref={htmlTextareaRef}
          value={htmlDraft}
          onChange={handleHtmlChange}
          ariaLabel="Código HTML da análise editorial"
          disabled={disabled}
        />
      }
    />
  );
}
