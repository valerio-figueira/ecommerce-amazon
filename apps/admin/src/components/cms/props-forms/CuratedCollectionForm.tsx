'use client';

import { useEffect, useState } from 'react';
import type { Control } from 'react-hook-form';

import type { BlockFormValues } from '@/components/cms/forms/BlockPropsForm';
import { CmsFormSection } from '@/components/cms/props-forms/CmsFormSection';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { publicCollectionsResponseSchema } from '@ecommerce-amazon/shared/admin';

type CuratedCollectionFormProps = {
  control: Control<BlockFormValues>;
};

function readString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

export function CuratedCollectionForm({
  control,
}: CuratedCollectionFormProps): React.JSX.Element {
  const [collections, setCollections] = useState<
    Array<{ slug: string; title: string; coverImageUrl: string }>
  >([]);

  useEffect(() => {
    const apiUrl = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3000';
    void fetch(`${apiUrl}/collections`, { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) return;
        const payload: unknown = await response.json();
        const parsed = publicCollectionsResponseSchema.safeParse(payload);
        if (parsed.success) {
          setCollections(parsed.data.items);
        }
      })
      .catch(() => undefined);
  }, []);

  return (
    <div className="space-y-6">
      <CmsFormSection title="Coleção curada">
        <FormField
          control={control}
          name="collectionSlug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Qual coleção exibir?</FormLabel>
              <Select value={readString(field.value)} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha uma coleção" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {collections.length === 0 ? (
                    <SelectItem value="__empty__" disabled>
                      Nenhuma coleção cadastrada
                    </SelectItem>
                  ) : (
                    collections.map((collection) => (
                      <SelectItem key={collection.slug} value={collection.slug}>
                        {collection.title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormDescription>
                A coleção aparece na home com preview dos produtos e link para /colecoes/[slug].
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CmsFormSection>

      <CmsFormSection title="Layout" className="cms-form-section-divider">
        <FormField
          control={control}
          name="layout"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Como exibir os produtos?</FormLabel>
              <Select value={readString(field.value) || 'grid'} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="grid">Grade com capa e CTA</SelectItem>
                  <SelectItem value="carousel">Carrossel horizontal</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </CmsFormSection>
    </div>
  );
}
