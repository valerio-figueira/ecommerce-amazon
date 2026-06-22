import Image from 'next/image';

import logo from '@/app/logo.png';
import { cn } from '@/lib/utils';

type AdminBrandMarkProps = {
  siteName: string;
  size?: 'sm' | 'md';
  className?: string;
  priority?: boolean;
};

const SIZE_PX = {
  sm: 40,
  md: 44,
} as const;

export function AdminBrandMark({
  siteName,
  size = 'md',
  className,
  priority = false,
}: AdminBrandMarkProps): React.JSX.Element {
  const px = SIZE_PX[size];

  return (
    <Image
      src={logo}
      alt={siteName}
      width={px}
      height={px}
      priority={priority}
      className={cn(
        'shrink-0 rounded-lg object-contain',
        size === 'sm' ? 'size-10' : 'size-11',
        className,
      )}
    />
  );
}
