'use client';

import { useMemo, useState } from 'react';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AdminArticlePickerOption } from '@/lib/api/cms-pages-client';

type ArticleIdPickerProps = {
  articles: AdminArticlePickerOption[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
};

export function ArticleIdPicker({
  articles,
  value,
  onChange,
  placeholder = 'Escolha um artigo',
}: ArticleIdPickerProps): React.JSX.Element {
  const [filter, setFilter] = useState('');

  const filtered = useMemo(() => {
    const query = filter.trim().toLowerCase();
    if (!query) return articles;
    return articles.filter(
      (article) =>
        article.title.toLowerCase().includes(query) ||
        article.slug.toLowerCase().includes(query),
    );
  }, [articles, filter]);

  return (
    <div className="space-y-2">
      <Input
        type="search"
        value={filter}
        onChange={(event) => setFilter(event.target.value)}
        placeholder="Buscar por título ou slug…"
        className="text-sm"
      />
      <Select {...(value !== '' ? { value } : {})} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {filtered.length === 0 ? (
            <SelectItem value="__empty__" disabled>
              Nenhum artigo publicado encontrado
            </SelectItem>
          ) : (
            filtered.map((article) => (
              <SelectItem key={article.id} value={article.id}>
                {article.title}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
