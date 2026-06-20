import { describe, expect, it } from 'vitest';

import { buildProductSeoLlmPrompt, parseProductSeoLlmResponse } from './product-llm-prompt';

describe('buildProductSeoLlmPrompt', () => {
  it('includes product context and JSON output instructions', () => {
    const prompt = buildProductSeoLlmPrompt({
      titleClean: 'Cadeira DT3',
      marketplace: 'amazon_br',
      categoryPathLabel: 'Periféricos > Cadeiras ergonômicas',
      editorialScore: 8.5,
      pros: ['Apoio lombar'],
      cons: ['Montagem demorada'],
      shortDescription: 'Cadeira para home office.',
      specsNormalized: [
        {
          group_id: 'detalhes_produto',
          group_title: 'Detalhes do Produto',
          is_collapsed_default: false,
          properties: [{ key: 'Garantia', value: '12 meses' }],
        },
      ],
      autoMetaTitle: 'Cadeira DT3 — Análise e Ofertas',
      autoMetaDescription: 'Confira nossa avaliação...',
      metaTitle: '',
      metaDescription: '',
    });

    expect(prompt).toContain('Cadeira DT3');
    expect(prompt).toContain('Periféricos > Cadeiras ergonômicas');
    expect(prompt).toContain('Apoio lombar');
    expect(prompt).toContain('"metaTitle"');
    expect(prompt).toContain('"metaDescription"');
    expect(prompt).toContain('Proibido: preço fictício');
  });
});

describe('parseProductSeoLlmResponse', () => {
  it('parses metaTitle and metaDescription from JSON', () => {
    const result = parseProductSeoLlmResponse(
      '{"metaTitle":"Título SEO","metaDescription":"Descrição SEO com curadoria editorial."}',
    );

    expect(result).toEqual({
      metaTitle: 'Título SEO',
      metaDescription: 'Descrição SEO com curadoria editorial.',
    });
  });

  it('accepts seoTitle and seoDescription aliases', () => {
    const result = parseProductSeoLlmResponse('{"seoTitle":"Título","seoDescription":"Descrição"}');

    expect(result.metaTitle).toBe('Título');
    expect(result.metaDescription).toBe('Descrição');
  });

  it('extracts JSON from fenced or noisy responses', () => {
    const result = parseProductSeoLlmResponse(
      'Aqui está:\n```json\n{"metaTitle":"A","metaDescription":"B"}\n```',
    );

    expect(result.metaTitle).toBe('A');
    expect(result.metaDescription).toBe('B');
  });

  it('truncates values to technical limits', () => {
    const result = parseProductSeoLlmResponse(
      JSON.stringify({
        metaTitle: 'x'.repeat(250),
        metaDescription: 'y'.repeat(400),
      }),
    );

    expect(result.metaTitle).toHaveLength(200);
    expect(result.metaDescription).toHaveLength(320);
  });

  it('throws when required fields are missing', () => {
    expect(() => parseProductSeoLlmResponse('{"metaTitle":"Só título"}')).toThrow(
      'metaDescription',
    );
  });
});
