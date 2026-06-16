'use client';

import { sanitizeInstitutionalHtml } from '@ecommerce-amazon/shared/about';

type SafeInstitutionalHtmlProps = {
  html: string;
  className?: string;
  as?: 'p' | 'div' | 'span';
};

export function SafeInstitutionalHtml({
  html,
  className,
  as: Tag = 'div',
}: SafeInstitutionalHtmlProps): React.JSX.Element {
  const sanitized = sanitizeInstitutionalHtml(html);
  const hasHtmlTags = /<[^>]+>/.test(sanitized);

  if (!hasHtmlTags) {
    return <Tag className={className}>{sanitized}</Tag>;
  }

  return (
    <Tag className={className} dangerouslySetInnerHTML={{ __html: sanitized }} />
  );
}
