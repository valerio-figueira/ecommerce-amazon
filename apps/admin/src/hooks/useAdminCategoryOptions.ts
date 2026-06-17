'use client';

import { adminClientFetch } from '@/lib/api/admin-client';

import { useEffect, useState } from 'react';

import {
  flattenAdminCategoriesForPicker,
  type CategoryFlatOption,
} from '@/lib/api/categories-utils';
import { adminCategoriesResponseSchema } from '@ecommerce-amazon/shared/admin';

export function useAdminCategoryOptions(): CategoryFlatOption[] {
  const [categoryOptions, setCategoryOptions] = useState<CategoryFlatOption[]>([]);

  useEffect(() => {
    void adminClientFetch('/api/admin/categories', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) return [];
        const payload: unknown = await response.json();
        const parsed = adminCategoriesResponseSchema.safeParse(payload);
        if (!parsed.success) return [];
        return flattenAdminCategoriesForPicker(parsed.data.items);
      })
      .then(setCategoryOptions)
      .catch(() => setCategoryOptions([]));
  }, []);

  return categoryOptions;
}
