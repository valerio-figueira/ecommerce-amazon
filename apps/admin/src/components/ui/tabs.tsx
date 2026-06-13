'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

type TabsContextValue = {
  value: string;
  onValueChange: (value: string) => void;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext(): TabsContextValue {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within Tabs');
  }
  return context;
}

type TabsProps = {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
};

export function Tabs({ value, onValueChange, children, className }: TabsProps): React.JSX.Element {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={cn('space-y-6', className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}): React.JSX.Element {
  return (
    <div
      role="tablist"
      className={cn(
        'flex flex-wrap gap-2 border-b border-[var(--admin-gray)] pb-3',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}): React.JSX.Element {
  const { value: activeValue, onValueChange } = useTabsContext();
  const isActive = activeValue === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => onValueChange(value)}
      className={cn(
        'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
        isActive
          ? 'bg-[var(--admin-navy)] text-white'
          : 'text-[var(--admin-text-muted)] hover:bg-[var(--admin-accent-subtle)] hover:text-[var(--admin-navy)]',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}): React.JSX.Element | null {
  const { value: activeValue } = useTabsContext();
  if (activeValue !== value) {
    return null;
  }

  return (
    <div role="tabpanel" className={cn('space-y-8', className)}>
      {children}
    </div>
  );
}
