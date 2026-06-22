import { describe, expect, it } from 'vitest';

import {
  buildArticleEditorialLlmPrompt,
  parseArticleEditorialLlmResponse,
} from './article-llm-prompt';
import { ArticleStatus, ArticleType } from '@ecommerce-amazon/domain';

describe('buildArticleEditorialLlmPrompt', () => {
  it('includes article context and JSON output instructions', () => {
    const prompt = buildArticleEditorialLlmPrompt({
      title: 'Guia de cadeiras ergonômicas',
      slug: 'guia-cadeiras-ergonomicas',
      excerpt: '',
      coverImageUrl: '',
      body: '<p>Intro</p>',
      type: ArticleType.GUIDE,
      status: ArticleStatus.DRAFT,
      seoTitle: '',
      seoDescription: '',
    });

    expect(prompt).toContain('Guia de cadeiras ergonômicas');
    expect(prompt).toContain('"title"');
    expect(prompt).toContain('"body"');
    expect(prompt).toContain('[[product:slug-do-produto]]');
  });
});

describe('parseArticleEditorialLlmResponse', () => {
  it('parses full article JSON from LLM response', () => {
    const result = parseArticleEditorialLlmResponse(
      JSON.stringify({
        title: 'Guia Home Office',
        excerpt: 'Resumo editorial.',
        seoTitle: 'Guia Home Office | Ofertas',
        seoDescription: 'Curadoria editorial para montar seu setup.',
        coverImageUrl: 'https://cdn.example.com/banner.jpg',
        body: '<h2>Visão geral</h2><p>Texto.</p>',
      }),
    );

    expect(result).toEqual({
      title: 'Guia Home Office',
      excerpt: 'Resumo editorial.',
      seoTitle: 'Guia Home Office | Ofertas',
      seoDescription: 'Curadoria editorial para montar seu setup.',
      coverImageUrl: 'https://cdn.example.com/banner.jpg',
      body: '<h2>Visão geral</h2><p>Texto.</p>',
    });
  });

  it('accepts metaTitle and metaDescription aliases', () => {
    const result = parseArticleEditorialLlmResponse(
      JSON.stringify({
        title: 'Review',
        metaTitle: 'SEO title',
        metaDescription: 'SEO description',
        body: '<p>Corpo</p>',
      }),
    );

    expect(result.seoTitle).toBe('SEO title');
    expect(result.seoDescription).toBe('SEO description');
  });

  it('extracts JSON from fenced or noisy responses', () => {
    const result = parseArticleEditorialLlmResponse(
      'Segue o artigo:\n```json\n{"title":"T","body":"<p>HTML</p>"}\n```',
    );

    expect(result.title).toBe('T');
    expect(result.body).toBe('<p>HTML</p>');
  });

  it('truncates values to technical limits', () => {
    const result = parseArticleEditorialLlmResponse(
      JSON.stringify({
        title: 'x'.repeat(200),
        excerpt: 'y'.repeat(600),
        seoTitle: 'z'.repeat(250),
        seoDescription: 'w'.repeat(600),
        body: '<p>ok</p>',
      }),
    );

    expect(result.title).toHaveLength(150);
    expect(result.excerpt).toHaveLength(500);
    expect(result.seoTitle).toHaveLength(200);
    expect(result.seoDescription).toHaveLength(500);
  });

  it('throws when required fields are missing', () => {
    expect(() => parseArticleEditorialLlmResponse('{"title":"Sem corpo"}')).toThrow('body');
    expect(() =>
      parseArticleEditorialLlmResponse(
        '{"title":"Ok","body":"<p>ok</p>","coverImageUrl":"not-a-url"}',
      ),
    ).toThrow('coverImageUrl');
  });
});
