-- Convert legacy flat specs_normalized objects to grouped array format

UPDATE products
SET specs_normalized = '[]'::jsonb
WHERE specs_normalized = '{}'::jsonb OR specs_normalized IS NULL;

UPDATE products
SET specs_normalized = (
  SELECT jsonb_agg(
    jsonb_build_object(
      'group_id', 'detalhes_produto',
      'group_title', 'Detalhes do Produto',
      'is_collapsed_default', false,
      'properties', json_properties
    )
  )
  FROM (
    SELECT jsonb_agg(jsonb_build_object('key', key, 'value', value)) AS json_properties
    FROM jsonb_each_text(specs_normalized)
  ) _
)
WHERE jsonb_typeof(specs_normalized) = 'object'
  AND specs_normalized != '{}'::jsonb;

ALTER TABLE products ALTER COLUMN specs_normalized SET DEFAULT '[]'::jsonb;
