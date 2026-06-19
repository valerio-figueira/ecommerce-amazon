import { describe, expect, it } from 'vitest';

import {
  createEmptyBlock,
  specsNormalizedToUiState,
  uiStateToSpecsNormalized,
} from './product-specs-form-state';

describe('product-specs-form-state', () => {
  it('round-trips normalized groups through UI state', () => {
    const groups = [
      {
        group_id: 'medidas',
        group_title: 'Medidas',
        is_collapsed_default: true,
        properties: [{ key: 'Peso', value: '4 kg' }],
      },
    ];

    const blocks = specsNormalizedToUiState(groups);
    expect(uiStateToSpecsNormalized(blocks)).toEqual(groups);
  });

  it('drops empty blocks before persisting', () => {
    const blocks = [
      createEmptyBlock('Conectividade'),
      {
        ...createEmptyBlock('Medidas'),
        properties: [
          {
            id: 'property-test',
            key: 'Peso',
            value: '4 kg',
          },
        ],
      },
    ];

    expect(uiStateToSpecsNormalized(blocks)).toEqual([
      {
        group_id: 'medidas',
        group_title: 'Medidas',
        is_collapsed_default: false,
        properties: [{ key: 'Peso', value: '4 kg' }],
      },
    ]);
  });
});
