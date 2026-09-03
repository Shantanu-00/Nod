'use client';

import React, { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store/useStore';
import { 
  ShieldCheck, 
  Send, 
  X, 
  Sparkles, 
  Keyboard, 
  Clock, 
  FileText, 
  CheckCircle2, 
  Loader2,
  Tag
} from 'lucide-react';

export function PublishApprovalCard() {
  const router = useRouter();
  const staged = useStore((state) => state.stagedPost);
  const confirmPublish = useStore((state) => state.confirmPublishStagedPost);
  const cancelStaged = useStore((state) => state.cancelStagedPost);

  const handleConfirm = useCallback(async () => {
    if (!staged || staged.isSubmitting) return;
    const result = await confirmPublish();
    if (result.success && result.id) {
      router.push(`/articles/${result.id}`);
    }
  }, [staged, confirmPublish, router]);

  const handleCancel = useCallback(() => {
    if (!staged || staged.isSubmitting) return;
    cancelStaged();
  }, [staged, cancelStaged]);

  useEffect(() => {
    if (!staged) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (staged.isSubmitting) return;

      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        handleConfirm();
      } else if (e.key === 'Escape' || e.key === 'Backspace') {
        e.preventDefault();
        handleCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [staged, handleConfirm, handleCancel]);

  if (!staged) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-labelledby="approval-card-title"
      aria-modal="true"
    >
      <div className="w-full max-w-2xl bg-brand-surface border border-brand-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
        {/* Header with Human-in-the-Loop & Agent Badges */}
        <div className="flex items-center justify-between pb-3 border-b border-brand-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-brand-green/20 border border-brand-green/40 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-brand-green" />
            </div>
            <div>
              <h3 id="approval-card-title" className="text-base sm:text-lg font-extrabold text-brand-text">
                Publishing Approval Card
              </h3>
              <p className="text-xs text-brand-muted">
                Human-in-the-Loop Verification · Staged by NOD Agent
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-brand-muted font-medium bg-brand-surface-elevated px-3 py-1 rounded-full border border-brand-border">
            <Keyboard className="w-3.5 h-3.5 text-brand-green" />
            <span>Zero-Mouse Confirmation</span>
          </div>
        </div>

        {/* Content Summary Box */}
        <div className="space-y-3">
          <div className="p-4 bg-brand-surface-elevated border border-brand-border rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-brand-green/15 text-brand-green border border-brand-green/30">
                {staged.category}
              </span>
              <span className="text-xs text-brand-muted">
                By <strong className="text-brand-text font-semibold">{staged.authorName}</strong> ({staged.handle})
              </span>
            </div>

            <h4 className="text-base sm:text-lg font-bold text-brand-text leading-snug">
              {staged.title}
            </h4>

            {/* Readability & Content Stats */}
            <div className="flex items-center gap-4 text-xs text-brand-muted pt-1 border-t border-brand-border/60">
              <div className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-brand-green" />
                <span>{staged.metrics.wordCount} words</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-brand-green" />
                <span>~{staged.metrics.skimMinutes} min read</span>
              </div>
              <div className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-brand-green" />
                <span>Clarity: <strong className="text-brand-green font-semibold">{staged.metrics.clarityGrade}</strong></span>
              </div>
            </div>
          </div>

          {/* Excerpt Preview Box */}
          <div className="p-4 bg-brand-green-muted/30 border border-brand-green/20 rounded-2xl space-y-1.5 max-h-40 overflow-y-auto">
            <div className="text-[11px] font-bold uppercase tracking-wider text-brand-muted flex items-center gap-1.5">
              <span>Excerpt Preview</span>
            </div>
            <p className="text-xs sm:text-sm text-brand-text leading-relaxed font-sans line-clamp-4">
              {staged.content}
            </p>
          </div>

          {/* Tags */}
          {staged.tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <Tag className="w-3.5 h-3.5 text-brand-muted" />
              {staged.tags.map((tag) => (
                <span key={tag} className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-brand-surface-elevated border border-brand-border text-brand-muted">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Controls & Confirmation Prompts */}
        <div className="pt-2">
          <p className="text-xs text-brand-muted text-center mb-3">
            Your explicit consent is required before saving to Netlify Blobs and the public community feed.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {/* Cancel Button */}
            <button
              type="button"
              onClick={handleCancel}
              disabled={staged.isSubmitting}
              className="touch-target py-3 px-4 rounded-2xl border border-brand-border bg-brand-surface hover:bg-rose-50 hover:border-rose-300 text-brand-muted hover:text-rose-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              <span>Cancel [Esc]</span>
            </button>

            {/* Confirm Button */}
            <button
              type="button"
              onClick={handleConfirm}
              disabled={staged.isSubmitting}
              className="touch-target py-3 px-4 rounded-2xl bg-brand-green hover:bg-brand-green-hover text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95 disabled:opacity-50"
            >
              {staged.isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 fill-white" />
                  <span>Confirm & Publish [Enter]</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
