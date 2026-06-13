import type { ReactNode } from 'react';

type CmsFormSectionProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

export function CmsFormSection({
  title,
  children,
  className,
}: CmsFormSectionProps): React.JSX.Element {
  return (
    <section className={className}>
      <h4 className="cms-form-section-title">{title}</h4>
      <div className="mt-3 space-y-4">{children}</div>
    </section>
  );
}
