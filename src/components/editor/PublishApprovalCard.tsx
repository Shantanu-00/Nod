'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  Tag,
  Eye
} from 'lucide-react';
import { AccessibleMarkdownContent, AccessibleInlineMarkdown } from '@/lib/utils/markdown';

export function PublishApprovalCard() {
  const router = useRouter();
  const staged = useStore((state) => state.stagedPost);
  const preferences = useStore((state) => state.readingPreferences);
  const confirmPublish = useStore((state) => state.confirmPublishStagedPost);
  const cancelStaged = useStore((state) => state.cancelStagedPost);

  // View Mode: 'summary' or 'canvas' (full-fidelity reading view)
  const [viewMode, setViewMode] = useState<'summary' | 'canvas'>('summary');

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
        // Prevent triggering confirm if focusing an interactive element inside modal
        const target = e.target as HTMLElement;
        if (target.tagName === 'BUTTON' && target.id !== 'confirm-publish-btn') {
          return;
        }
        e.preventDefault();
        handleConfirm();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [staged, handleConfirm, handleCancel]);

  if (!staged) return null;

  // Typography mappings for reading simulation
  const letterSpacingMap = {
    normal: '0.01em',
    wide: '0.08em',
    'extra-wide': '0.16em',
  };

  const lineHeightMap = {
    normal: '1.6',
    relaxed: '1.85',
    loose: '2.2',
  };

  const fontFamilyMap = {
    system: "'Plus Jakarta Sans', sans-serif",
    lexend: "'Lexend', sans-serif",
    atkinson: "'Atkinson Hyperlegible', sans-serif",
    opendyslexic: "'OpenDyslexic', 'Comic Sans MS', sans-serif",
  };

  const currentSpacing = letterSpacingMap[preferences.letterSpacing] || '0.01em';
  const currentLineHeight = lineHeightMap[preferences.lineHeight] || '1.7';
  const currentFontFamily = fontFamilyMap[preferences.fontFamily] || fontFamilyMap.system;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      role="dialog"
      aria-labelledby="approval-card-title"
      aria-modal="true"
    >
      <div 
        className={`w-full ${
          viewMode === 'canvas' ? 'max-w-4xl' : 'max-w-3xl'
        } max-h-[92vh] flex flex-col bg-brand-surface border border-brand-border rounded-3xl shadow-2xl transition-all duration-300 overflow-hidden`}
      >
        {/* Pinned Top Bar */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-brand-border bg-brand-surface shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-green/20 border border-brand-green/40 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-brand-green" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="approval-card-title" className="text-base sm:text-lg font-extrabold text-brand-text leading-tight">
                  Publishing Approval Card
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-brand-green/15 text-brand-green border border-brand-green/30">
                  Human Sovereign Gate
                </span>
              </div>
              <p className="text-xs text-brand-muted">
                Review complete story before persisting to public feed
              </p>
            </div>
          </div>

          {/* View Mode Toggle: Summary vs Full Canvas */}
          <div className="flex items-center gap-2">
            <div className="inline-flex p-1 rounded-xl bg-brand-surface-elevated border border-brand-border text-xs">
              <button
                type="button"
                onClick={() => setViewMode('summary')}
                className={`touch-target px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'summary'
                    ? 'bg-brand-surface text-brand-text shadow-xs border border-brand-border/60'
                    : 'text-brand-muted hover:text-brand-text'
                }`}
              >
                Verification Card
              </button>
              <button
                type="button"
                onClick={() => setViewMode('canvas')}
                className={`touch-target px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === 'canvas'
                    ? 'bg-brand-green text-white shadow-xs'
                    : 'text-brand-muted hover:text-brand-text'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Full Canvas Preview</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleCancel}
              disabled={staged.isSubmitting}
              className="p-1.5 rounded-lg text-brand-muted hover:text-brand-text hover:bg-brand-surface-elevated transition-colors"
              title="Close and return to editing"
              aria-label="Close approval card"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body with zero artificial text truncation */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-5">
          {viewMode === 'summary' ? (
            /* Mode A: Structured Verification Overview */
            <>
              {/* Metadata & Readability Overview */}
              <div className="p-4 sm:p-5 bg-brand-surface-elevated border border-brand-border rounded-2xl space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-green/15 text-brand-green border border-brand-green/30">
                      {staged.category}
                    </span>
                    <span className="text-xs text-brand-muted">
                      Author: <strong className="text-brand-text">{staged.authorName}</strong> ({staged.handle})
                    </span>
                  </div>

                  <div className="hidden sm:flex items-center gap-1.5 text-xs text-brand-muted font-medium bg-brand-surface px-2.5 py-1 rounded-full border border-brand-border">
                    <Keyboard className="w-3.5 h-3.5 text-brand-green" />
                    <span>[Enter] Confirm · [Esc] Edit</span>
                  </div>
                </div>

                <h4 className="text-lg sm:text-xl font-extrabold text-brand-text leading-snug">
                  {staged.title}
                </h4>

                {staged.summary && (
                  <p className="text-xs sm:text-sm text-brand-muted italic border-l-2 border-brand-green/40 pl-2.5">
                    Feed Synopsis: &ldquo;{staged.summary}&rdquo;
                  </p>
                )}

                {/* Live Readability Badges */}
                <div className="flex items-center flex-wrap gap-4 text-xs text-brand-muted pt-2 border-t border-brand-border">
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-brand-green" />
                    <span>{staged.metrics.wordCount} words</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-brand-green" />
                    <span>~{staged.metrics.skimMinutes} min read</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-brand-green" />
                    <span>Clarity: <strong className="text-brand-green font-bold">{staged.metrics.clarityGrade}</strong></span>
                  </div>
                  {staged.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap ml-auto">
                      {staged.tags.map((tag) => (
                        <span key={tag} className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-brand-surface border border-brand-border text-brand-muted">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Full Formatted Story Preview Box (NO line-clamp, Real Markdown) */}
              <div className="p-5 sm:p-6 bg-brand-green-muted/20 border border-brand-green/25 rounded-2xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-brand-green/20">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-green flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Formatted Content Verification</span>
                  </span>
                  <span className="text-[11px] text-brand-muted">
                    Full text rendered with accessible typography
                  </span>
                </div>

                {/* Real Markdown Rendering */}
                <div 
                  className="space-y-4 text-sm sm:text-base leading-relaxed text-brand-text max-w-none"
                  style={{
                    fontFamily: currentFontFamily,
                    letterSpacing: currentSpacing,
                    lineHeight: currentLineHeight,
                  }}
                >
                  <AccessibleMarkdownContent 
                    content={staged.content} 
                    isBionic={preferences.bionicReading}
                    skipTitle={staged.title}
                  />
                </div>
              </div>
            </>
          ) : (
            /* Mode B: Full Article Canvas Simulation */
            <div 
              className={`theme-${preferences.contrastTheme} p-4 sm:p-8 rounded-2xl border transition-colors`}
              style={{
                backgroundColor: 'var(--canvas-bg)',
                borderColor: 'var(--canvas-border)',
                color: 'var(--canvas-text)',
              }}
            >
              <div 
                className="max-w-[72ch] mx-auto space-y-6"
                style={{
                  fontFamily: currentFontFamily,
                  letterSpacing: currentSpacing,
                  lineHeight: currentLineHeight,
                }}
              >
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[11px] bg-brand-green text-white">
                    {staged.category}
                  </span>
                  <span style={{ color: 'var(--canvas-muted)' }}>•</span>
                  <span style={{ color: 'var(--canvas-muted)' }}>Clarity: {staged.metrics.clarityGrade}</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                  <AccessibleInlineMarkdown text={staged.title} isBionic={preferences.bionicReading} />
                </h1>

                <div 
                  className="flex items-center gap-3 text-xs pb-4 border-b"
                  style={{ borderColor: 'var(--canvas-border)', color: 'var(--canvas-muted)' }}
                >
                  <div className="w-7 h-7 rounded-full bg-brand-green-muted text-brand-green font-bold text-xs flex items-center justify-center">
                    {staged.authorName.charAt(0)}
                  </div>
                  <div>
                    <span className="font-bold text-sm" style={{ color: 'var(--canvas-text)' }}>{staged.authorName}</span>
                    <span className="ml-1.5">{staged.handle}</span>
                  </div>
                </div>

                <AccessibleMarkdownContent 
                  content={staged.content} 
                  isBionic={preferences.bionicReading}
                  skipTitle={staged.title}
                />
              </div>
            </div>
          )}
        </div>

        {/* Pinned Bottom Actions Bar */}
        <div className="px-5 sm:px-7 py-4 border-t border-brand-border bg-brand-surface shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-brand-muted text-center sm:text-left">
            <span>Human sovereignty: Your explicit click or </span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-brand-surface-elevated border border-brand-border text-brand-text font-bold">
              Enter
            </kbd>
            <span> publishes this story.</span>
          </p>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCancel}
              disabled={staged.isSubmitting}
              className="touch-target flex-1 sm:flex-initial py-2.5 px-5 rounded-full border border-brand-border bg-brand-surface hover:bg-brand-surface-elevated text-brand-muted hover:text-brand-text font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              <span>Back to Edit [Esc]</span>
            </button>

            <button
              id="confirm-publish-btn"
              type="button"
              onClick={handleConfirm}
              disabled={staged.isSubmitting}
              className="touch-target flex-1 sm:flex-initial py-2.5 px-6 rounded-full bg-brand-green hover:bg-brand-green-hover text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95 disabled:opacity-50"
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
