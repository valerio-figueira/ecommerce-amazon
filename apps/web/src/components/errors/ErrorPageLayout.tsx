import { cn } from '@/lib/utils';

type ErrorPageLayoutProps = {
  statusCode?: number;
  title: string;
  description: string;
  children?: React.ReactNode;
  className?: string;
};

export function ErrorPageLayout({
  statusCode,
  title,
  description,
  children,
  className,
}: ErrorPageLayoutProps): React.JSX.Element {
  return (
    <main
      className={cn(
        'mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center',
        className,
      )}
    >
      {statusCode !== undefined && (
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-neutral-400">
          Erro {statusCode}
        </p>
      )}
      <h1 className="text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl">{title}</h1>
      <p className="mt-4 text-base leading-relaxed text-neutral-600">{description}</p>
      {children && (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">{children}</div>
      )}
    </main>
  );
}
