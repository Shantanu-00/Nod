'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FeedItem } from '@/types';
import { useStore } from '@/lib/store/useStore';
import { BionicText } from '@/components/accessibility/BionicText';
import { getClarityTagStyle } from '@/lib/utils/a11y-metrics';
import { Clock, MessageSquare, Heart, Sparkles, ArrowRight, BookOpen } from 'lucide-react';

interface ArticleCardProps {
  item: FeedItem;
}

export function ArticleCard({ item }: ArticleCardProps) {
  const setPeekArticleId = useStore((state) => state.setPeekArticleId);
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

  return (
    <article className="group bg-brand-surface border border-brand-border hover:border-brand-border-warm rounded-3xl p-5 sm:p-7 transition-all duration-200 hover:shadow-md flex flex-col justify-between">
      <div>
        {/* Author Header Bar */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            {item.author.avatar ? (
              <img
                src={item.author.avatar}
                alt={item.author.name}
                className="w-8 h-8 rounded-full object-cover border border-brand-border"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-brand-green-muted text-brand-green font-bold text-xs flex items-center justify-center">
                {item.author.name.charAt(0)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-brand-text">{item.author.name}</span>
                <span className="text-xs text-brand-muted font-medium">{item.author.handle || '@contributor'}</span>
              </div>
              {item.author.badge && (
                <span className="text-[10px] text-brand-muted font-medium">
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

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-extrabold text-brand-text group-hover:text-brand-green transition-colors mb-2 tracking-tight leading-snug">
          <button
            onClick={() => setPeekArticleId(item.id)}
            className="text-left hover:underline focus:outline-none focus:ring-2 focus:ring-brand-green rounded"
            title="Open quick summary modal"
          >
            <BionicText text={item.title} as="span" />
          </button>
        </h2>

        {/* Summary Synopsis */}
        <p className="text-sm sm:text-base text-brand-muted leading-relaxed mb-4">
          <BionicText text={item.summary} as="span" />
        </p>
      </div>

      <div>
        {/* Reading Pacing & Social Interaction Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-brand-border text-xs text-brand-muted">
          {/* Pacing Info */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1" title="Estimated reading pace">
              <Clock className="w-3.5 h-3.5 text-brand-muted" />
              <span>Deep Read: {item.metrics.deepReadMinutes} min</span>
            </div>

            <span>•</span>

            <div className="text-brand-muted hidden sm:inline">
              Skim: {item.metrics.skimMinutes} min
            </div>

            {/* Like button */}
            <button
              onClick={handleLike}
              className={`touch-target px-2 py-1 rounded-full flex items-center gap-1 transition-all ${
                hasLiked ? 'text-rose-600 font-bold' : 'hover:text-brand-text'
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
              className="touch-target px-3.5 py-1.5 rounded-full text-xs font-semibold bg-brand-surface-elevated hover:bg-brand-border-warm text-brand-text flex items-center gap-1.5 transition-colors border border-brand-border"
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
