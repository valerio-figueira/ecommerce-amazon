import { cn } from '@/lib/utils';

function Table({ className, ...props }: React.HTMLAttributes<HTMLTableElement>): React.JSX.Element {
  return (
    <div className="relative w-full overflow-auto">
      <table className={cn('w-full caption-bottom text-sm', className)} {...props} />
    </div>
  );
}

function TableHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>): React.JSX.Element {
  return <thead className={cn('[&_tr]:border-b', className)} {...props} />;
}

function TableBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>): React.JSX.Element {
  return <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} />;
}

function TableFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>): React.JSX.Element {
  return (
    <tfoot
      className={cn('border-t bg-neutral-50/80 font-medium [&>tr]:last:border-b-0', className)}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>): React.JSX.Element {
  return (
    <tr
      className={cn('border-b border-neutral-200 transition-colors hover:bg-neutral-50/50', className)}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>): React.JSX.Element {
  return (
    <th
      className={cn(
        'h-10 px-3 text-left align-middle text-xs font-semibold uppercase tracking-wide text-neutral-500',
        className,
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>): React.JSX.Element {
  return <td className={cn('px-3 py-3 align-top text-sm text-neutral-800', className)} {...props} />;
}

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell };
