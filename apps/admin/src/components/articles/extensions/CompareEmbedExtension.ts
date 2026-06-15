import { Node, mergeAttributes } from '@tiptap/core';

export type CompareEmbedAttrs = {
  slugs: string;
  label: string;
};

function readCompareEmbedAttrs(attrs: Record<string, unknown>): CompareEmbedAttrs {
  return {
    slugs: typeof attrs['slugs'] === 'string' ? attrs['slugs'] : '',
    label: typeof attrs['label'] === 'string' ? attrs['label'] : '',
  };
}

export const CompareEmbedExtension = Node.create({
  name: 'compareEmbed',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      slugs: { default: '' },
      label: { default: '' },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-compare-embed]',
        getAttrs: (element) => {
          if (!(element instanceof HTMLElement)) return false;
          return {
            slugs: element.getAttribute('data-slugs') ?? '',
            label: element.getAttribute('data-label') ?? '',
          };
        },
      },
    ];
  },

  renderHTML({ node }) {
    const attrs = readCompareEmbedAttrs(node.attrs);
    return [
      'div',
      mergeAttributes({
        'data-compare-embed': '',
        'data-slugs': attrs.slugs,
        'data-label': attrs.label,
        class:
          'my-3 rounded-lg border border-dashed border-emerald-600 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700',
      }),
      `📊 Comparativo: ${attrs.label || attrs.slugs}`,
    ];
  },

  renderText({ node }) {
    const attrs = readCompareEmbedAttrs(node.attrs);
    return `[[compare:${attrs.slugs}]]`;
  },
});

const COMPARE_SHORTCODE_REGEX = /\[\[compare:([a-zA-Z0-9\-_,]+)\]\]/g;

export function preprocessCompareShortcodesForEditor(body: string): string {
  return body.replace(COMPARE_SHORTCODE_REGEX, (_match, slugs: string) => {
    const label = slugs.split(',').join(', ');
    return `<div data-compare-embed="" data-slugs="${slugs}" data-label="${label}"></div>`;
  });
}

export function serializeCompareEmbeds(html: string): string {
  return html.replace(
    /<div[^>]*data-compare-embed[^>]*data-slugs="([^"]+)"[^>]*><\/div>/g,
    '[[compare:$1]]',
  ).replace(
    /<div[^>]*data-compare-embed[^>]*data-slugs="([^"]+)"[^>]*>[\s\S]*?<\/div>/g,
    '[[compare:$1]]',
  );
}
