'use client';

import React from 'react';
import { useWebMCP } from '@/lib/webmcp/useWebMCP';
import { useStore } from '@/lib/store/useStore';
import { AccessibilityDock } from '@/components/accessibility/AccessibilityDock';
import { WebMCPSimulator } from '@/components/accessibility/WebMCPSimulator';
import { PeekModal } from '@/components/feed/PeekModal';
import { Header } from '@/components/brand/Header';
import { RsvpReader } from '@/components/RsvpReader';
import { PublishApprovalCard } from '@/components/editor/PublishApprovalCard';

export function ClientShell({ children }: { children: React.ReactNode }) {
  // Registers all canonical WebMCP tools in-browser with document.modelContext
  useWebMCP();

  const liveAnnouncement = useStore((state) => state.liveAnnouncement);
  const preferences = useStore((state) => state.readingPreferences);

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
    system: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    lexend: "'Lexend', sans-serif",
    atkinson: "'Atkinson Hyperlegible', sans-serif",
    opendyslexic: "'OpenDyslexic', 'Comic Sans MS', sans-serif",
  };

  const currentSpacing = letterSpacingMap[preferences.letterSpacing] || '0.01em';
  const currentLineHeight = lineHeightMap[preferences.lineHeight] || '1.6';
  const currentFontFamily = fontFamilyMap[preferences.fontFamily] || fontFamilyMap.system;

  return (
    <div
      className={`theme-${preferences.contrastTheme} font-pref-${preferences.fontFamily} min-h-screen transition-colors duration-200`}
      style={{
        backgroundColor: 'var(--canvas-bg)',
        color: 'var(--canvas-text)',
        fontFamily: currentFontFamily,
        letterSpacing: currentSpacing,
      }}
    >
      {/* Screen Reader ARIA Live Region */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only" 
        id="a11y-announcer"
      >
        {liveAnnouncement}
      </div>

      <Header />

      <main 
        id="main-content" 
        className="min-h-[calc(100vh-4rem)] transition-all"
        style={{
          lineHeight: currentLineHeight,
        }}
      >
        {children}
      </main>

      {/* Floating Accessibility Dock & In-Place Peek Modal */}
      <AccessibilityDock />
      <PeekModal />
      <WebMCPSimulator />
      <RsvpReader />
      <PublishApprovalCard />
    </div>
  );
}
