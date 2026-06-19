import { slugifyTitle } from '@ecommerce-amazon/shared/marketplace';
import type { SpecGroup } from '@ecommerce-amazon/shared/product';
import { flattenSpecGroups, normalizeSpecsGroups } from '@ecommerce-amazon/shared/product';

export type SpecPropertyRowState = {
  id: string;
  key: string;
  value: string;
};

export type SpecBlockState = {
  id: string;
  group_id: string;
  group_title: string;
  is_collapsed_default: boolean;
  properties: SpecPropertyRowState[];
};

const SUGGESTED_BLOCK_TITLE = 'Especificações sugeridas';

function createRowId(prefix: 'block' | 'property'): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 11)}`;
}

export function createEmptyPropertyRow(key = '', value = ''): SpecPropertyRowState {
  return {
    id: createRowId('property'),
    key,
    value,
  };
}

export function createEmptyBlock(title = ''): SpecBlockState {
  const trimmedTitle = title.trim();
  return {
    id: createRowId('block'),
    group_id: trimmedTitle ? slugifyTitle(trimmedTitle) : '',
    group_title: trimmedTitle,
    is_collapsed_default: false,
    properties: [createEmptyPropertyRow()],
  };
}

export function specsNormalizedToUiState(groups: SpecGroup[]): SpecBlockState[] {
  return groups.map((group) => ({
    id: createRowId('block'),
    group_id: group.group_id,
    group_title: group.group_title,
    is_collapsed_default: group.is_collapsed_default,
    properties:
      group.properties.length > 0
        ? group.properties.map((property) =>
            createEmptyPropertyRow(property.key, property.value),
          )
        : [createEmptyPropertyRow()],
  }));
}

export function uiStateToSpecsNormalized(blocks: SpecBlockState[]): SpecGroup[] {
  const draftGroups: SpecGroup[] = blocks.map((block) => ({
    group_id: block.group_id.trim() || slugifyTitle(block.group_title.trim()),
    group_title: block.group_title.trim(),
    is_collapsed_default: block.is_collapsed_default,
    properties: block.properties.map((property) => ({
      key: property.key,
      value: property.value,
    })),
  }));

  return normalizeSpecsGroups(draftGroups);
}

export function buildSuggestedBlockFromTemplate(
  templateKeys: readonly string[],
  existingGroups: SpecGroup[],
): SpecBlockState {
  const flatSpecs = flattenSpecGroups(existingGroups);

  return {
    id: createRowId('block'),
    group_id: slugifyTitle(SUGGESTED_BLOCK_TITLE),
    group_title: SUGGESTED_BLOCK_TITLE,
    is_collapsed_default: false,
    properties: templateKeys.map((key) => createEmptyPropertyRow(key, flatSpecs[key] ?? '')),
  };
}

export function hasSuggestedBlock(blocks: SpecBlockState[]): boolean {
  return blocks.some((block) => block.group_title.trim() === SUGGESTED_BLOCK_TITLE);
}

export function updateBlockTitle(block: SpecBlockState, title: string): SpecBlockState {
  const trimmedTitle = title;
  return {
    ...block,
    group_title: trimmedTitle,
    group_id: slugifyTitle(trimmedTitle.trim()) || block.group_id,
  };
}
