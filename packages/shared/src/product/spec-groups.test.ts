import { describe, expect, it } from 'vitest';

import {
  ensureUniqueGroupIdInScope,
  flattenSpecGroups,
  legacyRecordToSpecGroups,
  normalizeSpecsGroups,
  parseSpecsNormalizedFromDb,
} from './spec-groups.js';

describe('ensureUniqueGroupIdInScope', () => {
  it('returns base id when unused in local scope', () => {
    const usedIds = new Set<string>();
    expect(ensureUniqueGroupIdInScope('detalhes-produto', usedIds)).toBe('detalhes-produto');
    expect(usedIds.has('detalhes-produto')).toBe(true);
  });

  it('adds suffix only within the same product scope', () => {
    const usedIds = new Set<string>();
    expect(ensureUniqueGroupIdInScope('detalhes-produto', usedIds)).toBe('detalhes-produto');
    expect(ensureUniqueGroupIdInScope('detalhes-produto', usedIds)).toBe('detalhes-produto-2');
  });

  it('does not share scope across separate normalize calls', () => {
    const productA = normalizeSpecsGroups([
      {
        group_id: 'detalhes-produto',
        group_title: 'Detalhes do Produto',
        is_collapsed_default: false,
        properties: [{ key: 'Cor', value: 'Preto' }],
      },
    ]);
    const productB = normalizeSpecsGroups([
      {
        group_id: 'detalhes-produto',
        group_title: 'Detalhes do Produto',
        is_collapsed_default: false,
        properties: [{ key: 'Peso', value: '1 kg' }],
      },
    ]);

    expect(productA[0]?.group_id).toBe('detalhes-produto');
    expect(productB[0]?.group_id).toBe('detalhes-produto');
  });
});

describe('normalizeSpecsGroups', () => {
  it('trims keys and values and drops empty rows', () => {
    expect(
      normalizeSpecsGroups([
        {
          group_id: 'medidas',
          group_title: ' Medidas ',
          is_collapsed_default: true,
          properties: [
            { key: ' Peso ', value: ' 4 kg ' },
            { key: '', value: '' },
            { key: 'Altura', value: '' },
          ],
        },
      ]),
    ).toEqual([
      {
        group_id: 'medidas',
        group_title: 'Medidas',
        is_collapsed_default: true,
        properties: [{ key: 'Peso', value: '4 kg' }],
      },
    ]);
  });

  it('deduplicates group_id within the same product', () => {
    expect(
      normalizeSpecsGroups([
        {
          group_id: '',
          group_title: 'Medidas',
          is_collapsed_default: false,
          properties: [{ key: 'Peso', value: '4 kg' }],
        },
        {
          group_id: '',
          group_title: 'Medidas',
          is_collapsed_default: false,
          properties: [{ key: 'Altura', value: '90 cm' }],
        },
      ]).map((group) => group.group_id),
    ).toEqual(['medidas', 'medidas-2']);
  });

  it('drops blocks without title or without valid properties', () => {
    expect(
      normalizeSpecsGroups([
        {
          group_id: 'empty',
          group_title: '',
          is_collapsed_default: false,
          properties: [{ key: 'Cor', value: 'Preto' }],
        },
        {
          group_id: 'ghost',
          group_title: 'Conectividade',
          is_collapsed_default: false,
          properties: [{ key: '', value: '' }],
        },
      ]),
    ).toEqual([]);
  });
});

describe('flattenSpecGroups', () => {
  it('flattens properties and lets later values win on duplicate keys', () => {
    expect(
      flattenSpecGroups([
        {
          group_id: 'a',
          group_title: 'A',
          is_collapsed_default: false,
          properties: [{ key: 'Peso', value: '1 kg' }],
        },
        {
          group_id: 'b',
          group_title: 'B',
          is_collapsed_default: false,
          properties: [
            { key: 'Cor', value: 'Preto' },
            { key: 'Peso', value: '2 kg' },
          ],
        },
      ]),
    ).toEqual({
      Peso: '2 kg',
      Cor: 'Preto',
    });
  });
});

describe('legacyRecordToSpecGroups', () => {
  it('wraps legacy flat records in a default group', () => {
    expect(legacyRecordToSpecGroups({ Cor: 'Preto', Conexão: 'USB' })).toEqual([
      {
        group_id: 'detalhes_produto',
        group_title: 'Detalhes do Produto',
        is_collapsed_default: false,
        properties: [
          { key: 'Cor', value: 'Preto' },
          { key: 'Conexão', value: 'USB' },
        ],
      },
    ]);
  });
});

describe('parseSpecsNormalizedFromDb', () => {
  it('parses array payloads', () => {
    expect(
      parseSpecsNormalizedFromDb([
        {
          group_id: 'medidas',
          group_title: 'Medidas',
          is_collapsed_default: true,
          properties: [{ key: 'Peso', value: '4 kg' }],
        },
      ]),
    ).toEqual([
      {
        group_id: 'medidas',
        group_title: 'Medidas',
        is_collapsed_default: true,
        properties: [{ key: 'Peso', value: '4 kg' }],
      },
    ]);
  });

  it('converts legacy object payloads', () => {
    expect(parseSpecsNormalizedFromDb({ Cor: 'Preto' })).toEqual([
      {
        group_id: 'detalhes_produto',
        group_title: 'Detalhes do Produto',
        is_collapsed_default: false,
        properties: [{ key: 'Cor', value: 'Preto' }],
      },
    ]);
  });

  it('returns empty array for empty legacy object', () => {
    expect(parseSpecsNormalizedFromDb({})).toEqual([]);
  });
});
