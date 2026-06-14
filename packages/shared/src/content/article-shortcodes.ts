const PRODUCT_SHORTCODE_REGEX = /\[\[product:([a-z0-9]+(?:-[a-z0-9]+)*)\]\]/gi;

export type ArticleContentSegment =
  | { type: 'html'; html: string }
  | { type: 'product'; slug: string };

export function extractProductSlugsFromBody(html: string): string[] {
  const slugs: string[] = [];
  const regex = new RegExp(PRODUCT_SHORTCODE_REGEX.source, 'gi');
  let match: RegExpExecArray | null = regex.exec(html);
  while (match !== null) {
    const slug = match[1];
    if (slug && !slugs.includes(slug)) {
      slugs.push(slug);
    }
    match = regex.exec(html);
  }
  return slugs;
}

export function parseArticleShortcodes(html: string): ArticleContentSegment[] {
  const segments: ArticleContentSegment[] = [];
  const regex = new RegExp(PRODUCT_SHORTCODE_REGEX.source, 'gi');
  let lastIndex = 0;
  let match: RegExpExecArray | null = regex.exec(html);

  while (match !== null) {
    const matchIndex = match.index;
    if (matchIndex > lastIndex) {
      segments.push({ type: 'html', html: html.slice(lastIndex, matchIndex) });
    }

    const slug = match[1];
    if (slug) {
      segments.push({ type: 'product', slug });
    }

    lastIndex = matchIndex + match[0].length;
    match = regex.exec(html);
  }

  if (lastIndex < html.length) {
    segments.push({ type: 'html', html: html.slice(lastIndex) });
  }

  if (segments.length === 0) {
    return [{ type: 'html', html }];
  }

  return segments;
}
