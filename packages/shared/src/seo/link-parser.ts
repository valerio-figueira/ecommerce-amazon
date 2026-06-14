export type SeoKeywordMap = {
  keyword: string;
  targetUrl: string;
  maxMatches?: number;
  priority?: number;
};

const PROTECTED_SEGMENT_REGEX =
  /(<a\b[^>]*>[\s\S]*?<\/a>|<h[1-6]\b[^>]*>[\s\S]*?<\/h[1-6]>|<img\b[^>]*\/?>)/gi;
const LINK_CLASS = 'text-emerald-600 underline font-medium hover:text-emerald-700';

function isProtectedSegment(segment: string): boolean {
  return /^<(a|h[1-6]|img)\b/i.test(segment);
}

function sortKeywords(keywords: SeoKeywordMap[]): SeoKeywordMap[] {
  return [...keywords].sort((a, b) => {
    const priorityDiff = (b.priority ?? 0) - (a.priority ?? 0);
    if (priorityDiff !== 0) {
      return priorityDiff;
    }
    return b.keyword.length - a.keyword.length;
  });
}

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
  const sortedKeywords = sortKeywords(keywords);
  let result = htmlContent;

  for (const item of sortedKeywords) {
    const parts = result.split(PROTECTED_SEGMENT_REGEX);
    result = parts
      .map((part) => {
        if (isProtectedSegment(part)) {
          return part;
        }
        return linkKeywordOccurrences(part, item);
      })
      .join('');
  }

  return result;
}
