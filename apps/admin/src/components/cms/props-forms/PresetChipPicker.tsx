'use client';

import type { Control } from 'react-hook-form';

import type { BlockFormValues } from '@/components/cms/forms/BlockPropsForm';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';

type PresetChipPickerProps = {
  control: Control<BlockFormValues>;
  name: string;
  label: string;
  presets: readonly number[];
  hint?: string;
};

function readNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

export function PresetChipPicker({
  control,
  name,
  label,
  presets,
  hint,
}: PresetChipPickerProps): React.JSX.Element {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const current = readNumber(field.value, presets[0] ?? 8);
        const isPreset = presets.some((preset) => preset === current);

        return (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <div className="flex flex-wrap gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => field.onChange(preset)}
                    className={cn('cms-limit-chip', current === preset && 'is-active')}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </FormControl>
            {!isPreset && (
              <p className="text-xs text-[var(--admin-text-muted)]">
                Valor atual: {current} (escolha um preset acima para alterar).
              </p>
            )}
            {hint && <p className="text-xs text-[var(--admin-text-muted)]">{hint}</p>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
