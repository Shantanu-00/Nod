import React from 'react';
import Link from 'next/link';
import { FeedList } from '@/components/feed/FeedList';
import { Mascot } from '@/components/brand/Mascot';
import { Sparkles, PenSquare } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      {/* Editorial Welcome & Community Spotlight */}
      <section className="relative overflow-hidden rounded-3xl bg-brand-surface border border-brand-border p-6 sm:p-10 shadow-xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-green-muted text-brand-green-text text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-brand-green" />
              <span>Thoughtful, Accessible Publishing</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-brand-text tracking-tight leading-snug">
              Stories, research, and strategies written for cognitive clarity.
            </h1>

            <p className="text-sm sm:text-base text-brand-muted leading-relaxed">
              An open community where authors write with voice preservation and readers explore with zero visual stress. Every article can be simplified in place or previewed with agent synthesis.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <Link
                href="/articles/new"
                className="touch-target px-5 py-2.5 bg-brand-green hover:bg-brand-green-hover text-white font-bold text-xs sm:text-sm rounded-full flex items-center gap-2 transition-transform active:scale-95 shadow-xs"
              >
                <PenSquare className="w-4 h-4" />
                <span>Start a Post</span>
              </Link>

              <a
                href="#feed-section"
                className="touch-target px-4 py-2 bg-brand-surface-elevated hover:bg-brand-border-warm text-brand-text text-xs sm:text-sm font-semibold rounded-full border border-brand-border transition-colors"
              >
                Browse Feed
              </a>
            </div>
          </div>

          {/* Pure Vector Mascot (No black box, transparent backdrop) */}
          <div className="shrink-0 flex flex-col items-center">
            <div className="relative">
              <div className="absolute -top-7 -left-10 whitespace-nowrap px-3 py-1 bg-brand-text text-brand-surface rounded-full text-[11px] font-medium shadow-md">
                (•.•) Here to assist your reading
              </div>
              <Mascot size="hero" showStatusBubble={false} />
            </div>
          </div>
        </div>
      </section>

      {/* Main Feed Section with Navigation & Sorting */}
      <section id="feed-section" className="space-y-6">
        <FeedList />
      </section>
    </div>
  );
}
