'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store/useStore';
import { Lightbulb, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';

export function SimplifiedBanner() {
  const simplifiedView = useStore((state) => state.simplifiedView);
  const [isExpanded, setIsExpanded] = useState(false);

  const takeaways = simplifiedView.keyTakeaways || [];
  if (takeaways.length === 0) return null;

  return (
    <div 
      className="mb-6 rounded-2xl border transition-all duration-200 overflow-hidden"
      style={{
        backgroundColor: 'var(--canvas-bg)',
        borderColor: 'var(--canvas-border)',
      }}
    >
      {/* Collapsible Header Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="touch-target w-full px-4 py-3 flex items-center justify-between text-left hover:opacity-90 transition-opacity"
        aria-expanded={isExpanded}
        aria-label="Toggle working memory takeaways"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-brand-green/15 text-brand-green flex items-center justify-center shrink-0">
            <Lightbulb className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs sm:text-sm font-bold" style={{ color: 'var(--canvas-text)' }}>
              Key Takeaways
            </span>
            <span className="ml-2 text-xs font-medium" style={{ color: 'var(--canvas-muted)' }}>
              ({takeaways.length} working memory anchors)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs font-semibold text-brand-green">
          <span>{isExpanded ? 'Hide' : 'Quick Skim'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded Bullet Points */}
      {isExpanded && (
        <div 
          className="px-4 pb-4 pt-1 border-t space-y-2 animate-in fade-in duration-150"
          style={{ borderColor: 'var(--canvas-border)' }}
        >
          <ul className="space-y-2 pt-1">
            {takeaways.map((point, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm" style={{ color: 'var(--canvas-text)' }}>
                <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                <span className="leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

