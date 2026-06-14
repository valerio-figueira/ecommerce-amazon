'use client';

import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useAdminToast } from '@/components/ui/admin-toast';
import {
  createArticleCategoryClient,
  updateArticleCategoryClient,
} from '@/lib/api/article-categories-client';
import type { ArticleCategorySummary } from '@ecommerce-amazon/shared/admin';
import { slugifyTitle } from '@ecommerce-amazon/shared/marketplace';

type ArticleCategoryFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: ArticleCategorySummary | null;
  onSaved: () => Promise<void>;
};

export function ArticleCategoryFormSheet({
  open,
  onOpenChange,
  editing,
  onSaved,
}: ArticleCategoryFormSheetProps): React.JSX.Element {
  const adminToast = useAdminToast();
  const slugTouched = useRef(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    slugTouched.current = false;

    if (!editing) {
      setName('');
      setSlug('');
      return;
    }

    setName(editing.name);
    setSlug(editing.slug);
  }, [open, editing]);

  function handleNameChange(value: string): void {
    setName(value);
    if (!slugTouched.current) {
      setSlug(slugifyTitle(value));
    }
  }

  async function handleSave(): Promise<void> {
    setSaving(true);
    try {
      if (editing) {
        await updateArticleCategoryClient(editing.id, { name, slug });
        adminToast.success('Categoria atualizada.');
      } else {
        await createArticleCategoryClient({ name, slug });
        adminToast.success('Categoria criada.');
      }
      onOpenChange(false);
      await onSaved();
    } catch (error) {
      adminToast.error(error instanceof Error ? error.message : 'Falha ao salvar categoria');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{editing ? 'Editar categoria' : 'Nova categoria'}</SheetTitle>
          <SheetDescription>
            Categorias editoriais para artigos. O slug aparece no badge da vitrine pública.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="article-category-name">Nome</Label>
            <Input
              id="article-category-name"
              value={name}
              onChange={(event) => handleNameChange(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="article-category-slug">Slug</Label>
            <Input
              id="article-category-slug"
              value={slug}
              onChange={(event) => {
                slugTouched.current = true;
                setSlug(event.target.value);
              }}
              placeholder="ex: guias"
            />
          </div>
        </div>

        <SheetFooter className="mt-6">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" variant="primary" disabled={saving} onClick={() => void handleSave()}>
            {saving ? 'Salvando…' : editing ? 'Guardar' : 'Criar'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
