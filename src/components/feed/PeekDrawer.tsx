'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/lib/store/useStore';
import { ArticleDetail } from '@/types';
import { ReadingCanvas } from '@/components/article/ReadingCanvas';
import { X, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export function PeekDrawer() {
  const peekId = useStore((state) => state.peekArticleId);
  const setPeekId = useStore((state) => state.setPeekArticleId);
  const setActiveArticle = useStore((state) => state.setActiveArticle);
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!peekId) {
      setArticle(null);
      return;
    }

    setLoading(true);
    fetch(`/api/articles/${peekId}`)
      .then((res) => res.json())
      .then((data) => {
        setArticle(data);
        setActiveArticle(data);
      })
      .catch((err) => console.error('Peek fetch error:', err))
      .finally(() => setLoading(false));

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPeekId(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [peekId, setPeekId, setActiveArticle]);

  if (!peekId) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Article Peek Preview"
    >
      {/* Dimmed backdrop click to dismiss */}
      <div 
        className="flex-1 cursor-pointer"
        onClick={() => setPeekId(null)}
        title="Click to dismiss and restore feed view"
      />

      {/* Drawer Container (Sliding Split Canvas) */}
      <div className="w-full max-w-3xl h-full bg-brand-bg border-l border-brand-border shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Peek Navigation Bar */}
        <div className="h-14 px-6 border-b border-brand-border flex items-center justify-between bg-brand-surface/90 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs text-brand-muted">
            <span className="w-2 h-2 rounded-full bg-brand-green" />
            <span className="font-semibold text-brand-text">Zero-Disorientation Peek (read.nod)</span>
            <span className="hidden sm:inline">• (Press Esc to close)</span>
          </div>

          <div className="flex items-center gap-2">
            {article && (
              <Link
                href={`/articles/${article.id}`}
                className="touch-target px-3 py-1 text-xs font-semibold rounded-full bg-brand-surface-elevated hover:bg-brand-border-warm text-brand-text flex items-center gap-1.5 transition-colors border border-brand-border"
                title="Open full page view"
              >
                <span>Full Page</span>
                <ExternalLink className="w-3.5 h-3.5 text-brand-green" />
              </Link>
            )}

            <button
              onClick={() => setPeekId(null)}
              className="touch-target p-1.5 rounded-full text-brand-muted hover:text-brand-text hover:bg-brand-surface-elevated transition-colors"
              aria-label="Close peek drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Peek Canvas Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="space-y-4 animate-pulse p-8">
              <div className="h-8 bg-brand-surface rounded-xl w-3/4" />
              <div className="h-4 bg-brand-surface rounded w-1/2" />
              <div className="h-40 bg-brand-surface rounded-2xl mt-6" />
            </div>
          ) : article ? (
            <ReadingCanvas article={article} />
          ) : (
            <div className="p-8 text-center text-brand-muted">Could not load article preview.</div>
          )}
        </div>
      </div>
    </div>
  );
}
