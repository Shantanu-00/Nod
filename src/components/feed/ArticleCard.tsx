'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FeedItem } from '@/types';
import { useStore } from '@/lib/store/useStore';
import { BionicText } from '@/components/accessibility/BionicText';
import { getClarityTagStyle } from '@/lib/utils/a11y-metrics';
import { Clock, MessageSquare, Heart, Sparkles, ArrowRight } from 'lucide-react';

interface ArticleCardProps {
  item: FeedItem;
  density?: 'comfortable' | 'compact';
}

export function ArticleCard({ item, density = 'comfortable' }: ArticleCardProps) {
  const setPeekArticleId = useStore((state) => state.setPeekArticleId);
  const preferences = useStore((state) => state.readingPreferences);
  const [likes, setLikes] = useState(item.likesCount || 0);
  const [hasLiked, setHasLiked] = useState(false);

  const clarityStyle = getClarityTagStyle(item.metrics.clarityGrade);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasLiked) {
      setLikes((prev) => Math.max(0, prev - 1));
      setHasLiked(false);
    } else {
      setLikes((prev) => prev + 1);
      setHasLiked(true);
    }
  };

  const letterSpacingMap = {
    normal: '0.01em',
    wide: '0.08em',
    'extra-wide': '0.16em',
  };

  const lineHeightMap = {
    normal: '1.5',
    relaxed: '1.8',
    loose: '2.1',
  };

  const currentSpacing = letterSpacingMap[preferences.letterSpacing] || '0.01em';
  const currentLineHeight = lineHeightMap[preferences.lineHeight] || '1.5';

  if (density === 'compact') {
    return (
      <article 
        className="group rounded-2xl p-3 sm:p-4 transition-all duration-150 hover:shadow-xs flex items-center justify-between gap-3 border"
        style={{
          backgroundColor: 'var(--canvas-surface)',
          borderColor: 'var(--canvas-border)',
          color: 'var(--canvas-text)',
        }}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shrink-0 ${clarityStyle.bg} ${clarityStyle.text} ${clarityStyle.border}`}>
            {item.metrics.clarityGrade}
          </span>

          <div className="min-w-0 flex-1">
            <h3 
              className="text-sm sm:text-base font-bold truncate group-hover:text-brand-green transition-colors"
              style={{
                letterSpacing: currentSpacing,
              }}
            >
              <Link href={`/articles/${item.id}`} className="hover:underline focus:outline-none focus:ring-2 focus:ring-brand-green rounded">
                <BionicText text={item.title} as="span" />
              </Link>
            </h3>
            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--canvas-muted)' }}>
              <span>{item.author.name}</span>
              <span>•</span>
              <span className="capitalize">{item.category}</span>
              <span>•</span>
              <span>{item.metrics.deepReadMinutes}m read</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setPeekArticleId(item.id)}
            className="touch-target px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-colors border"
            style={{
              backgroundColor: 'var(--canvas-bg)',
              borderColor: 'var(--canvas-border)',
              color: 'var(--canvas-text)',
            }}
            title="Open quick summary peek modal"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-green" />
            <span className="hidden sm:inline">Peek</span>
          </button>

          <Link
            href={`/articles/${item.id}`}
            className="touch-target px-3.5 py-1 rounded-full text-xs font-bold bg-brand-green-muted text-brand-green-text hover:bg-brand-green hover:text-white flex items-center gap-1 transition-all"
          >
            <span>Read</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </article>
    );
  }

  return (
    <article 
      className="group rounded-3xl p-4 sm:p-5 transition-all duration-200 hover:shadow-sm flex flex-col justify-between border"
      style={{
        backgroundColor: 'var(--canvas-surface)',
        borderColor: 'var(--canvas-border)',
        color: 'var(--canvas-text)',
      }}
    >
      <div>
        {/* Author Header Bar */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            {item.author.avatar ? (
              <img
                src={item.author.avatar}
                alt={item.author.name}
                className="w-8 h-8 rounded-full object-cover border"
                style={{ borderColor: 'var(--canvas-border)' }}
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-brand-green-muted text-brand-green font-bold text-xs flex items-center justify-center">
                {item.author.name.charAt(0)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold" style={{ color: 'var(--canvas-text)' }}>
                  {item.author.name}
                </span>
                <span className="text-xs font-medium" style={{ color: 'var(--canvas-muted)' }}>
                  {item.author.handle || '@contributor'}
                </span>
              </div>
              {item.author.badge && (
                <span className="text-[10px] font-medium" style={{ color: 'var(--canvas-muted)' }}>
                  {item.author.badge}
                </span>
              )}
            </div>
          </div>

          {/* Clarity Grade Badge */}
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${clarityStyle.bg} ${clarityStyle.text} ${clarityStyle.border}`}>
            {item.metrics.clarityGrade}
          </span>
        </div>

        {/* Title (Obeys Font, Tracking, and Leading) */}
        <h2 
          className="text-xl sm:text-2xl font-extrabold group-hover:text-brand-green transition-colors mb-2 tracking-tight"
          style={{
            letterSpacing: currentSpacing,
            lineHeight: currentLineHeight,
            color: 'var(--canvas-text)',
          }}
        >
          <button
            onClick={() => setPeekArticleId(item.id)}
            className="text-left hover:underline focus:outline-none focus:ring-2 focus:ring-brand-green rounded"
            title="Open quick summary modal"
          >
            <BionicText text={item.title} as="span" />
          </button>
        </h2>

        {/* Summary Synopsis (Obeys Font, Tracking, and Leading) */}
        <p 
          className="text-sm sm:text-base mb-4"
          style={{
            letterSpacing: currentSpacing,
            lineHeight: currentLineHeight,
            color: 'var(--canvas-muted)',
          }}
        >
          <BionicText text={item.summary} as="span" />
        </p>
      </div>

      <div>
        {/* Reading Pacing & Social Interaction Footer */}
        <div 
          className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t text-xs"
          style={{ 
            borderColor: 'var(--canvas-border)',
            color: 'var(--canvas-muted)',
          }}
        >
          {/* Pacing Info */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1" title="Estimated reading pace">
              <Clock className="w-3.5 h-3.5" />
              <span>Deep Read: {item.metrics.deepReadMinutes} min</span>
            </div>

            <span>•</span>

            <div className="hidden sm:inline">
              Skim: {item.metrics.skimMinutes} min
            </div>

            {/* Like button */}
            <button
              onClick={handleLike}
              className={`touch-target px-2 py-1 rounded-full flex items-center gap-1 transition-all ${
                hasLiked ? 'text-rose-600 font-bold' : 'hover:opacity-80'
              }`}
              title="Appreciate this story"
            >
              <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-rose-600' : ''}`} />
              <span>{likes}</span>
            </button>

            {/* Comments count */}
            <div className="flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{item.commentCount || 0}</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2">
            {/* Quick Peek (Opens centered modal) */}
            <button
              onClick={() => setPeekArticleId(item.id)}
              className="touch-target px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors border"
              style={{
                backgroundColor: 'var(--canvas-bg)',
                borderColor: 'var(--canvas-border)',
                color: 'var(--canvas-text)',
              }}
              title="Open quick plain-language summary modal"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-green" />
              <span>Quick Peek</span>
            </button>

            {/* Full Story Link */}
            <Link
              href={`/articles/${item.id}`}
              className="touch-target px-4 py-1.5 rounded-full text-xs font-bold bg-brand-green-muted text-brand-green-text hover:bg-brand-green hover:text-white flex items-center gap-1 transition-all"
            >
              <span>Read</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
