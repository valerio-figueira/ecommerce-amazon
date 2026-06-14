export type SeoKeywordMap = {
  keyword: string;
  targetUrl: string;
  maxMatches?: number;
};

const ANCHOR_SEGMENT_REGEX = /(<a\b[^>]*>[\s\S]*?<\/a>)/gi;
const LINK_CLASS = 'text-emerald-600 underline font-medium hover:text-emerald-700';

function linkKeywordOccurrences(segment: string, item: SeoKeywordMap): string {
  const escapedKeyword = item.keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`\\b(${escapedKeyword})\\b`, 'gi');
  const maxMatches = item.maxMatches ?? 1;
  let matchCount = 0;

  return segment.replace(regex, (match) => {
    if (matchCount >= maxMatches) {
      return match;
    }
    matchCount += 1;
    return `<a href="${item.targetUrl}" class="${LINK_CLASS}">${match}</a>`;
  });
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
        segment = linkKeywordOccurrences(segment, item);
      }
      return segment;
    })
    .join('');
}
