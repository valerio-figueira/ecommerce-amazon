'use client';

import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useRef, useState } from 'react';

import { RichTextEditorHtmlPane } from '@/components/editor/RichTextEditorHtmlPane';
import {
  RichTextEditorShell,
} from '@/components/editor/RichTextEditorShell';
import type { RichTextEditorMode } from '@/components/editor/RichTextEditorModeTabs';
import { listProductsClient, type ProductPickerOption } from '@/lib/api/cms-pages-client';

import { ArticleEditorToolbar } from './ArticleEditorToolbar';
import { CompareInsertModal } from './CompareInsertModal';
import {
  buildCompareShortcode,
  insertTextAtCursor,
  preprocessBodyForEditor,
  serializeArticleBody,
} from './extensions/article-body-serialize';
import { CompareEmbedExtension } from './extensions/CompareEmbedExtension';
import { ProductEmbedExtension } from './extensions/ProductEmbedExtension';
import { ProductSearchModal } from './ProductSearchModal';

type ArticleEditorProps = {
  value: string;
  onChange: (html: string) => void;
};

export function ArticleEditor({ value, onChange }: ArticleEditorProps): React.JSX.Element {
  const [products, setProducts] = useState<ProductPickerOption[]>([]);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [mode, setMode] = useState<RichTextEditorMode>('visual');
  const [htmlDraft, setHtmlDraft] = useState(value);
  const htmlTextareaRef = useRef<HTMLTextAreaElement>(null);
  const modeRef = useRef<RichTextEditorMode>(mode);
  modeRef.current = mode;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({
        placeholder:
          'Escreva o artigo… Digite /produto para inserir um card de afiliado ou use Comparar para tabelas.',
      }),
      ProductEmbedExtension,
      CompareEmbedExtension,
    ],
    content: preprocessBodyForEditor(value),
    immediatelyRender: false,
    onUpdate: ({ editor: currentEditor }) => {
      if (modeRef.current !== 'visual') return;
      onChange(serializeArticleBody(currentEditor.getHTML()));
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
    if (mode === 'html') {
      if (value !== htmlDraft) {
        setHtmlDraft(value);
      }
      return;
    }

    if (!editor) return;
    const currentSerialized = serializeArticleBody(editor.getHTML());
    if (value !== currentSerialized) {
      editor.commands.setContent(preprocessBodyForEditor(value), { emitUpdate: false });
    }
  }, [editor, value, mode, htmlDraft]);

  function handleModeChange(nextMode: RichTextEditorMode): void {
    if (nextMode === mode) return;

    if (nextMode === 'html') {
      const serialized = editor
        ? serializeArticleBody(editor.getHTML())
        : value;
      setHtmlDraft(serialized);
      setMode('html');
      return;
    }

    onChange(htmlDraft);
    if (editor) {
      editor.commands.setContent(preprocessBodyForEditor(htmlDraft), { emitUpdate: false });
    }
    setMode('visual');
  }

  function handleHtmlChange(next: string): void {
    setHtmlDraft(next);
    onChange(next);
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
    onChange(serializeArticleBody(editor.getHTML()));
  }

  function insertCompare(slugs: string[]): void {
    const shortcode = buildCompareShortcode(slugs);
    const label = slugs.join(', ');

    if (mode === 'html') {
      const textarea = htmlTextareaRef.current;
      if (!textarea) {
        const next = `${htmlDraft}${shortcode}`;
        setHtmlDraft(next);
        onChange(next);
        return;
      }
      const next = insertTextAtCursor(textarea, shortcode);
      setHtmlDraft(next);
      onChange(next);
      return;
    }

    if (!editor) return;
    editor
      .chain()
      .focus()
      .insertContent({
        type: 'compareEmbed',
        attrs: { slugs: slugs.join(','), label },
      })
      .run();
    onChange(serializeArticleBody(editor.getHTML()));
  }

  return (
    <>
      <RichTextEditorShell
        mode={mode}
        onModeChange={handleModeChange}
        toolbar={
          <ArticleEditorToolbar
            editor={editor}
            onInsertProduct={() => setProductModalOpen(true)}
            onInsertCompare={() => setCompareModalOpen(true)}
            formatDisabled={mode === 'html'}
          />
        }
        visualContent={
          <EditorContent editor={editor} className="admin-rich-editor__prose admin-rich-editor__prose--article" />
        }
        htmlContent={
          <RichTextEditorHtmlPane
            ref={htmlTextareaRef}
            value={htmlDraft}
            onChange={handleHtmlChange}
            ariaLabel="Código HTML do artigo"
          />
        }
      />

      <ProductSearchModal
        open={productModalOpen}
        onOpenChange={setProductModalOpen}
        products={products}
        onSelect={insertProduct}
      />
      <CompareInsertModal
        open={compareModalOpen}
        onOpenChange={setCompareModalOpen}
        products={products}
        onInsert={insertCompare}
      />
    </>
  );
}
