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

import { cn } from '@/lib/utils';

import { useEditorToolbarState } from './useEditorToolbarState';

type ArticleEditorToolbarProps = {
  editor: Editor | null;
  onInsertProduct: () => void;
  onInsertCompare: () => void;
  formatDisabled?: boolean;
};

type ToolbarButtonProps = {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
};

function ToolbarSeparator(): React.JSX.Element {
  return <span className="mx-1 h-5 w-px shrink-0 bg-neutral-200" aria-hidden />;
}

function ToolbarButton({
  onClick,
  active = false,
  disabled = false,
  title,
  children,
}: ToolbarButtonProps): React.JSX.Element {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-focus-ring)] disabled:pointer-events-none disabled:opacity-40',
        active && 'bg-gray-100 text-gray-900',
      )}
    >
      {children}
    </button>
  );
}

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
    <div
      className={cn(
        'flex flex-1 flex-wrap items-center gap-0.5',
        formatDisabled && '[&_.format-control]:pointer-events-none [&_.format-control]:opacity-50',
      )}
    >
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

      <button
        type="button"
        title="Inserir produto (/produto)"
        aria-label="Inserir produto (/produto)"
        disabled={formatDisabled || !editor}
        onClick={onInsertProduct}
        className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-focus-ring)] disabled:pointer-events-none disabled:opacity-40"
      >
        <Package className="h-4 w-4" />
        <span className="hidden sm:inline">Produto</span>
      </button>
      <button
        type="button"
        title="Inserir tabela comparativa"
        aria-label="Inserir tabela comparativa"
        disabled={!formatDisabled && !editor}
        onClick={onInsertCompare}
        className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-focus-ring)] disabled:pointer-events-none disabled:opacity-40"
      >
        <Columns2 className="h-4 w-4" />
        <span className="hidden sm:inline">Comparar</span>
      </button>
    </div>
  );
}
