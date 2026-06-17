'use client';

import { cn } from '@/lib/utils';

export type ToolbarButtonProps = {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
  className?: string;
};

export function ToolbarSeparator(): React.JSX.Element {
  return <span className="admin-rich-editor__toolbar-separator" aria-hidden />;
}

export function ToolbarButton({
  onClick,
  active = false,
  disabled = false,
  title,
  children,
  className,
}: ToolbarButtonProps): React.JSX.Element {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'admin-rich-editor__toolbar-button',
        active && 'is-active',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function ToolbarTextButton({
  onClick,
  disabled = false,
  title,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      className="admin-rich-editor__toolbar-text-button"
    >
      {children}
    </button>
  );
}
