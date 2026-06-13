import * as React from 'react';

import { cn } from '@/lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'flex h-9 w-full rounded-md border border-[var(--admin-gray)] bg-white px-3 py-1 text-sm text-[var(--admin-navy)] shadow-sm transition-colors placeholder:text-[var(--admin-text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-focus-ring)] disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'flex min-h-[96px] w-full rounded-md border border-[var(--admin-gray)] bg-white px-3 py-2 text-sm text-[var(--admin-navy)] shadow-sm transition-colors placeholder:text-[var(--admin-text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-focus-ring)] disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';
