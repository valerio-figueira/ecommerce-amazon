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

import { ProductSearchModal } from '@/components/articles/ProductSearchModal';
import {
  preprocessBodyForEditor,
  ProductEmbedExtension,
  serializeArticleBody as serializeProductEmbeds,
} from '@/components/articles/extensions/ProductEmbedExtension';
import { RichTextEditorHtmlPane } from '@/components/editor/RichTextEditorHtmlPane';
import type { RichTextEditorMode } from '@/components/editor/RichTextEditorModeTabs';
import { normalizeEmptyHtml } from '@/components/editor/normalize-empty-html';
import { RichTextEditorShell } from '@/components/editor/RichTextEditorShell';
import { ProductEditorToolbar } from '@/components/products/ProductEditorToolbar';
import { listProductsClient, type ProductPickerOption } from '@/lib/api/cms-pages-client';

type ProductLongDescriptionEditorProps = {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
};

function serializeEditorHtml(html: string): string {
  return normalizeEmptyHtml(serializeProductEmbeds(html));
}

function toEditorContent(value: string): string {
  const preprocessed = preprocessBodyForEditor(value.trim());
  return preprocessed.length > 0 ? preprocessed : '<p></p>';
}

export function ProductLongDescriptionEditor({
  value,
  onChange,
  disabled = false,
}: ProductLongDescriptionEditorProps): React.JSX.Element {
  const [products, setProducts] = useState<ProductPickerOption[]>([]);
  const [productModalOpen, setProductModalOpen] = useState(false);
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
          'Escreva a análise editorial… Digite /produto para inserir cards de afiliado ou use o botão Produto na toolbar.',
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      ProductEmbedExtension,
    ],
    content: toEditorContent(value),
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor: currentEditor }) => {
      if (modeRef.current !== 'visual') return;
      onChange(serializeEditorHtml(currentEditor.getHTML()));
      const { from } = currentEditor.state.selection;
      const textBefore = currentEditor.state.doc.textBetween(Math.max(0, from - 8), from, '\n');
      if (textBefore.endsWith('/produto')) {
        currentEditor
          .chain()
          .focus()
          .deleteRange({ from: from - 8, to: from })
          .run();
        setProductModalOpen(true);
      }
    },
  });

  useEffect(() => {
    void listProductsClient({ pageSize: 100 }).then(setProducts);
  }, []);

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
    const currentHtml = serializeEditorHtml(editor.getHTML());
    if (value !== currentHtml) {
      editor.commands.setContent(toEditorContent(value), { emitUpdate: false });
    }
  }, [editor, value, mode, htmlDraft]);

  function handleModeChange(nextMode: RichTextEditorMode): void {
    if (nextMode === mode) return;

    if (nextMode === 'html') {
      const serialized = editor ? serializeEditorHtml(editor.getHTML()) : value;
      setHtmlDraft(serialized);
      setMode('html');
      return;
    }

    onChange(serializeEditorHtml(htmlDraft));
    if (editor) {
      editor.commands.setContent(toEditorContent(htmlDraft), { emitUpdate: false });
    }
    setMode('visual');
  }

  function handleHtmlChange(next: string): void {
    setHtmlDraft(next);
    onChange(serializeEditorHtml(next));
  }

  function insertProduct(product: ProductPickerOption): void {
    if (!editor || mode !== 'visual') return;
    editor
      .chain()
      .focus()
      .insertContent({
        type: 'productEmbed',
        attrs: { slug: product.slug, title: product.title },
      })
      .run();
    onChange(serializeEditorHtml(editor.getHTML()));
  }

  return (
    <>
      <RichTextEditorShell
        mode={mode}
        onModeChange={handleModeChange}
        toolbar={
          <ProductEditorToolbar
            editor={editor}
            {...(disabled ? {} : { onInsertProduct: () => setProductModalOpen(true) })}
            formatDisabled={mode === 'html' || disabled}
          />
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

      <ProductSearchModal
        open={productModalOpen}
        onOpenChange={setProductModalOpen}
        products={products}
        onSelect={insertProduct}
        title="Inserir produto na análise"
        description="Busque no catálogo local e insira um card de afiliado no corpo da review."
      />
    </>
  );
}
