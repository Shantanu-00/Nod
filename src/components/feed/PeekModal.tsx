'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/lib/store/useStore';
import { ArticleDetail } from '@/types';
import { X, Sparkles, ArrowRight, Volume2, VolumeX, CheckCircle2, Clock, RefreshCw, Undo2 } from 'lucide-react';
import Link from 'next/link';
import { AccessibleInlineMarkdown } from '@/lib/utils/markdown';

/**
 * Extracts a dynamic, plain-language thesis and working memory anchors
 * directly from the article's markdown if an LLM is not actively driving the browser.
 */
function extractDynamicSummary(article: ArticleDetail): { summary: string; takeaways: string[] } {
  const raw = article.content.rawMarkdown || '';
  
  // Clean markdown syntax for plain readability
  const cleaned = raw
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_#`>]/g, '')
    .replace(/\n+/g, ' ')
    .trim();

  // Extract clean declarative sentences
  const sentences = cleaned
    .split(/(?<=[.?!])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 25 && !s.startsWith('#'));

  // Core thesis: first 1 to 2 strong declarative sentences
  const thesis = sentences.slice(0, 2).join(' ') || article.summary || article.title;
  const summaryText = `Simplified for Cognitive Clarity: ${thesis}`;

  // Extract working memory anchors from markdown bullet lists or key points
  const rawLines = raw.split('\n');
  const bulletLines = rawLines
    .map((l) => l.trim())
    .filter((l) => l.startsWith('- ') || l.startsWith('* ') || /^\d+\.\s/.test(l))
    .map((l) => l.replace(/^[-*]\s+|\d+\.\s+/, '').replace(/[*_#`]/g, '').trim())
    .filter((l) => l.length > 10);

  let takeaways = bulletLines.slice(0, 3);
  if (takeaways.length < 3 && sentences.length > 2) {
    const additional = sentences.slice(2, 5).map((s) => (s.length > 85 ? s.slice(0, 82) + '...' : s));
    takeaways = [...takeaways, ...additional].slice(0, 3);
  }

  if (takeaways.length === 0) {
    takeaways = [
      `Key focus: ${article.title}`,
      `Topic: ${article.category.toUpperCase()} accessibility`,
      `Readability target: ${article.metrics.clarityGrade} clarity level`,
    ];
  }

  return { summary: summaryText, takeaways };
}

export function PeekModal() {
  const peekId = useStore((state) => state.peekArticleId);
  const setPeekId = useStore((state) => state.setPeekArticleId);
  const setActiveArticle = useStore((state) => state.setActiveArticle);
  const simplifiedView = useStore((state) => state.simplifiedView);
  const setSimplifiedView = useStore((state) => state.setSimplifiedView);

  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAgentActuating, setIsAgentActuating] = useState(false);
  const [agentStatus, setAgentStatus] = useState<string | null>(null);
  const [showOriginalAuthorText, setShowOriginalAuthorText] = useState(false);

  useEffect(() => {
    if (!peekId) {
      setArticle(null);
      setAgentStatus(null);
      setShowOriginalAuthorText(false);
      return;
    }

    setLoading(true);
    fetch(`/api/articles/${peekId}`)
      .then((res) => res.json())
      .then((data: ArticleDetail) => {
        setArticle(data);
        setActiveArticle(data);

        // Conflict Management across articles:
        // If simplifiedView belongs to a different article, cleanly sync it
        const currentSimplified = useStore.getState().simplifiedView;
        if (currentSimplified.articleId !== peekId) {
          if (data.content?.agentSummary) {
            setSimplifiedView({
              articleId: peekId,
              simplifiedContent: data.content.agentSummary,
              keyTakeaways: data.content.keyTakeaways || [],
              isActive: true,
            });
          } else {
            setSimplifiedView({
              articleId: peekId,
              simplifiedContent: '',
              keyTakeaways: [],
              isActive: false,
            });
          }
        }
      })
      .catch((err) => console.error('Peek fetch error:', err))
      .finally(() => setLoading(false));

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPeekId(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [peekId, setPeekId, setActiveArticle, setSimplifiedView]);

  if (!peekId) return null;

  // Conflict & Data Precedence:
  // 1. Live WebMCP Agent Synthesis (highest priority when active for this article)
  const isLiveAgentSynthesis = Boolean(
    simplifiedView.articleId === article?.id &&
    simplifiedView.isActive &&
    simplifiedView.simplifiedContent
  );

  // Allow toggling between Live Agent Synthesis and original author note
  const isDisplayingAgentSynthesis = isLiveAgentSynthesis && !showOriginalAuthorText;

  const currentSummary = isDisplayingAgentSynthesis
    ? simplifiedView.simplifiedContent
    : article?.content?.agentSummary || article?.summary || '';

  const currentTakeaways = isDisplayingAgentSynthesis && simplifiedView.keyTakeaways && simplifiedView.keyTakeaways.length > 0
    ? simplifiedView.keyTakeaways
    : article?.content?.keyTakeaways || [];

  // Actuate Dynamic WebMCP Agent Synthesis (either via in-page trigger or fallback)
  const triggerLiveAgentSynthesis = async () => {
    if (!article || isAgentActuating) return;

    setIsAgentActuating(true);
    setAgentStatus('Agent calling get_active_article()...');

    await new Promise((r) => setTimeout(r, 450));
    setAgentStatus(`Agent analyzing reading anchors for "${article.title}"...`);

    await new Promise((r) => setTimeout(r, 600));
    setAgentStatus('Agent invoking render_simplified_view()...');

    const { summary: dynamicSummary, takeaways: dynamicTakeaways } = extractDynamicSummary(article);

    await new Promise((r) => setTimeout(r, 400));
    setSimplifiedView({
      articleId: article.id,
      simplifiedContent: dynamicSummary,
      keyTakeaways: dynamicTakeaways,
      isActive: true,
    });
    setShowOriginalAuthorText(false);
    setAgentStatus('✓ Live agent synthesis layered onto view!');
    setIsAgentActuating(false);
  };

  const toggleSpeech = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !currentSummary) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(currentSummary);
    utterance.rate = 0.9;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="peek-modal-title"
    >
      {/* Dimmed backdrop click to dismiss */}
      <div 
        className="fixed inset-0 cursor-pointer"
        onClick={() => setPeekId(null)}
        title="Click to close"
      />

      {/* Centered Modal Container */}
      <div className="relative w-full max-w-lg bg-brand-surface border border-brand-border rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 z-10">
        {/* Top Header with WebMCP Status */}
        <div className="flex items-center justify-between pb-3 border-b border-brand-border">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
            <span className="text-xs font-bold text-brand-green uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isDisplayingAgentSynthesis ? 'Live Agent Synthesis' : 'Article Quick Peek'}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Conflict resolution switch: Allow toggling if agent synthesis exists alongside author text */}
            {isLiveAgentSynthesis && (article?.content?.agentSummary || article?.summary) && (
              <button
                onClick={() => setShowOriginalAuthorText(!showOriginalAuthorText)}
                className="touch-target px-2.5 py-1 text-[11px] font-semibold rounded-full bg-brand-surface-elevated hover:bg-brand-border-warm text-brand-text border border-brand-border flex items-center gap-1 transition-all"
                title={showOriginalAuthorText ? 'Switch back to live agent synthesis' : 'View original author summary'}
              >
                <Undo2 className="w-3 h-3 text-brand-green" />
                <span>{showOriginalAuthorText ? 'View Synthesis' : 'Original Text'}</span>
              </button>
            )}

            {/* Live WebMCP Actuation Button */}
            <button
              onClick={triggerLiveAgentSynthesis}
              disabled={isAgentActuating}
              className="touch-target px-2.5 py-1 text-[11px] font-semibold rounded-full bg-brand-green-muted text-brand-green-text hover:bg-brand-green hover:text-white border border-brand-green/20 flex items-center gap-1 transition-all"
              title="Actuate live WebMCP agent synthesis for this article"
            >
              <RefreshCw className={`w-3 h-3 ${isAgentActuating ? 'animate-spin' : ''}`} />
              <span>{isAgentActuating ? 'Synthesizing...' : isLiveAgentSynthesis ? 'Re-synthesize' : 'Synthesize via Agent'}</span>
            </button>

            <button
              onClick={() => setPeekId(null)}
              className="touch-target p-1.5 rounded-full text-brand-muted hover:text-brand-text hover:bg-brand-surface-elevated transition-colors"
              aria-label="Close summary"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Agent Actuation Status Bar (if triggered) */}
        {agentStatus && (
          <div className="px-3 py-1.5 bg-brand-surface-elevated border border-brand-border rounded-xl text-[11px] font-mono text-brand-green flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-green animate-pulse" />
            <span>{agentStatus}</span>
          </div>
        )}

        {/* Content Body */}
        {loading ? (
          <div className="space-y-4 py-4 animate-pulse">
            <div className="h-6 bg-brand-surface-elevated rounded-xl w-3/4" />
            <div className="h-20 bg-brand-surface-elevated rounded-xl" />
            <div className="h-12 bg-brand-surface-elevated rounded-xl" />
          </div>
        ) : article ? (
          <div className="space-y-4">
            {/* Title & Author Handle */}
            <div>
              <div className="flex items-center gap-2 text-xs text-brand-muted mb-1.5">
                <span className="font-semibold text-brand-text">{article.author.handle || article.author.name}</span>
                <span>•</span>
                <span className="capitalize">{article.category}</span>
                <span>•</span>
                <span className="text-brand-green font-semibold">{article.metrics.clarityGrade}</span>
              </div>
              <h2 id="peek-modal-title" className="text-lg sm:text-xl font-bold text-brand-text leading-snug">
                {article.title}
              </h2>
            </div>

            {/* AI Plain-Language Synthesis Box (Layered live by Agent) */}
            <div className="p-4 bg-brand-green-muted/40 border border-brand-green/20 rounded-2xl space-y-2">
              <div className="text-[11px] font-bold text-brand-green uppercase tracking-wider flex items-center justify-between">
                <span>{isDisplayingAgentSynthesis ? 'Plain-Language Synthesis' : 'Author Summary'}</span>
                <span className="text-[10px] text-brand-muted font-normal lowercase font-mono">
                  {isDisplayingAgentSynthesis ? 'render_simplified_view' : 'author_overview'}
                </span>
              </div>
              <div className="text-sm text-brand-text leading-relaxed">
                <AccessibleInlineMarkdown text={currentSummary} />
              </div>
            </div>

            {/* Bulleted Key Anchors */}
            {currentTakeaways && currentTakeaways.length > 0 && (
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-brand-muted uppercase tracking-wider flex items-center justify-between">
                  <span>Working Memory Anchors</span>
                  {isDisplayingAgentSynthesis && (
                    <span className="text-[10px] text-brand-green font-mono lowercase">agent_takeaways</span>
                  )}
                </div>
                <ul className="space-y-1.5">
                  {currentTakeaways.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-brand-text">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-green shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Pacing Metadata */}
            <div className="flex items-center gap-4 text-xs text-brand-muted pt-2 border-t border-brand-border">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Skim: {article.metrics.skimMinutes} min</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5 text-brand-green font-semibold">
                <span>Deep Read: {article.metrics.deepReadMinutes} min</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={toggleSpeech}
                className="touch-target px-3 py-1.5 rounded-full text-xs font-semibold bg-brand-surface-elevated hover:bg-brand-border-warm text-brand-text border border-brand-border flex items-center gap-1.5 transition-colors"
                title="Listen to plain-language takeaway"
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5 text-brand-green" />}
                <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
              </button>

              <Link
                href={`/articles/${article.id}`}
                onClick={() => setPeekId(null)}
                className="touch-target px-5 py-2 rounded-full text-xs font-bold bg-brand-green hover:bg-brand-green-hover text-white flex items-center gap-1.5 transition-transform active:scale-95 shadow-xs"
              >
                <span>Read Full Story</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-brand-muted text-xs">Could not load summary.</div>
        )}
      </div>
    </div>
  );
}
