import { cn } from '@/lib/utils';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
};

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: ButtonProps): React.JSX.Element {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-full font-medium transition-colors',
        variant === 'primary' && 'bg-[var(--primary)] text-white hover:opacity-90',
        variant === 'outline' && 'border border-neutral-300 bg-white hover:bg-neutral-50',
        variant === 'ghost' && 'hover:bg-neutral-100',
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-5 py-2.5 text-sm',
        size === 'lg' && 'px-6 py-3 text-base',
        className,
      )}
      {...props}
    />
  );
}
