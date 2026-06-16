import Link from 'next/link';
import { Instagram, Mail, Send } from 'lucide-react';

import type { ContactPageContent } from '@ecommerce-amazon/shared/contact';
import type { BrandConfig } from '@ecommerce-amazon/shared/config/brand';

type ContactPageContentProps = {
  content: ContactPageContent;
  brand: BrandConfig;
};

export function ContactPageContentView({
  content,
  brand,
}: ContactPageContentProps): React.JSX.Element {
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

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            {content.socialHeading}
          </h2>
          <ul className="mt-3 flex flex-wrap gap-3">
            {brand.socials.instagram ? (
              <li>
                <a
                  href={brand.socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-4 py-2 text-sm text-neutral-700 transition hover:border-neutral-300"
                >
                  <Instagram className="h-4 w-4" aria-hidden />
                  Instagram
                </a>
              </li>
            ) : null}
            {brand.socials.telegram ? (
              <li>
                <a
                  href={brand.socials.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-4 py-2 text-sm text-neutral-700 transition hover:border-neutral-300"
                >
                  <Send className="h-4 w-4" aria-hidden />
                  Telegram
                </a>
              </li>
            ) : null}
          </ul>
        </div>

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
