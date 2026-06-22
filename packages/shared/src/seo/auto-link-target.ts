export const AUTO_LINK_TARGET_URL_MAX_LENGTH = 2048;

export function isExternalAutoLinkTargetUrl(targetUrl: string): boolean {
  return targetUrl.trim().startsWith('https://');
}

export function describeExternalAutoLinkTarget(targetUrl: string): string | null {
  if (!isExternalAutoLinkTargetUrl(targetUrl)) {
    return null;
  }

  try {
    const hostname = new URL(targetUrl).hostname.toLowerCase();
    if (hostname.includes('amazon.') || hostname === 'amzn.to') {
      return 'Amazon';
    }
    if (
      hostname.includes('mercadolivre.') ||
      hostname === 'meli.la' ||
      hostname.includes('mercadolibre.')
    ) {
      return 'Mercado Livre';
    }
    if (hostname.includes('shopee.')) {
      return 'Shopee';
    }
    return 'Link externo';
  } catch {
    return 'Link externo';
  }
}

function escapeHtmlAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function buildAutoLinkAnchorAttributes(targetUrl: string): string {
  const safeHref = escapeHtmlAttribute(targetUrl);
  if (isExternalAutoLinkTargetUrl(targetUrl)) {
    return `href="${safeHref}" target="_blank" rel="noopener sponsored"`;
  }
  return `href="${safeHref}"`;
}
