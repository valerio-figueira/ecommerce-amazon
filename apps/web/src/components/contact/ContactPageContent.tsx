import Link from 'next/link';
import { Mail } from 'lucide-react';

import type { ContactPageContent } from '@ecommerce-amazon/shared/contact';

import { ContactSocialLinks } from '@/components/contact/ContactSocialLinks';

type ContactPageContentProps = {
  content: ContactPageContent;
};

export function ContactPageContentView({ content }: ContactPageContentProps): React.JSX.Element {
  const showSocials = content.socialsEnabled;

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 md:text-4xl">
          {content.title}
        </h1>
        <p className="mt-6 text-base leading-relaxed text-neutral-600">{content.intro}</p>
      </header>

      <section className="space-y-8">
        <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            {content.emailLabel}
          </h2>
          <a
            href={`mailto:${content.email}`}
            className="mt-2 inline-flex items-center gap-2 text-lg font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-[3px] transition hover:decoration-neutral-500"
          >
            <Mail className="h-5 w-5" aria-hidden />
            {content.email}
          </a>
        </div>

        {showSocials ? (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
              {content.socialHeading}
            </h2>
            <ContactSocialLinks socialLinks={content.socialLinks} />
          </div>
        ) : null}

        <nav className="border-t border-neutral-100 pt-6 text-sm text-neutral-500">
          <Link href="/sobre" className="underline decoration-neutral-300 underline-offset-[3px]">
            {content.aboutLinkLabel}
          </Link>
          {' · '}
          <Link href="/legal" className="underline decoration-neutral-300 underline-offset-[3px]">
            {content.legalLinkLabel}
          </Link>
        </nav>
      </section>
    </article>
  );
}
