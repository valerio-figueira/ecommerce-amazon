export type SeoKeywordMap = {
  keyword: string;
  targetUrl: string;
};

const ANCHOR_SEGMENT_REGEX = /(<a\b[^>]*>[\s\S]*?<\/a>)/gi;

function linkFirstKeywordOccurrence(segment: string, item: SeoKeywordMap): string {
  const escapedKeyword = item.keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`\\b(${escapedKeyword})\\b`, 'i');

  return segment.replace(
    regex,
    `<a href="${item.targetUrl}" class="seo-internal-link">$1</a>`,
  );
}

export function injectInternalLinks(
  htmlContent: string,
  keywords: SeoKeywordMap[],
): string {
  const parts = htmlContent.split(ANCHOR_SEGMENT_REGEX);

  return parts
    .map((part) => {
      if (/^<a\b/i.test(part)) {
        return part;
      }

      let segment = part;
      for (const item of keywords) {
        segment = linkFirstKeywordOccurrence(segment, item);
      }
      return segment;
    })
    .join('');
}
