'use client';

import { Plus, Trash2 } from 'lucide-react';
import type { Control } from 'react-hook-form';
import { useFieldArray } from 'react-hook-form';

import type { AboutPageEditorFormValues } from '@/components/about/about-editor-types';
import { CmsFormSection } from '@/components/cms/props-forms/CmsFormSection';
import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input, Textarea } from '@/components/ui/input';

type AboutTrafficLinksFieldsProps = {
  control: Control<AboutPageEditorFormValues>;
};

export function AboutTrafficLinksFields({
  control,
}: AboutTrafficLinksFieldsProps): React.JSX.Element {
  const links = useFieldArray({
    control,
    name: 'content.trafficDirection.links',
  });

  return (
    <CmsFormSection title="Links de recirculação">
      <div className="space-y-4">
        {links.fields.map((item, linkIndex) => (
          <div key={item.id} className="rounded-lg border border-[var(--admin-gray)] p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-[var(--admin-navy-deep)]">
                Link {linkIndex + 1}
              </p>
              {links.fields.length > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => links.remove(linkIndex)}
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  Remover
                </Button>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <FormField
                control={control}
                name={`content.trafficDirection.links.${linkIndex}.label`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rótulo do botão</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={80} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name={`content.trafficDirection.links.${linkIndex}.href`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Caminho interno</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="/artigos" maxLength={256} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={control}
              name={`content.trafficDirection.links.${linkIndex}.description`}
              render={({ field }) => (
                <FormItem className="mt-3">
                  <FormLabel>Descrição (opcional)</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} maxLength={120} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ))}
      </div>

      {links.fields.length < 3 ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => links.append({ label: '', href: '/artigos', description: '' })}
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
          Adicionar link
        </Button>
      ) : null}
    </CmsFormSection>
  );
}

export function AboutTrafficDirectionPanel({
  control,
}: AboutTrafficLinksFieldsProps): React.JSX.Element {
  return (
    <>
      <CmsFormSection title="Próximos passos">
        <FormField
          control={control}
          name="content.trafficDirection.title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título da seção</FormLabel>
              <FormControl>
                <Input {...field} maxLength={120} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="content.trafficDirection.intro"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Introdução</FormLabel>
              <FormControl>
                <Textarea {...field} rows={3} maxLength={300} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CmsFormSection>

      <AboutTrafficLinksFields control={control} />
    </>
  );
}
