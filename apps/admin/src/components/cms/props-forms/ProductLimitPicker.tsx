'use client';

import type { Control } from 'react-hook-form';

import { LIMIT_PRESETS } from '@/components/cms/props-forms/dynamic-grid-form-meta';
import type { BlockFormValues } from '@/components/cms/forms/BlockPropsForm';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';

type ProductLimitPickerProps = {
  control: Control<BlockFormValues>;
};

function readLimit(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 8;
}

export function ProductLimitPicker({ control }: ProductLimitPickerProps): React.JSX.Element {
  return (
    <FormField
      control={control}
      name="limit"
      render={({ field }) => {
        const current = readLimit(field.value);
        const isPreset = LIMIT_PRESETS.some((preset) => preset === current);

        return (
          <FormItem>
            <FormLabel>Quantidade de produtos</FormLabel>
            <FormControl>
              <div className="flex flex-wrap gap-2">
                {LIMIT_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => field.onChange(preset)}
                    className={cn(
                      'cms-limit-chip',
                      current === preset && 'is-active',
                    )}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </FormControl>
            {!isPreset && (
              <p className="text-xs text-[var(--admin-text-muted)]">
                Valor atual: {current} produtos (escolha um preset acima para alterar).
              </p>
            )}
            <p className="text-xs text-[var(--admin-text-muted)]">
              Recomendado: 4 ou 8 para manter o site rápido.
            </p>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
