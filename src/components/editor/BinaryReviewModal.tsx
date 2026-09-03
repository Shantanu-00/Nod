'use client';

import React, { useEffect } from 'react';
import { Sparkles, Check, X, Keyboard } from 'lucide-react';

interface BinaryReviewModalProps {
  original: string;
  proposal: string;
  onAccept: (accepted: string) => void;
  onReject: () => void;
}

export function BinaryReviewModal({ original, proposal, onAccept, onReject }: BinaryReviewModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        onAccept(proposal);
      } else if (e.key === 'Backspace' || e.key === 'Escape') {
        e.preventDefault();
        onReject();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [proposal, onAccept, onReject]);

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-labelledby="review-modal-title"
      aria-modal="true"
    >
      <div className="w-full max-w-2xl bg-brand-surface border border-brand-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-brand-border">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-green" />
            <h3 id="review-modal-title" className="text-base sm:text-lg font-bold text-brand-text">
              Binary Gatekeeper Review
            </h3>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-brand-muted font-medium bg-brand-surface-elevated px-3 py-1 rounded-full border border-brand-border">
            <Keyboard className="w-3.5 h-3.5 text-brand-green" />
            <span>Zero Mouse Dragging</span>
          </div>
        </div>

        {/* Side by side / Stacked comparison */}
        <div className="space-y-4 text-xs sm:text-sm">
          {/* Original */}
          <div className="p-3.5 bg-brand-surface-elevated border border-brand-border rounded-xl">
            <div className="text-[11px] font-bold uppercase tracking-wider text-brand-muted mb-1.5">
              Original Shorthand Notes
            </div>
            <p className="text-brand-muted line-through decoration-rose-400/50 leading-relaxed font-mono">
              {original}
            </p>
          </div>

          {/* Proposal */}
          <div className="p-4 bg-brand-green-muted/40 border border-brand-green/30 rounded-xl shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-brand-green mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              <span>NOD Structured Proposal (Voice Preserved)</span>
            </div>
            <p className="text-brand-text font-medium leading-relaxed">
              {proposal}
            </p>
          </div>
        </div>

        {/* Keyboard Binary Decision Guides */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          {/* Reject */}
          <button
            type="button"
            onClick={onReject}
            className="touch-target py-3 px-4 rounded-2xl border border-brand-border bg-brand-surface hover:bg-rose-50 hover:border-rose-300 text-brand-muted hover:text-rose-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Reject [Backspace / Esc]</span>
          </button>

          {/* Accept */}
          <button
            type="button"
            onClick={() => onAccept(proposal)}
            className="touch-target py-3 px-4 rounded-2xl bg-brand-green hover:bg-brand-green-hover text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Accept Proposal [Space / Enter]</span>
          </button>
        </div>
      </div>
    </div>
  );
}
