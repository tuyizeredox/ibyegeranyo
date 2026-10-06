'use client';

import { useMemo, useState } from 'react';
import { Search, SearchX, X } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { DocumentaryCard, type DocumentaryCardData } from './DocumentaryCard';
import { EmptyState } from './EmptyState';

export interface LibraryItem {
  documentary: DocumentaryCardData;
  thumbnail: string;
}

export function DocumentaryLibrary({ items }: { items: LibraryItem[] }) {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);

  const categories = useMemo(
    () => [...new Set(items.map(({ documentary }) => documentary.category).filter(Boolean))].sort(),
    [items],
  );

  const needle = query.trim().toLowerCase();
  const visible = items.filter(({ documentary }) => {
    if (category && documentary.category !== category) return false;
    if (!needle) return true;
    return `${documentary.title} ${documentary.summary} ${documentary.category}`.toLowerCase().includes(needle);
  });

  if (items.length === 0) {
    return <EmptyState title={t('No documentaries available yet.')} />;
  }

  const chip = (active: boolean) =>
    `shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
      active
        ? 'border-white bg-white text-background'
        : 'border-white/10 bg-white/[0.03] text-white/70 hover:border-white/25 hover:text-white'
    }`;

  return (
    <div className="flex flex-col gap-8">
      <div className="sticky top-16 z-30 -mx-4 flex flex-col gap-4 border-b border-white/[0.06] bg-background/85 px-4 py-4 backdrop-blur-xl md:flex-row md:items-center">
        <label className="relative block md:w-80 md:shrink-0">
          <span className="sr-only">{t('Search documentaries')}</span>
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('Search documentaries')}
            className="input rounded-full pl-11 pr-11"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-text-muted hover:bg-white/10 hover:text-white"
            >
              <X size={16} />
            </button>
          )}
        </label>

        {categories.length > 1 && (
          <div className="hide-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
            <button type="button" onClick={() => setCategory(null)} aria-pressed={!category} className={chip(!category)}>
              {t('All')}
            </button>
            {categories.map((name) => (
              <button key={name} type="button" onClick={() => setCategory(name)} aria-pressed={category === name} className={chip(category === name)}>
                {name}
              </button>
            ))}
          </div>
        )}
      </div>

      {visible.length === 0 ? (
        <EmptyState icon={SearchX} title={t('No documentaries match your search.')} />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map(({ documentary, thumbnail }) => (
            <DocumentaryCard key={documentary.id} documentary={documentary} thumbnail={thumbnail} />
          ))}
        </div>
      )}
    </div>
  );
}
