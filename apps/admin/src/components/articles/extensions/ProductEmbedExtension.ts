import { Node, mergeAttributes } from '@tiptap/core';

export type ProductEmbedAttrs = {
  slug: string;
  title: string;
};

function readProductEmbedAttrs(attrs: Record<string, unknown>): ProductEmbedAttrs {
  return {
    slug: typeof attrs['slug'] === 'string' ? attrs['slug'] : '',
    title: typeof attrs['title'] === 'string' ? attrs['title'] : '',
  };
}

export const ProductEmbedExtension = Node.create({
  name: 'productEmbed',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      slug: { default: '' },
      title: { default: '' },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-product-embed]',
        getAttrs: (element) => {
          if (!(element instanceof HTMLElement)) return false;
          return {
            slug: element.getAttribute('data-slug') ?? '',
            title: element.getAttribute('data-title') ?? '',
          };
        },
      },
    ];
  },

  renderHTML({ node }) {
    const attrs = readProductEmbedAttrs(node.attrs);
    return [
      'div',
      mergeAttributes({
        'data-product-embed': '',
        'data-slug': attrs.slug,
        'data-title': attrs.title,
        class:
          'my-3 rounded-lg border border-dashed border-[var(--admin-primary)] bg-blue-50 px-3 py-2 text-sm font-medium text-[var(--admin-primary)]',
      }),
      `📦 Produto: ${attrs.title || attrs.slug}`,
    ];
  },

  renderText({ node }) {
    const attrs = readProductEmbedAttrs(node.attrs);
    return `[[product:${attrs.slug}]]`;
  },
});

const SHORTCODE_REGEX = /\[\[product:([a-z0-9]+(?:-[a-z0-9]+)*)\]\]/g;

export function preprocessBodyForEditor(body: string): string {
  return body.replace(SHORTCODE_REGEX, (_match, slug: string) => {
    return `<div data-product-embed="" data-slug="${slug}" data-title="${slug}"></div>`;
  });
}

export function serializeArticleBody(html: string): string {
  const withShortcodes = html.replace(
    /<div[^>]*data-product-embed[^>]*data-slug="([^"]+)"[^>]*><\/div>/g,
    '[[product:$1]]',
  );

  return withShortcodes.replace(
    /<div[^>]*data-product-embed[^>]*data-slug="([^"]+)"[^>]*>[\s\S]*?<\/div>/g,
    '[[product:$1]]',
  );
}
