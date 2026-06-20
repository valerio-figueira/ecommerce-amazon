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
import { Switch } from '@/components/ui/switch';
import { publicCollectionsResponseSchema } from '@ecommerce-amazon/shared/admin';

type CuratedCollectionFormProps = {
  control: Control<BlockFormValues>;
};

function readStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

function readBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

export function CuratedCollectionForm({ control }: CuratedCollectionFormProps): React.JSX.Element {
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
      <CmsFormSection title="Carrossel de coleções">
        <FormField
          control={control}
          name="collectionSlugs"
          render={({ field }) => {
            const selected = readStringArray(field.value);

            const toggleSlug = (slug: string, checked: boolean): void => {
              if (checked) {
                field.onChange([...selected, slug]);
                return;
              }

              field.onChange(selected.filter((value) => value !== slug));
            };

            return (
              <FormItem>
                <FormLabel>Quais coleções exibir?</FormLabel>
                <FormDescription>
                  Selecione uma ou mais coleções. A ordem segue a seleção. O bloco exibe um
                  carrossel editorial na home.
                </FormDescription>
                <div className="space-y-3 rounded-lg border border-neutral-200 p-3">
                  {collections.length === 0 ? (
                    <p className="text-sm text-neutral-500">Nenhuma coleção cadastrada.</p>
                  ) : (
                    collections.map((collection) => {
                      const checked = selected.includes(collection.slug);

                      return (
                        <label
                          key={collection.slug}
                          className="flex cursor-pointer items-start gap-3 rounded-md p-2 hover:bg-neutral-50"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(event) => toggleSlug(collection.slug, event.target.checked)}
                            className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-[var(--primary)] focus:ring-[var(--primary)]"
                          />
                          <span className="space-y-0.5">
                            <span className="block text-sm font-medium">{collection.title}</span>
                            <span className="block text-xs text-neutral-500">
                              /{collection.slug}
                            </span>
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>
                <FormMessage />
              </FormItem>
            );
          }}
        />
      </CmsFormSection>

      <CmsFormSection title="Comportamento" className="cms-form-section-divider">
        <FormField
          control={control}
          name="autoplay"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between gap-4 rounded-lg border border-neutral-200 p-3">
              <div className="space-y-1">
                <FormLabel>Avançar automaticamente</FormLabel>
                <FormDescription>
                  Troca de slide a cada 8 segundos quando há mais de uma coleção.
                </FormDescription>
              </div>
              <FormControl>
                <Switch checked={readBoolean(field.value, true)} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
      </CmsFormSection>
    </div>
  );
}
