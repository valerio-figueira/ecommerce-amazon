import { describe, expect, it } from 'vitest';

import { normalizeEmptyHtml } from './normalize-empty-html.js';

describe('normalizeEmptyHtml', () => {
  it('returns empty string for blank input', () => {
    expect(normalizeEmptyHtml('')).toBe('');
    expect(normalizeEmptyHtml('   ')).toBe('');
  });

  it('normalizes TipTap empty document markers', () => {
    expect(normalizeEmptyHtml('<p></p>')).toBe('');
    expect(normalizeEmptyHtml('<p><br></p>')).toBe('');
    expect(normalizeEmptyHtml('<p><br/></p>')).toBe('');
    expect(normalizeEmptyHtml('<p><br /></p>')).toBe('');
  });

  it('preserves non-empty HTML', () => {
    const html = '<h3>Visão geral</h3><p>Texto editorial.</p>';
    expect(normalizeEmptyHtml(html)).toBe(html);
  });

  it('preserves table markup', () => {
    const html =
      '<table><thead><tr><th>Característica</th><th>Detalhe</th></tr></thead><tbody><tr><td>Peso</td><td>1,2 kg</td></tr></tbody></table>';
    expect(normalizeEmptyHtml(html)).toBe(html);
  });
});
