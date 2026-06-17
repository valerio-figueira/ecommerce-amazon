const EMPTY_HTML_PATTERNS = new Set([
  '',
  '<p></p>',
  '<p><br></p>',
  '<p><br/></p>',
  '<p><br /></p>',
]);

export function normalizeEmptyHtml(html: string): string {
  const trimmed = html.trim();
  if (EMPTY_HTML_PATTERNS.has(trimmed)) {
    return '';
  }
  return html;
}
