import Link from 'next/link';
import { Instagram, Linkedin, Send } from 'lucide-react';

import type { AboutPageContent, PublicTeamMemberDto } from '@ecommerce-amazon/shared/about';
import { formatEditorialTeamName } from '@ecommerce-amazon/shared/config/brand';

import { SafeInstitutionalHtml } from '@/components/about/SafeInstitutionalHtml';
import { RemoteImage } from '@/components/ui/RemoteImage';
import { getServerBrandConfig } from '@/lib/site-url';

type AboutPageContentProps = {
  content: AboutPageContent;
  teamMembers: PublicTeamMemberDto[];
};

function TeamSocialIcon({ network }: { network: 'linkedin' | 'instagram' | 'x' | 'telegram' }) {
  if (network === 'linkedin') return <Linkedin className="h-4 w-4" aria-hidden />;
  if (network === 'instagram') return <Instagram className="h-4 w-4" aria-hidden />;
  if (network === 'telegram') return <Send className="h-4 w-4" aria-hidden />;
  return (
    <span className="text-xs font-semibold" aria-hidden>
      X
    </span>
  );
}

function AboutSectionBlock({
  section,
}: {
  section: AboutPageContent['sections'][number];
}): React.JSX.Element {
  const isCallout = section.callout === true;

  return (
    <section
      id={section.id}
      className="scroll-mt-24 border-t border-neutral-100 pt-10 first:border-t-0 first:pt-0"
    >
      <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">{section.title}</h2>
      <div
        className={
          isCallout ? 'mt-4 rounded-xl border border-amber-100 bg-amber-50/80 p-5' : 'mt-4'
        }
      >
        {section.paragraphs.map((paragraph) => (
          <SafeInstitutionalHtml
            key={paragraph.slice(0, 48)}
            html={paragraph}
            className={`text-base leading-relaxed text-neutral-600 ${isCallout ? 'text-neutral-700' : ''}`}
            as="p"
          />
        ))}
        {section.listItems && section.listItems.length > 0 ? (
          <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-relaxed text-neutral-600">
            {section.listItems.map((item) => (
              <li key={item.slice(0, 48)}>
                <SafeInstitutionalHtml html={item} as="span" />
              </li>
            ))}
          </ul>
        ) : null}
        {isCallout ? (
          <p className="mt-4 text-sm">
            <Link
              href="/legal#afiliados"
              className="text-neutral-700 underline decoration-neutral-300 underline-offset-[3px] transition hover:text-neutral-900"
            >
              Leia a divulgação completa de afiliados
            </Link>
          </p>
        ) : null}
      </div>
    </section>
  );
}

function TeamMemberCard({ member }: { member: PublicTeamMemberDto }): React.JSX.Element {
  const socialEntries = (
    [
      ['linkedin', member.socialLinks?.linkedin],
      ['instagram', member.socialLinks?.instagram],
      ['x', member.socialLinks?.x],
      ['telegram', member.socialLinks?.telegram],
    ] as const
  ).filter((entry): entry is [(typeof entry)[0], string] => Boolean(entry[1]));

  return (
    <article className="rounded-xl border border-neutral-100 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        {member.avatarUrl ? (
          <RemoteImage
            src={member.avatarUrl}
            alt={member.name}
            width={64}
            height={64}
            className="h-16 w-16 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-lg font-semibold text-neutral-600"
            aria-hidden
          >
            {member.name.charAt(0)}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-neutral-900">{member.name}</h3>
          {member.jobTitle ? (
            <p className="mt-0.5 text-sm font-medium text-neutral-500">{member.jobTitle}</p>
          ) : null}
          {member.bio ? (
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">{member.bio}</p>
          ) : null}
          {socialEntries.length > 0 ? (
            <ul className="mt-3 flex flex-wrap gap-2">
              {socialEntries.map(([network, href]) => (
                <li key={network}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition hover:border-neutral-300 hover:text-neutral-900"
                    aria-label={`${member.name} no ${network}`}
                  >
                    <TeamSocialIcon network={network} />
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function AboutPageContent({
  content,
  teamMembers,
}: AboutPageContentProps): React.JSX.Element {
  const brand = getServerBrandConfig();
  const editorialName = formatEditorialTeamName(brand);

  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${content.lastUpdated}T12:00:00.000Z`));

  const contentSections = content.sections.filter((section) => section.id !== 'equipe');

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 md:text-4xl">
          {content.heroTitle}
        </h1>
        <p className="mt-3 text-sm text-neutral-500">Última atualização: {formattedDate}</p>
        <SafeInstitutionalHtml
          html={content.heroIntro}
          className="mt-6 text-base leading-relaxed text-neutral-600"
          as="p"
        />
        <nav
          aria-label="Sumário"
          className="mt-8 rounded-xl border border-neutral-100 bg-neutral-50 p-5"
        >
          <p className="text-sm font-medium text-neutral-900">Navegue por seção</p>
          <ol className="mt-3 space-y-2 text-sm">
            {content.sections.map((section, index) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="text-neutral-600 underline decoration-neutral-300 underline-offset-[3px] transition hover:text-neutral-900"
                >
                  {index + 1}. {section.title}
                </a>
              </li>
            ))}
            <li>
              <a
                href="#proximos-passos"
                className="text-neutral-600 underline decoration-neutral-300 underline-offset-[3px] transition hover:text-neutral-900"
              >
                {content.sections.length + 1}. {content.trafficDirection.title}
              </a>
            </li>
          </ol>
        </nav>
      </header>

      <div className="space-y-2">
        {contentSections.map((section) => (
          <AboutSectionBlock key={section.id} section={section} />
        ))}

        <section id="equipe" className="scroll-mt-24 border-t border-neutral-100 pt-10">
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">Quem somos</h2>
          <SafeInstitutionalHtml
            html={content.teamSectionIntro}
            className="mt-4 text-base leading-relaxed text-neutral-600"
            as="p"
          />
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {teamMembers.length > 0 ? (
              teamMembers.map((member) => <TeamMemberCard key={member.name} member={member} />)
            ) : (
              <article className="rounded-xl border border-neutral-100 bg-neutral-50 p-5 sm:col-span-2">
                <h3 className="text-lg font-semibold text-neutral-900">{editorialName}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                  Equipe editorial dedicada à curadoria de produtos e conteúdo para ajudar você a
                  comprar melhor na Amazon e Shopee.
                </p>
              </article>
            )}
          </div>
          <p className="mt-6 text-sm text-neutral-500">
            <Link
              href="/contato"
              className="underline decoration-neutral-300 underline-offset-[3px]"
            >
              Fale conosco
            </Link>
            {' · '}
            <Link href="/legal" className="underline decoration-neutral-300 underline-offset-[3px]">
              Políticas legais
            </Link>
          </p>
        </section>

        <section id="proximos-passos" className="scroll-mt-24 border-t border-neutral-100 pt-10">
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
            {content.trafficDirection.title}
          </h2>
          <SafeInstitutionalHtml
            html={content.trafficDirection.intro}
            className="mt-4 text-base leading-relaxed text-neutral-600"
            as="p"
          />
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {content.trafficDirection.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium text-neutral-800 transition hover:border-neutral-300 hover:bg-neutral-50"
              >
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </article>
  );
}
