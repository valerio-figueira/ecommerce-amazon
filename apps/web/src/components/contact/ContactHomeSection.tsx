import Link from 'next/link';
import { ArrowRight, Mail } from 'lucide-react';

import type { ContactPageContent } from '@ecommerce-amazon/shared/contact';

import { ContactSocialLinks } from '@/components/contact/ContactSocialLinks';

type ContactHomeSectionProps = {
  content: ContactPageContent;
};

export function ContactHomeSection({ content }: ContactHomeSectionProps): React.JSX.Element | null {
  if (!content.showOnHome) {
    return null;
  }

  const showSocials = content.socialsEnabled && Object.keys(content.socialLinks).length > 0;

  return (
    <section
      aria-labelledby="home-contact-heading"
      className="mt-12 rounded-2xl border border-neutral-100 bg-neutral-50 px-5 py-8 md:px-8"
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-2xl">
          <h2
            id="home-contact-heading"
            className="text-2xl font-semibold tracking-tight text-neutral-900"
          >
            {content.title}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-neutral-600">{content.intro}</p>
          <a
            href={`mailto:${content.email}`}
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-[3px] transition hover:decoration-neutral-500"
          >
            <Mail className="h-4 w-4" aria-hidden />
            {content.email}
          </a>
        </div>

        {showSocials ? (
          <div className="md:min-w-[220px]">
            <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
              {content.socialHeading}
            </p>
            <ContactSocialLinks socialLinks={content.socialLinks} />
          </div>
        ) : null}
      </div>

      <div className="mt-6 border-t border-neutral-200/80 pt-5">
        <Link
          href="/contato"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-neutral-800 transition hover:text-neutral-950"
        >
          Ver página de contato
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
