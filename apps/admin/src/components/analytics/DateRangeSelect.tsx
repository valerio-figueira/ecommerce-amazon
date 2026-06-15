'use client';

import { useRouter, useSearchParams } from 'next/navigation';

const PRESETS = [
  { id: '7d', label: '7 dias', days: 7 },
  { id: '30d', label: '30 dias', days: 30 },
  { id: '90d', label: '90 dias', days: 90 },
] as const;

export function DateRangeSelect(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activePreset = (() => {
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    if (!from || !to) return '30d';
    const fromMs = new Date(from).getTime();
    const toMs = new Date(to).getTime();
    const diffDays = Math.round((toMs - fromMs) / (24 * 60 * 60 * 1000));
    if (diffDays <= 8) return '7d';
    if (diffDays <= 35) return '30d';
    return '90d';
  })();

  const applyPreset = (days: number): void => {
    const to = new Date();
    const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
    const params = new URLSearchParams(searchParams.toString());
    params.set('from', from.toISOString());
    params.set('to', to.toISOString());
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-[color:var(--admin-text-muted)]">Período</span>
      {PRESETS.map((preset) => (
        <button
          key={preset.id}
          type="button"
          onClick={() => applyPreset(preset.days)}
          className={
            activePreset === preset.id
              ? 'rounded-full bg-[color:var(--admin-primary)] px-3 py-1 text-xs font-semibold text-white'
              : 'rounded-full border border-[color:var(--admin-border)] px-3 py-1 text-xs font-medium text-[color:var(--admin-navy)] hover:bg-[color:var(--admin-surface-muted)]'
          }
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}
