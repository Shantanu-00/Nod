'use client';

import React from 'react';
import { useStore } from '@/lib/store/useStore';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export function SimplifiedBanner() {
  const simplifiedView = useStore((state) => state.simplifiedView);
  const toggleSimplified = useStore((state) => state.toggleSimplifiedView);

  if (!simplifiedView.simplifiedContent) return null;

  return (
    <div className="mb-6 p-5 rounded-2xl border border-brand-green/30 bg-brand-surface shadow-xs">
      {/* Non-Destructive In-Place Switch */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-brand-border">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-green animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-brand-green">
            Cognitive Simplification Engine (WebMCP)
          </span>
        </div>

        {/* Comparison Switch Pill */}
        <div 
          role="radiogroup" 
          aria-label="View Mode"
          className="inline-flex p-1 rounded-full bg-brand-surface-elevated border border-brand-border text-xs font-semibold"
        >
          <button
            role="radio"
            aria-checked={!simplifiedView.isActive}
            onClick={() => simplifiedView.isActive && toggleSimplified()}
            className={`touch-target px-3.5 py-1 rounded-full transition-all ${
              !simplifiedView.isActive
                ? 'bg-brand-surface text-brand-text font-bold shadow-xs border border-brand-border'
                : 'text-brand-muted hover:text-brand-text'
            }`}
          >
            Original View
          </button>
          <button
            role="radio"
            aria-checked={simplifiedView.isActive}
            onClick={() => !simplifiedView.isActive && toggleSimplified()}
            className={`touch-target px-3.5 py-1 rounded-full flex items-center gap-1.5 transition-all ${
              simplifiedView.isActive
                ? 'bg-brand-green text-white font-bold shadow-sm'
                : 'text-brand-muted hover:text-brand-green'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>✨ Simplified by NOD</span>
          </button>
        </div>
      </div>

      {/* Key Takeaways (Working Memory Anchors) */}
      {simplifiedView.keyTakeaways && simplifiedView.keyTakeaways.length > 0 && (
        <div className="mt-3 pt-1">
          <div className="text-xs font-bold text-brand-muted uppercase tracking-wider mb-2">
            Working Memory Anchors (Key Takeaways)
          </div>
          <ul className="space-y-1.5">
            {simplifiedView.keyTakeaways.map((point, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-brand-text">
                <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
