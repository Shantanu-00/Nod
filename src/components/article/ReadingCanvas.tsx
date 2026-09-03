'use client';

import React, { useEffect, useState } from 'react';
import { ArticleDetail } from '@/types';
import { useStore } from '@/lib/store/useStore';
import { AccessibleMarkdownContent, AccessibleInlineMarkdown } from '@/lib/utils/markdown';
import { SimplifiedBanner } from './SimplifiedBanner';
import { Volume2, VolumeX, Clock, Heart, Eye, Sparkles } from 'lucide-react';
import { getClarityTagStyle } from '@/lib/utils/a11y-metrics';
import { extractCleanText } from '@/lib/utils/rsvp';

interface ReadingCanvasProps {
  article: ArticleDetail;
}

export function ReadingCanvas({ article }: ReadingCanvasProps) {
  const preferences = useStore((state) => state.readingPreferences);
  const setActiveArticle = useStore((state) => state.setActiveArticle);
  const simplifiedView = useStore((state) => state.simplifiedView);
  const setSimplifiedView = useStore((state) => state.setSimplifiedView);
  const toggleSimplified = useStore((state) => state.toggleSimplifiedView);
  const openFocalReader = useStore((state) => state.openFocalReader);
  const showToast = useStore((state) => state.showToast);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [likes, setLikes] = useState(article.likesCount || 1);
  const [hasLiked, setHasLiked] = useState(false);

  useEffect(() => {
    setActiveArticle(article);

    if (article.content.agentSummary) {
      setSimplifiedView({
        simplifiedContent: article.content.agentSummary,
        keyTakeaways: article.content.keyTakeaways || [],
        isActive: false,
      });
    } else {
      setSimplifiedView({
        simplifiedContent: undefined,
        keyTakeaways: [],
        isActive: false,
      });
    }
  }, [article, setActiveArticle, setSimplifiedView]);

  const clarityStyle = getClarityTagStyle(article.metrics.clarityGrade);

  const toggleSpeech = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToRead = simplifiedView.isActive && simplifiedView.simplifiedContent
      ? simplifiedView.simplifiedContent
      : article.content.rawMarkdown.replace(/[#*`_]/g, '');

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 0.9;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleRequestSimplification = () => {
    // Generate a clean sentence-shortened plain English version from the raw markdown
    const sentences = article.content.rawMarkdown
      .replace(/^#+\s+/gm, '')
      .replace(/^>\s+/gm, '')
      .split(/(?<=[.?!])\s+/)
      .filter((s) => s.trim().length > 15);

    const simplifiedText = sentences.slice(0, Math.min(6, sentences.length)).join(' ');
    const takeaways = [
      'Focuses on key concepts with reduced sentence complexity.',
      'Designed to reduce cognitive load and visual fatigue.',
      'Original phrasing preserved in the full text view.',
    ];

    setSimplifiedView({
      simplifiedContent: simplifiedText,
      keyTakeaways: takeaways,
      isActive: true,
    });
    showToast('✨ Plain-English version rendered by NOD');
  };

  const activeContent = simplifiedView.isActive && simplifiedView.simplifiedContent
    ? simplifiedView.simplifiedContent
    : article.content.rawMarkdown;

  const landmarks = ['✦', '◈', '⬡', '❖', '▲'];

  // Map accessibility preferences directly to CSS properties
  const letterSpacingMap = {
    normal: '0.01em',
    wide: '0.08em',
    'extra-wide': '0.16em',
  };

  const lineHeightMap = {
    normal: '1.6',
    relaxed: '1.9',
    loose: '2.3',
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
      className={`theme-${preferences.contrastTheme} transition-colors duration-200 rounded-3xl p-2 sm:p-4`}
      style={{
        backgroundColor: 'var(--canvas-bg)',
      }}
    >
      <article 
        className="adaptive-canvas p-6 sm:p-10 rounded-3xl border shadow-sm max-w-[72ch] mx-auto transition-all"
        style={{
          backgroundColor: 'var(--canvas-surface)',
          borderColor: 'var(--canvas-border)',
          color: 'var(--canvas-text)',
          fontFamily: currentFontFamily,
          letterSpacing: currentSpacing,
          lineHeight: currentLineHeight,
        }}
      >
        {/* Top Meta Bar with Action Controls */}
        <div 
          className="flex flex-wrap items-center justify-between gap-3 pb-6 mb-6 border-b text-xs"
          style={{ borderColor: 'var(--canvas-border)' }}
        >
          <div className="flex items-center gap-2.5">
            <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[11px] border ${clarityStyle.bg} ${clarityStyle.text} ${clarityStyle.border}`}>
              {article.metrics.clarityGrade}
            </span>
            <span style={{ color: 'var(--canvas-muted)' }}>•</span>
            <span style={{ color: 'var(--canvas-muted)' }} className="capitalize">{article.category}</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Switcher: Original vs Plain-English */}
            {simplifiedView.simplifiedContent ? (
              <div 
                role="radiogroup" 
                aria-label="Article Language Mode"
                className="inline-flex p-0.5 rounded-full border text-xs font-semibold"
                style={{
                  backgroundColor: 'var(--canvas-bg)',
                  borderColor: 'var(--canvas-border)',
                }}
              >
                <button
                  role="radio"
                  aria-checked={!simplifiedView.isActive}
                  onClick={() => simplifiedView.isActive && toggleSimplified()}
                  className={`touch-target px-3 py-1 rounded-full transition-all text-xs ${
                    !simplifiedView.isActive
                      ? 'bg-brand-green text-white font-bold shadow-xs'
                      : 'hover:opacity-80'
                  }`}
                  style={!simplifiedView.isActive ? {} : { color: 'var(--canvas-muted)' }}
                >
                  Original
                </button>
                <button
                  role="radio"
                  aria-checked={simplifiedView.isActive}
                  onClick={() => !simplifiedView.isActive && toggleSimplified()}
                  className={`touch-target px-3 py-1 rounded-full flex items-center gap-1.5 transition-all text-xs ${
                    simplifiedView.isActive
                      ? 'bg-brand-green text-white font-bold shadow-xs'
                      : 'hover:opacity-80'
                  }`}
                  style={simplifiedView.isActive ? {} : { color: 'var(--canvas-muted)' }}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Plain-English</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleRequestSimplification}
                className="touch-target px-3 py-1.5 rounded-full font-semibold text-xs border border-brand-green/40 text-brand-green hover:bg-brand-green/10 flex items-center gap-1.5 transition-all shadow-xs"
                title="Generate a short-sentence, plain-English summary"
              >
                <Sparkles className="w-3 h-3 text-brand-green" />
                <span>Simplify Text</span>
              </button>
            )}

            {/* Zero-Saccade Focal Reader Trigger */}
            <button
              onClick={() => {
                const textToRead = simplifiedView.isActive && simplifiedView.simplifiedContent
                  ? simplifiedView.simplifiedContent
                  : article.content.rawMarkdown;
                const clean = extractCleanText(textToRead);
                openFocalReader(clean, 250);
              }}
              className="touch-target px-3.5 py-1.5 rounded-full font-bold text-xs bg-brand-green-muted text-brand-green-text hover:bg-brand-green hover:text-white border border-brand-green/30 flex items-center gap-1.5 transition-all shadow-xs"
              title="Fixed-gaze reading to reduce ocular strain and cognitive fatigue"
              aria-label="Launch Zero-Saccade Focal Reader"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Zero-Saccade Reader</span>
              <span className="sm:hidden">Focal Read</span>
            </button>

            {/* Audio Synthesis Trigger */}
            <button
              onClick={toggleSpeech}
              className="touch-target px-3.5 py-1.5 rounded-full font-bold text-xs hover:bg-black/5 dark:hover:bg-white/5 border flex items-center gap-1.5 transition-all shadow-xs"
              style={{
                borderColor: 'var(--canvas-border)',
                color: 'var(--canvas-text)',
              }}
              title="Read aloud with audio synthesis"
              aria-label={isSpeaking ? 'Stop reading aloud' : 'Read article aloud'}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-rose-500" />
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-brand-green" />
                  <span>Listen</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Headline */}
        <h1 
          className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-4 leading-tight"
          style={{ 
            color: 'var(--canvas-text)',
            fontFamily: currentFontFamily,
            letterSpacing: currentSpacing,
          }}
        >
          <AccessibleInlineMarkdown text={article.title} isBionic={preferences.bionicReading} />
        </h1>

        {/* Author Header */}
        <div 
          className="flex flex-wrap items-center justify-between gap-4 text-xs mb-6 pb-6 border-b"
          style={{ borderColor: 'var(--canvas-border)', color: 'var(--canvas-muted)' }}
        >
          <div className="flex items-center gap-2.5">
            {article.author.avatar ? (
              <img
                src={article.author.avatar}
                alt={article.author.name}
                className="w-9 h-9 rounded-full object-cover border border-brand-border"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-brand-green-muted text-brand-green font-bold text-xs flex items-center justify-center">
                {article.author.name.charAt(0)}
              </div>
            )}
            <div>
              <div className="font-bold text-sm" style={{ color: 'var(--canvas-text)' }}>{article.author.name}</div>
              <div style={{ color: 'var(--canvas-muted)' }}>{article.author.handle || '@author'}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Deep Read: {article.metrics.deepReadMinutes} min</span>
            </div>

            <button
              onClick={() => {
                setLikes((prev) => (hasLiked ? prev - 1 : prev + 1));
                setHasLiked(!hasLiked);
              }}
              className={`touch-target px-2.5 py-1 rounded-full border border-brand-border flex items-center gap-1.5 transition-colors ${
                hasLiked ? 'text-rose-600 bg-rose-50 border-rose-200 font-bold' : 'hover:bg-brand-surface-elevated'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-rose-600' : ''}`} />
              <span>{likes}</span>
            </button>
          </div>
        </div>

        {/* Collapsible Key Takeaways (Zero roadblock, minimal height) */}
        <SimplifiedBanner />

        {/* Article Content Body with Full Markdown Support */}
        <div 
          style={{
            letterSpacing: currentSpacing,
            lineHeight: currentLineHeight,
            fontFamily: currentFontFamily,
          }}
        >
          <AccessibleMarkdownContent 
            content={activeContent} 
            isBionic={preferences.bionicReading}
            lineHeight={currentLineHeight}
            letterSpacing={currentSpacing}
            landmarks={landmarks}
            skipTitle={article.title}
          />
        </div>
      </article>
    </div>
  );
}

