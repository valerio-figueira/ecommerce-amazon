import { ProductCardSkeleton } from '@/components/loading/ProductCardSkeleton';

type ProductGridSkeletonProps = {
  count?: number;
};

export function ProductGridSkeleton({ count = 8 }: ProductGridSkeletonProps): React.JSX.Element {
  return (
    <div
      className="grid grid-cols-2 gap-3 min-[550px]:grid-cols-3 min-[550px]:gap-4 min-[830px]:grid-cols-4"
      aria-hidden
    >
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} variant="compact" />
      ))}
    </div>
  );
}
