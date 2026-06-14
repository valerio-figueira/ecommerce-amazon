'use client';

import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useRef, useState } from 'react';

import { Textarea } from '@/components/ui/input';
import { listProductsClient, type ProductPickerOption } from '@/lib/api/cms-pages-client';

import {
  ArticleEditorModeTabs,
  type ArticleEditorMode,
} from './ArticleEditorModeTabs';
import { ArticleEditorToolbar } from './ArticleEditorToolbar';
import {
  preprocessBodyForEditor,
  ProductEmbedExtension,
  serializeArticleBody,
} from './extensions/ProductEmbedExtension';
import { ProductSearchModal } from './ProductSearchModal';

type ArticleEditorProps = {
  value: string;
  onChange: (html: string) => void;
};

export function ArticleEditor({ value, onChange }: ArticleEditorProps): React.JSX.Element {
  const [products, setProducts] = useState<ProductPickerOption[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<ArticleEditorMode>('visual');
  const [htmlDraft, setHtmlDraft] = useState(value);
  const modeRef = useRef<ArticleEditorMode>(mode);
  modeRef.current = mode;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({
        placeholder: 'Escreva o artigo… Digite /produto para inserir um card de afiliado.',
      }),
      ProductEmbedExtension,
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
        setModalOpen(true);
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

  function handleModeChange(nextMode: ArticleEditorMode): void {
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

  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 bg-neutral-50 px-2 py-1.5">
        <ArticleEditorToolbar
          editor={editor}
          onInsertProduct={() => setModalOpen(true)}
          disabled={mode === 'html'}
        />
        <ArticleEditorModeTabs mode={mode} onModeChange={handleModeChange} />
      </div>

      {mode === 'visual' ? (
        <EditorContent
          editor={editor}
          className="prose prose-sm max-w-none px-3 py-2 focus:outline-none [&_.ProseMirror]:min-h-[320px] [&_.ProseMirror]:outline-none [&_.ProseMirror_h2]:text-lg [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h3]:text-base [&_.ProseMirror_h3]:font-semibold"
        />
      ) : (
        <Textarea
          value={htmlDraft}
          onChange={(event) => handleHtmlChange(event.target.value)}
          spellCheck={false}
          rows={18}
          className="min-h-[320px] resize-y rounded-none border-0 bg-gray-50 px-3 py-3 font-mono text-sm leading-relaxed text-neutral-800 whitespace-pre-wrap shadow-none focus-visible:ring-2 focus-visible:ring-[var(--admin-focus-ring)]"
          aria-label="Código HTML do artigo"
        />
      )}

      <ProductSearchModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        products={products}
        onSelect={insertProduct}
      />
    </div>
  );
}
