'use client';

import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Package } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { listProductsClient, type ProductPickerOption } from '@/lib/api/cms-pages-client';

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

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({
        placeholder: 'Escreva o artigo… Digite /produto para inserir um card de afiliado.',
      }),
      ProductEmbedExtension,
    ],
    content: preprocessBodyForEditor(value),
    immediatelyRender: false,
    onUpdate: ({ editor: currentEditor }) => {
      onChange(serializeArticleBody(currentEditor.getHTML()));
      detectSlashProductCommand(currentEditor);
    },
  });

  useEffect(() => {
    void listProductsClient({ pageSize: 100 }).then(setProducts);
  }, []);

  useEffect(() => {
    if (!editor) return;
    const currentSerialized = serializeArticleBody(editor.getHTML());
    if (value !== currentSerialized) {
      editor.commands.setContent(preprocessBodyForEditor(value), { emitUpdate: false });
    }
  }, [editor, value]);

  function detectSlashProductCommand(currentEditor: NonNullable<typeof editor>): void {
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
  }

  function insertProduct(product: ProductPickerOption): void {
    if (!editor) return;
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
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(true)}>
          <Package className="mr-1 h-4 w-4" />
          Inserir produto (/produto)
        </Button>
      </div>

      <div className="min-h-[320px] rounded-lg border border-neutral-200 bg-white px-3 py-2">
        <EditorContent
          editor={editor}
          className="prose prose-sm max-w-none min-h-[280px] focus:outline-none [&_.ProseMirror]:min-h-[280px] [&_.ProseMirror]:outline-none"
        />
      </div>

      <ProductSearchModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        products={products}
        onSelect={insertProduct}
      />
    </div>
  );
}
