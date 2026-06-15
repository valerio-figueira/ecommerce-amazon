const PRODUCT_SLUG_PATTERN = '[a-z0-9]+(?:-[a-z0-9]+)*';
const PRODUCT_SHORTCODE_REGEX = new RegExp(
  `\\[\\[product:(${PRODUCT_SLUG_PATTERN})\\]\\]`,
  'gi',
);
const COMPARE_SHORTCODE_REGEX = /\[\[compare:([a-zA-Z0-9\-_,]+)\]\]/gi;

const COMBINED_SHORTCODE_REGEX = new RegExp(
  `\\[\\[(product:(${PRODUCT_SLUG_PATTERN})|compare:([a-zA-Z0-9\\-_,]+))\\]\\]`,
  'gi',
);

export type ArticleContentSegment =
  | { type: 'html'; html: string }
  | { type: 'product'; slug: string }
  | { type: 'compare'; slugs: string[] };

export function parseCompareSlugs(raw: string): string[] {
  return raw
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0 && new RegExp(`^${PRODUCT_SLUG_PATTERN}$`).test(part));
}

function collectUniqueSlugs(slugs: string[]): string[] {
  const unique: string[] = [];
  for (const slug of slugs) {
    if (!unique.includes(slug)) {
      unique.push(slug);
    }
  }
  return unique;
}

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

export function extractCompareSlugGroupsFromBody(html: string): string[][] {
  const groups: string[][] = [];
  const regex = new RegExp(COMPARE_SHORTCODE_REGEX.source, 'gi');
  let match: RegExpExecArray | null = regex.exec(html);
  while (match !== null) {
    const raw = match[1];
    if (raw) {
      groups.push(parseCompareSlugs(raw));
    }
    match = regex.exec(html);
  }
  return groups;
}

export function extractAllEmbedSlugsFromBody(html: string): string[] {
  const productSlugs = extractProductSlugsFromBody(html);
  const compareGroups = extractCompareSlugGroupsFromBody(html);
  const compareSlugs = compareGroups.flat();
  return collectUniqueSlugs([...productSlugs, ...compareSlugs]);
}

export function parseArticleShortcodes(html: string): ArticleContentSegment[] {
  const segments: ArticleContentSegment[] = [];
  const regex = new RegExp(COMBINED_SHORTCODE_REGEX.source, 'gi');
  let lastIndex = 0;
  let match: RegExpExecArray | null = regex.exec(html);

  while (match !== null) {
    const matchIndex = match.index;
    if (matchIndex > lastIndex) {
      segments.push({ type: 'html', html: html.slice(lastIndex, matchIndex) });
    }

    const productSlug = match[2];
    const compareRaw = match[3];

    if (productSlug) {
      segments.push({ type: 'product', slug: productSlug });
    } else if (compareRaw) {
      segments.push({ type: 'compare', slugs: parseCompareSlugs(compareRaw) });
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
