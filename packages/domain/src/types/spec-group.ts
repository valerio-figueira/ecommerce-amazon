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
