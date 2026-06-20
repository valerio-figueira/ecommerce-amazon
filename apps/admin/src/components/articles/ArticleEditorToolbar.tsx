'use client';

import type { Editor } from '@tiptap/react';
import {
  Bold,
  Columns2,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Package,
  Strikethrough,
} from 'lucide-react';

import {
  ToolbarButton,
  ToolbarSeparator,
  ToolbarTextButton,
} from '@/components/editor/toolbar-primitives';
import { useEditorToolbarState } from '@/components/editor/useEditorToolbarState';
import { cn } from '@/lib/utils';

type ArticleEditorToolbarProps = {
  editor: Editor | null;
  onInsertProduct: () => void;
  onInsertCompare: () => void;
  formatDisabled?: boolean;
};

export function ArticleEditorToolbar({
  editor,
  onInsertProduct,
  onInsertCompare,
  formatDisabled = false,
}: ArticleEditorToolbarProps): React.JSX.Element {
  useEditorToolbarState(editor);

  const run = (command: () => void): void => {
    if (!editor || formatDisabled) return;
    command();
  };

  return (
    <div className={cn('admin-rich-editor__toolbar', formatDisabled && 'is-format-disabled')}>
      <ToolbarButton
        title="Título H2"
        active={editor?.isActive('heading', { level: 2 }) ?? false}
        disabled={formatDisabled || !editor}
        onClick={() => run(() => editor?.chain().focus().toggleHeading({ level: 2 }).run())}
      >
        <Heading2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Título H3"
        active={editor?.isActive('heading', { level: 3 }) ?? false}
        disabled={formatDisabled || !editor}
        onClick={() => run(() => editor?.chain().focus().toggleHeading({ level: 3 }).run())}
      >
        <Heading3 className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarSeparator />

      <ToolbarButton
        title="Negrito"
        active={editor?.isActive('bold') ?? false}
        disabled={formatDisabled || !editor}
        onClick={() => run(() => editor?.chain().focus().toggleBold().run())}
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Itálico"
        active={editor?.isActive('italic') ?? false}
        disabled={formatDisabled || !editor}
        onClick={() => run(() => editor?.chain().focus().toggleItalic().run())}
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Riscado"
        active={editor?.isActive('strike') ?? false}
        disabled={formatDisabled || !editor}
        onClick={() => run(() => editor?.chain().focus().toggleStrike().run())}
      >
        <Strikethrough className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarSeparator />

      <ToolbarButton
        title="Lista marcada"
        active={editor?.isActive('bulletList') ?? false}
        disabled={formatDisabled || !editor}
        onClick={() => run(() => editor?.chain().focus().toggleBulletList().run())}
      >
        <List className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Lista numerada"
        active={editor?.isActive('orderedList') ?? false}
        disabled={formatDisabled || !editor}
        onClick={() => run(() => editor?.chain().focus().toggleOrderedList().run())}
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarSeparator />

      <ToolbarTextButton
        title="Inserir produto (/produto)"
        disabled={formatDisabled || !editor}
        onClick={onInsertProduct}
      >
        <Package className="h-4 w-4" />
        <span className="hidden sm:inline">Produto</span>
      </ToolbarTextButton>
      <ToolbarTextButton
        title="Inserir tabela comparativa"
        disabled={!formatDisabled && !editor}
        onClick={onInsertCompare}
      >
        <Columns2 className="h-4 w-4" />
        <span className="hidden sm:inline">Comparar</span>
      </ToolbarTextButton>
    </div>
  );
}
