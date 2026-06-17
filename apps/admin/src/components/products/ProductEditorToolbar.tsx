'use client';

import type { Editor } from '@tiptap/react';
import {
  Bold,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Strikethrough,
  Table2,
} from 'lucide-react';

import {
  ToolbarButton,
  ToolbarSeparator,
} from '@/components/editor/toolbar-primitives';
import { useEditorToolbarState } from '@/components/editor/useEditorToolbarState';
import { cn } from '@/lib/utils';

type ProductEditorToolbarProps = {
  editor: Editor | null;
  formatDisabled?: boolean;
};

export function ProductEditorToolbar({
  editor,
  formatDisabled = false,
}: ProductEditorToolbarProps): React.JSX.Element {
  useEditorToolbarState(editor);

  const run = (command: () => void): void => {
    if (!editor || formatDisabled) return;
    command();
  };

  function handleLink(): void {
    if (!editor || formatDisabled) return;

    const linkAttrs = editor.getAttributes('link');
    const previousUrl =
      typeof linkAttrs['href'] === 'string' ? linkAttrs['href'] : undefined;
    const url = window.prompt('URL do link', previousUrl ?? 'https://');
    if (url === null) return;

    if (url.trim() === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
  }

  return (
    <div
      className={cn(
        'admin-rich-editor__toolbar',
        formatDisabled && 'is-format-disabled',
      )}
    >
      <ToolbarButton
        title="Título de seção (H3)"
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

      <ToolbarButton
        title="Inserir tabela"
        active={editor?.isActive('table') ?? false}
        disabled={formatDisabled || !editor}
        onClick={() =>
          run(() =>
            editor
              ?.chain()
              .focus()
              .insertTable({ rows: 4, cols: 2, withHeaderRow: true })
              .run(),
          )
        }
      >
        <Table2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Inserir ou editar link"
        active={editor?.isActive('link') ?? false}
        disabled={formatDisabled || !editor}
        onClick={handleLink}
      >
        <Link2 className="h-4 w-4" />
      </ToolbarButton>
    </div>
  );
}
