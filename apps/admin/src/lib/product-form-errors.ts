const PRODUCT_API_ERROR_MESSAGES: Record<string, string> = {
  'Product must be assigned to a leaf category':
    'O produto precisa estar em uma subcategoria folha (sem filhos).',
  'Category not found': 'Categoria não encontrada.',
  'Category is not visible': 'A categoria selecionada não está visível na vitrine.',
};

export function formatProductFormErrorMessage(message: string): string {
  return PRODUCT_API_ERROR_MESSAGES[message] ?? message;
}
