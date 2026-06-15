export const CATEGORY_SPEC_TEMPLATES: Readonly<Record<string, readonly string[]>> = {
  'teclados-mecanicos': ['Switches', 'Layout', 'Conexão'],
  perifericos: ['Tipo', 'Conexão', 'Compatibilidade'],
  'cadeiras-ergonomicas': ['Peso Máximo Suportado', 'Material', 'Ajuste de Braço'],
};

export function resolveSpecTemplateForSlugChain(slugChain: string[]): readonly string[] {
  for (let index = slugChain.length - 1; index >= 0; index -= 1) {
    const slug = slugChain[index];
    if (!slug) {
      continue;
    }
    const template = CATEGORY_SPEC_TEMPLATES[slug];
    if (template) {
      return template;
    }
  }
  return [];
}
