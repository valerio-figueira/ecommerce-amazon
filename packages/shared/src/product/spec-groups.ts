import { z } from 'zod';

import { slugifyTitle } from '../marketplace/slugify-title.js';

export type SpecProperty = {
  key: string;
  value: string;
};

export type SpecGroup = {
  group_id: string;
  group_title: string;
  is_collapsed_default: boolean;
  properties: SpecProperty[];
};

export type SpecsNormalized = SpecGroup[];

export const specPropertySchema = z.object({
  key: z.string(),
  value: z.string(),
});

export const specGroupSchema = z.object({
  group_id: z.string(),
  group_title: z.string(),
  is_collapsed_default: z.boolean(),
  properties: z.array(specPropertySchema),
});

export const specsNormalizedSchema = z.array(specGroupSchema);

const LEGACY_DEFAULT_GROUP_ID = 'detalhes_produto';
const LEGACY_DEFAULT_GROUP_TITLE = 'Detalhes do Produto';

export function ensureUniqueGroupIdInScope(baseId: string, usedIds: Set<string>): string {
  const normalizedBase = baseId.trim() || 'grupo';
  let candidate = normalizedBase;
  let suffix = 2;

  while (usedIds.has(candidate)) {
    candidate = `${normalizedBase}-${suffix}`;
    suffix += 1;
  }

  usedIds.add(candidate);
  return candidate;
}

function sanitizeProperties(properties: SpecProperty[]): SpecProperty[] {
  return properties
    .map((property) => ({
      key: property.key.trim(),
      value: property.value.trim(),
    }))
    .filter((property) => property.key.length > 0 && property.value.length > 0);
}

export function normalizeSpecsGroups(input: SpecGroup[]): SpecGroup[] {
  const usedGroupIds = new Set<string>();
  const normalized: SpecGroup[] = [];

  for (const group of input) {
    const groupTitle = group.group_title.trim();
    if (groupTitle.length === 0) {
      continue;
    }

    const properties = sanitizeProperties(group.properties);
    if (properties.length === 0) {
      continue;
    }

    const baseId = group.group_id.trim() || slugifyTitle(groupTitle) || LEGACY_DEFAULT_GROUP_ID;

    normalized.push({
      group_id: ensureUniqueGroupIdInScope(baseId, usedGroupIds),
      group_title: groupTitle,
      is_collapsed_default: group.is_collapsed_default,
      properties,
    });
  }

  return normalized;
}

export function flattenSpecGroups(groups: SpecGroup[]): Record<string, string> {
  const result: Record<string, string> = {};

  for (const group of groups) {
    for (const property of group.properties) {
      const key = property.key.trim();
      const value = property.value.trim();
      if (key.length > 0 && value.length > 0) {
        result[key] = value;
      }
    }
  }

  return result;
}

export function legacyRecordToSpecGroups(record: Record<string, string>): SpecGroup[] {
  const properties = Object.entries(record)
    .map(([key, value]) => ({
      key: key.trim(),
      value: value.trim(),
    }))
    .filter((property) => property.key.length > 0 && property.value.length > 0);

  if (properties.length === 0) {
    return [];
  }

  return normalizeSpecsGroups([
    {
      group_id: LEGACY_DEFAULT_GROUP_ID,
      group_title: LEGACY_DEFAULT_GROUP_TITLE,
      is_collapsed_default: false,
      properties,
    },
  ]);
}

export function parseSpecsNormalizedFromDb(value: unknown): SpecGroup[] {
  if (Array.isArray(value)) {
    const parsed = specsNormalizedSchema.safeParse(value);
    return parsed.success ? normalizeSpecsGroups(parsed.data) : [];
  }

  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    const entries = Object.entries(value as Record<string, unknown>);
    const record: Record<string, string> = {};

    for (const [key, entryValue] of entries) {
      if (typeof entryValue === 'string') {
        record[key] = entryValue;
      }
    }

    return legacyRecordToSpecGroups(record);
  }

  return [];
}

export function filterActiveSpecGroups(groups: SpecGroup[]): SpecGroup[] {
  return groups.filter((group) => group.properties.length > 0);
}
