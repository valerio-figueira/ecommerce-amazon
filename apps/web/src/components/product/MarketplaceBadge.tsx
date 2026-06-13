import { cn } from '@/lib/utils';
import { marketplaceLabel } from '@/lib/format';

type MarketplaceBadgeProps = {
  marketplace: string;
  className?: string;
};

export function MarketplaceBadge({ marketplace, className }: MarketplaceBadgeProps): React.JSX.Element {
  return (
    <span
      className={cn(
        'inline-flex rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-700',
        className,
      )}
    >
      {marketplaceLabel(marketplace)}
    </span>
  );
}
