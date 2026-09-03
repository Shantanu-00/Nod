'use client';

import React, { useEffect, useState } from 'react';
import { ArticleDetail } from '@/types';
import { useStore } from '@/lib/store/useStore';
import { BionicText } from '@/components/accessibility/BionicText';
import { SimplifiedBanner } from './SimplifiedBanner';
import { Volume2, VolumeX, Clock, Heart, Eye } from 'lucide-react';
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
  const openFocalReader = useStore((state) => state.openFocalReader);
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

  const activeContent = simplifiedView.isActive && simplifiedView.simplifiedContent
    ? simplifiedView.simplifiedContent
    : article.content.rawMarkdown;

  const paragraphs = activeContent
    .split('\n\n')
    .map((p) => p.trim())
    .filter(Boolean);

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
        {/* Top Meta Bar */}
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

          <div className="flex items-center gap-2">
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

            <button
              onClick={toggleSpeech}
              className="touch-target px-4 py-1.5 rounded-full font-bold text-xs bg-brand-surface-elevated hover:bg-brand-border-warm text-brand-text border border-brand-border flex items-center gap-2 transition-all shadow-xs"
              title="Read aloud with audio synthesis"
              aria-label={isSpeaking ? 'Stop reading aloud' : 'Read article aloud'}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-rose-500" />
                  <span>Stop Audio</span>
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
          <BionicText text={article.title} as="span" />
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

        {/* In-Place Plain English Simplification Switch */}
        <SimplifiedBanner />

        {/* Article Content Body (Obeys Font, Spacing, and Line Height Dynamically) */}
        <div 
          className="space-y-6 text-base sm:text-lg"
          style={{
            letterSpacing: currentSpacing,
            lineHeight: currentLineHeight,
            fontFamily: currentFontFamily,
          }}
        >
          {paragraphs.map((para, idx) => {
            const isHeading = para.startsWith('#');
            const landmark = landmarks[idx % landmarks.length];

            if (isHeading) {
              const cleanHeading = para.replace(/^#+\s*/, '');
              return (
                <h2 
                  key={idx} 
                  className="text-xl sm:text-2xl font-bold mt-8 mb-3"
                  style={{ color: 'var(--canvas-text)' }}
                >
                  <BionicText text={cleanHeading} as="span" />
                </h2>
              );
            }

            const isQuote = para.startsWith('>');
            if (isQuote) {
              const cleanQuote = para.replace(/^>\s*/gm, '');
              return (
                <blockquote 
                  key={idx} 
                  className="my-6 pl-4 sm:pl-6 py-3 border-l-4 border-brand-green bg-brand-surface-elevated/60 rounded-r-2xl shadow-xs"
                >
                  <BionicText 
                    text={cleanQuote} 
                    as="div" 
                    className="font-medium italic text-base sm:text-lg"
                    style={{ color: 'var(--canvas-text)', lineHeight: currentLineHeight }}
                  />
                </blockquote>
              );
            }

            return (
              <div key={idx} className="relative group">
                <span 
                  className="hidden md:block absolute -left-7 top-1 text-xs text-brand-green opacity-40 group-hover:opacity-100 select-none font-mono"
                  title="Visual landmark anchor"
                  aria-hidden="true"
                >
                  {landmark}
                </span>

                <BionicText 
                  text={para} 
                  as="p" 
                  style={{ color: 'var(--canvas-text)', lineHeight: currentLineHeight }}
                />
              </div>
            );
          })}
        </div>
      </article>
    </div>
  );
}
