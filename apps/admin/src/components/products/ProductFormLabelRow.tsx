import { FieldHint } from '@/components/ui/field-hint';
import { SeoCharCounter } from '@/components/ui/seo-char-counter';

type ProductFormLabelRowProps = {
  hint?: string;
  charCount?: {
    value: string;
    limit: number;
  };
  children: React.ReactNode;
};

export function ProductFormLabelRow({
  hint,
  charCount,
  children,
}: ProductFormLabelRowProps): React.JSX.Element {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-2">
        {children}
        {hint ? <FieldHint text={hint} /> : null}
      </div>
      {charCount ? <SeoCharCounter value={charCount.value} limit={charCount.limit} /> : null}
    </div>
  );
}
