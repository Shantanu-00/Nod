'use client';

import React, { useEffect, useState, useCallback, useTransition } from 'react';
import { FeedItem } from '@/types';
import { ArticleCard } from './ArticleCard';
import { Search, Sparkles, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

export function FeedList() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'clarity' | 'quick' | 'deep'>('latest');
  const [isPending, startTransition] = useTransition();

  const categories = [
    { id: 'all', label: 'All Stories' },
    { id: 'strategies', label: '💡 Strategies' },
    { id: 'stories', label: '📖 Lived Stories' },
    { id: 'technology', label: '🛠 Assistive Tech' },
    { id: 'discussion', label: '💬 Discussion' },
  ];

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/feed?category=${encodeURIComponent(selectedCategory)}`);
      const data = await res.json();
      setItems(data.items || []);
    } catch (err) {
      console.error('Failed to load feed:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchFeed();

    const handleFeedUpdate = () => fetchFeed();
    window.addEventListener('nod:feed-updated', handleFeedUpdate);
    return () => window.removeEventListener('nod:feed-updated', handleFeedUpdate);
  }, [fetchFeed]);

  const handleCategoryChange = (catId: string) => {
    startTransition(() => {
      setSelectedCategory(catId);
    });
  };

  // Filter and sort items
  const processedItems = items
    .filter((item) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        (item.author.handle && item.author.handle.toLowerCase().includes(q)) ||
        item.tags.some((t) => t.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      if (sortBy === 'clarity') return b.metrics.clarityScore - a.metrics.clarityScore;
      if (sortBy === 'quick') return a.metrics.skimMinutes - b.metrics.skimMinutes;
      if (sortBy === 'deep') return b.metrics.deepReadMinutes - a.metrics.deepReadMinutes;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="space-y-6">
      {/* Category Navigation Bar & Search */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pb-2 border-b border-brand-border">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`touch-target px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-brand-text text-brand-surface font-bold shadow-xs'
                  : 'bg-brand-surface border border-brand-border text-brand-muted hover:text-brand-text hover:bg-brand-surface-elevated'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Sort & Search Controls */}
        <div className="flex items-center gap-2.5">
          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="touch-target pl-3 pr-8 py-1.5 bg-brand-surface border border-brand-border rounded-full text-xs font-medium text-brand-text focus:outline-none focus:border-brand-green appearance-none cursor-pointer shadow-xs"
              aria-label="Sort feed"
            >
              <option value="latest">Sort: Latest</option>
              <option value="clarity">Sort: High Clarity</option>
              <option value="quick">Sort: Quick Skim</option>
              <option value="deep">Sort: Deep Read</option>
            </select>
            <ArrowUpDown className="w-3 h-3 text-brand-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Search Box */}
          <div className="relative flex-1 sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-muted" />
            <input
              type="text"
              placeholder="Search stories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-brand-surface border border-brand-border focus:border-brand-green rounded-full text-xs text-brand-text placeholder-brand-muted focus:outline-none focus:ring-1 focus:ring-brand-green/30 shadow-xs"
              aria-label="Search stories"
            />
          </div>
        </div>
      </div>

      {/* Feed Stream */}
      {loading || isPending ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-44 bg-brand-surface border border-brand-border rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : processedItems.length === 0 ? (
        <div className="p-12 text-center bg-brand-surface border border-brand-border rounded-3xl">
          <Sparkles className="w-8 h-8 text-brand-green mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-bold text-brand-text mb-1">No stories match your criteria</h3>
          <p className="text-xs text-brand-muted max-w-sm mx-auto">
            Try choosing a different topic, clearing your search, or write your own post.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {processedItems.map((item) => (
            <ArticleCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
