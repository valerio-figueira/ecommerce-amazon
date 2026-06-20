import type {
  LegalPageContent,
  LegalSection,
  LegalSubsection,
} from '@ecommerce-amazon/shared/legal';

type LegalPageContentProps = {
  content: LegalPageContent;
};

function LegalSubsectionBlock({ subsection }: { subsection: LegalSubsection }): React.JSX.Element {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium text-neutral-900">{subsection.title}</h3>
      {subsection.paragraphs.map((paragraph) => (
        <p key={paragraph.slice(0, 48)} className="mt-3 text-base leading-relaxed text-neutral-600">
          {paragraph}
        </p>
      ))}
      {subsection.listItems && subsection.listItems.length > 0 ? (
        <ul className="mt-3 list-disc space-y-2 pl-5 text-base leading-relaxed text-neutral-600">
          {subsection.listItems.map((item) => (
            <li key={item.slice(0, 48)}>{item}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function LegalSectionBlock({ section }: { section: LegalSection }): React.JSX.Element {
  return (
    <section
      id={section.id}
      className="scroll-mt-24 border-t border-neutral-100 pt-10 first:border-t-0 first:pt-0"
    >
      <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">{section.title}</h2>
      {section.paragraphs.map((paragraph) => (
        <p key={paragraph.slice(0, 48)} className="mt-4 text-base leading-relaxed text-neutral-600">
          {paragraph}
        </p>
      ))}
      {section.listItems && section.listItems.length > 0 ? (
        <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-relaxed text-neutral-600">
          {section.listItems.map((item) => (
            <li key={item.slice(0, 48)}>{item}</li>
          ))}
        </ul>
      ) : null}
      {section.subsections?.map((subsection) => (
        <LegalSubsectionBlock key={subsection.title} subsection={subsection} />
      ))}
    </section>
  );
}

export function LegalPageContent({ content }: LegalPageContentProps): React.JSX.Element {
  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${content.lastUpdated}T12:00:00.000Z`));

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 md:text-4xl">
          {content.title}
        </h1>
        <p className="mt-3 text-sm text-neutral-500">Última atualização: {formattedDate}</p>
        <p className="mt-6 text-base leading-relaxed text-neutral-600">{content.intro}</p>
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
          </ol>
        </nav>
      </header>

      <div className="space-y-2">
        {content.sections.map((section) => (
          <LegalSectionBlock key={section.id} section={section} />
        ))}
      </div>
    </article>
  );
}
