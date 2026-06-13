'use client';

import type { Control } from 'react-hook-form';

import { Input, Textarea } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

export type BlockFormValues = Record<string, unknown>;

function readString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

export function SpacerFormFields({
  control,
}: {
  control: Control<BlockFormValues>;
}): React.JSX.Element {
  return (
    <FormField
      control={control}
      name="size"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tamanho</FormLabel>
          <Select onValueChange={field.onChange} value={readString(field.value) || 'md'}>
            <FormControl>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="sm">Pequeno</SelectItem>
              <SelectItem value="md">Médio</SelectItem>
              <SelectItem value="lg">Grande</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function BannerFormFields({
  control,
}: {
  control: Control<BlockFormValues>;
}): React.JSX.Element {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="imageUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>URL da imagem</FormLabel>
            <FormControl>
              <Input {...field} value={readString(field.value)} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="href"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Link de destino</FormLabel>
            <FormControl>
              <Input {...field} value={readString(field.value)} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="alt"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Texto alternativo</FormLabel>
            <FormControl>
              <Input {...field} value={readString(field.value)} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

export function RichTextFormFields({
  control,
}: {
  control: Control<BlockFormValues>;
}): React.JSX.Element {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="html"
        render={({ field }) => (
          <FormItem>
            <FormLabel>HTML</FormLabel>
            <FormControl>
              <Textarea rows={8} {...field} value={readString(field.value)} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="align"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Alinhamento</FormLabel>
            <Select onValueChange={field.onChange} value={readString(field.value) || 'left'}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="left">Esquerda</SelectItem>
                <SelectItem value="center">Centro</SelectItem>
                <SelectItem value="right">Direita</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

export function UnsupportedBlockForm({ props }: { props: unknown }): React.JSX.Element {
  return (
    <div className="space-y-3">
      <p className="text-sm text-[var(--admin-text-muted)]">
        Formulário deste tipo em desenvolvimento. Props atuais:
      </p>
      <pre className="max-h-64 overflow-auto rounded-md bg-[var(--admin-bg)] p-3 text-xs">
        {JSON.stringify(props, null, 2)}
      </pre>
    </div>
  );
}
