import {
  preprocessCompareShortcodesForEditor,
  serializeCompareEmbeds,
} from './CompareEmbedExtension';
import {
  preprocessBodyForEditor as preprocessProductEmbedsForEditor,
  serializeArticleBody as serializeProductEmbeds,
} from './ProductEmbedExtension';

export function preprocessBodyForEditor(body: string): string {
  return preprocessCompareShortcodesForEditor(preprocessProductEmbedsForEditor(body));
}

export function serializeArticleBody(html: string): string {
  return serializeCompareEmbeds(serializeProductEmbeds(html));
}

export function buildCompareShortcode(slugs: string[]): string {
  return `[[compare:${slugs.join(',')}]]`;
}

export function insertTextAtCursor(textarea: HTMLTextAreaElement, text: string): string {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const value = textarea.value;
  const nextValue = `${value.slice(0, start)}${text}${value.slice(end)}`;
  const cursorPosition = start + text.length;
  window.requestAnimationFrame(() => {
    textarea.focus();
    textarea.setSelectionRange(cursorPosition, cursorPosition);
  });
  return nextValue;
}
