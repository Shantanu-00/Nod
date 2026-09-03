'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store/useStore';
import { 
  SunMedium, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft,
  ChevronUp, 
  ChevronDown,
  X,
  Sliders,
  Check,
  Eye
} from 'lucide-react';
import { ContrastTheme, FontFamilyPreference } from '@/types';

export function AccessibilityDock() {
  const isOpen = useStore((state) => state.isDockOpen);
  const setIsOpen = useStore((state) => state.setDockOpen);
  const toastMessage = useStore((state) => state.toastMessage);
  const preferences = useStore((state) => state.readingPreferences);
  const setReadingPreferences = useStore((state) => state.setReadingPreferences);
  const announce = useStore((state) => state.announce);
  const openFocalReader = useStore((state) => state.openFocalReader);
  const activeArticle = useStore((state) => state.activeArticle);
  const showToast = useStore((state) => state.showToast);

  const themes: { id: ContrastTheme; label: string; bg: string; text: string }[] = [
    { id: 'soft-cream', label: 'Cream', bg: '#F7F5F0', text: '#191B1F' },
    { id: 'warm-peach', label: 'Peach', bg: '#FFF4EC', text: '#2B2320' },
    { id: 'calming-sage', label: 'Sage', bg: '#F2F7F4', text: '#1B261E' },
    { id: 'muted-slate', label: 'Slate', bg: '#16181F', text: '#E4E7EE' },
    { id: 'yellow-on-black', label: 'Yellow', bg: '#0C0D10', text: '#FDE047' },
  ];

  const fonts: { id: FontFamilyPreference; label: string; desc: string }[] = [
    { id: 'system', label: 'Modern (Default)', desc: 'Standard platform typeface' },
    { id: 'lexend', label: 'Lexend', desc: 'Engineered for reading fluency' },
    { id: 'atkinson', label: 'Atkinson', desc: 'Distinct character shapes' },
    { id: 'opendyslexic', label: 'OpenDyslexic', desc: 'Heavy weighted baseline' },
  ];

  const toggleTheme = (theme: ContrastTheme) => {
    setReadingPreferences({ contrastTheme: theme });
    announce(`Applied ${theme} contrast theme.`);
  };

  const toggleFont = (font: FontFamilyPreference) => {
    setReadingPreferences({ fontFamily: font });
    announce(`Switched reading font to ${font}.`);
  };

  const toggleBionic = () => {
    const next = !preferences.bionicReading;
    setReadingPreferences({ bionicReading: next });
    announce(next ? 'Bionic reading guides enabled.' : 'Bionic reading guides disabled.');
  };

  return (
    <>
      {/* Timed Notification Toast (WebMCP Execution Badge) */}
      {toastMessage && (
        <div 
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-brand-text text-brand-surface text-xs font-semibold rounded-full shadow-2xl animate-in fade-in slide-in-from-top-3 duration-200 flex items-center gap-2 border border-white/20 pointer-events-none"
          role="status"
          aria-live="polite"
        >
          <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =========================================================================
          DESKTOP DOCK: Positioned in the Empty Left Margin (Non-Invasive)
          ========================================================================= */}
      <aside 
        className="fixed left-5 top-1/2 -translate-y-1/2 z-40 hidden md:flex items-center select-none"
        aria-label="Reading Controls"
      >
        {/* Compact Vertical Icon Pill */}
        <div className="bg-brand-surface/90 hover:bg-brand-surface backdrop-blur-md border border-brand-border rounded-full p-2 shadow-lg flex flex-col items-center gap-3 transition-all duration-300 opacity-80 hover:opacity-100 hover:shadow-xl">
          {/* Quick Font Cycle */}
          <button
            onClick={() => {
              const list: FontFamilyPreference[] = ['system', 'lexend', 'atkinson', 'opendyslexic'];
              const idx = list.indexOf(preferences.fontFamily);
              toggleFont(list[(idx + 1) % list.length]);
            }}
            className="touch-target w-9 h-9 rounded-full text-xs font-bold text-brand-text hover:bg-brand-surface-elevated flex flex-col items-center justify-center transition-colors"
            title={`Font: ${preferences.fontFamily} (Click to cycle)`}
          >
            <span className="text-xs font-black leading-none">Aa</span>
            <span className="text-[9px] text-brand-muted font-normal capitalize mt-0.5">
              {preferences.fontFamily === 'system' ? 'Norm' : preferences.fontFamily.slice(0, 4)}
            </span>
          </button>

          {/* Quick Bionic Saccadic Fixation Toggle */}
          <button
            onClick={toggleBionic}
            className={`touch-target w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              preferences.bionicReading
                ? 'bg-brand-green text-white font-bold shadow-xs'
                : 'text-brand-muted hover:text-brand-text hover:bg-brand-surface-elevated'
            }`}
            title="Toggle Bionic Reading saccadic guides"
          >
            <Sparkles className="w-4 h-4" />
          </button>

          {/* Quick Theme Cycle */}
          <button
            onClick={() => {
              const list: ContrastTheme[] = ['soft-cream', 'warm-peach', 'calming-sage', 'muted-slate', 'yellow-on-black'];
              const idx = list.indexOf(preferences.contrastTheme);
              toggleTheme(list[(idx + 1) % list.length]);
            }}
            className="touch-target w-9 h-9 rounded-full text-brand-muted hover:text-brand-text hover:bg-brand-surface-elevated flex items-center justify-center transition-colors"
            title={`Theme: ${preferences.contrastTheme} (Click to cycle)`}
          >
            <SunMedium className="w-4 h-4 text-brand-green" />
          </button>

          {/* Quick Zero-Saccade RSVP Focal Reader Trigger */}
          <button
            onClick={() => {
              if (activeArticle) {
                openFocalReader(activeArticle.content.rawMarkdown, 250);
              } else {
                showToast('Please open any story first to launch the Focal Reader');
                announce('Please open any story first to launch the Zero-Saccade Focal Reader.');
              }
            }}
            className={`touch-target w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
              activeArticle 
                ? 'text-brand-muted hover:text-brand-green hover:bg-brand-surface-elevated' 
                : 'text-brand-muted/40 cursor-not-allowed'
            }`}
            title={activeArticle ? "Launch Zero-Saccade Focal Reader" : "Open any story to launch Zero-Saccade Reader"}
            aria-label={activeArticle ? "Launch Zero-Saccade Focal Reader" : "Open any story to launch Zero-Saccade Reader"}
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Open Detailed Flyout Settings */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`touch-target w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
              isOpen ? 'bg-brand-green text-white' : 'text-brand-muted hover:text-brand-text hover:bg-brand-surface-elevated'
            }`}
            title={isOpen ? 'Close settings panel' : 'Open reading settings'}
            aria-expanded={isOpen}
          >
            {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Clean Flyout Card to the Right of Vertical Pill (No Overlap) */}
        {isOpen && (
          <div className="absolute left-16 top-1/2 -translate-y-1/2 w-80 bg-brand-surface border border-brand-border rounded-3xl p-5 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-left-4 duration-200 z-50 space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-brand-border">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-brand-green" />
                <span className="text-xs font-bold text-brand-text">Reading Ergonomics</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-brand-muted hover:text-brand-text hover:bg-brand-surface-elevated"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Typeface Chooser */}
            <div>
              <div className="text-[11px] font-bold text-brand-muted uppercase tracking-wider mb-2">
                Typeface Discrimination
              </div>
              <div className="space-y-1.5">
                {fonts.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => toggleFont(f.id)}
                    className={`w-full py-2 px-3 text-left rounded-xl border text-xs transition-all flex items-center justify-between ${
                      preferences.fontFamily === f.id
                        ? 'border-brand-green bg-brand-green-muted text-brand-green font-bold shadow-xs'
                        : 'border-brand-border bg-brand-surface-elevated text-brand-text hover:border-brand-green/40'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{f.label}</div>
                      <div className="text-[10px] text-brand-muted font-normal">{f.desc}</div>
                    </div>
                    {preferences.fontFamily === f.id && <Check className="w-4 h-4 text-brand-green" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Anti-Glare Contrast Palette */}
            <div>
              <div className="text-[11px] font-bold text-brand-muted uppercase tracking-wider mb-2">
                Anti-Glare Contrast Tint
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => toggleTheme(t.id)}
                    className={`touch-target py-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                      preferences.contrastTheme === t.id
                        ? 'ring-2 ring-brand-green ring-offset-2 scale-105 shadow-xs'
                        : 'border-brand-border opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: t.bg, color: t.text }}
                    title={t.label}
                  >
                    <span className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: t.text }} />
                    <span className="text-[10px] font-medium">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Spacing & Line Leading */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-brand-border">
              <div>
                <label className="text-[11px] font-bold text-brand-muted block mb-1">
                  Letter Spacing
                </label>
                <div className="flex gap-1">
                  {(['normal', 'wide', 'extra-wide'] as const).map((space) => (
                    <button
                      key={space}
                      onClick={() => setReadingPreferences({ letterSpacing: space })}
                      className={`flex-1 py-1 text-xs rounded-lg border font-semibold ${
                        preferences.letterSpacing === space
                          ? 'border-brand-green bg-brand-green-muted text-brand-green font-bold'
                          : 'border-brand-border bg-brand-surface-elevated text-brand-muted'
                      }`}
                    >
                      {space === 'normal' ? '1x' : space === 'wide' ? '1.5x' : '2x'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-brand-muted block mb-1">
                  Line Height
                </label>
                <div className="flex gap-1">
                  {(['normal', 'relaxed', 'loose'] as const).map((line) => (
                    <button
                      key={line}
                      onClick={() => setReadingPreferences({ lineHeight: line })}
                      className={`flex-1 py-1 text-xs rounded-lg border font-semibold ${
                        preferences.lineHeight === line
                          ? 'border-brand-green bg-brand-green-muted text-brand-green font-bold'
                          : 'border-brand-border bg-brand-surface-elevated text-brand-muted'
                      }`}
                    >
                      {line === 'normal' ? '1.6' : line === 'relaxed' ? '1.8' : '2.0'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* =========================================================================
          MOBILE DOCK: Positioned at Bottom Center with Auto-Collapse
          ========================================================================= */}
      <aside 
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 md:hidden max-w-sm w-[calc(100%-2rem)] select-none"
        aria-label="Mobile Reading Controls"
      >
        {/* Mobile Expanded Sheet */}
        {isOpen && (
          <div className="mb-3 p-4 bg-brand-surface border border-brand-border rounded-3xl shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-brand-border">
              <span className="text-xs font-bold text-brand-text">Reading Ergonomics</span>
              <button onClick={() => setIsOpen(false)} className="p-1">
                <X className="w-4 h-4 text-brand-muted" />
              </button>
            </div>

            {/* Mobile Font Selector */}
            <div className="grid grid-cols-2 gap-1.5">
              {fonts.map((f) => (
                <button
                  key={f.id}
                  onClick={() => toggleFont(f.id)}
                  className={`py-1.5 px-2 text-xs rounded-xl border text-center font-medium ${
                    preferences.fontFamily === f.id
                      ? 'border-brand-green bg-brand-green-muted text-brand-green font-bold'
                      : 'border-brand-border bg-brand-surface-elevated text-brand-text'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Mobile Themes */}
            <div className="flex gap-1 overflow-x-auto pb-1">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => toggleTheme(t.id)}
                  className={`flex-1 py-1.5 rounded-xl border text-[11px] font-medium text-center ${
                    preferences.contrastTheme === t.id ? 'ring-2 ring-brand-green' : 'border-brand-border'
                  }`}
                  style={{ backgroundColor: t.bg, color: t.text }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mobile Bottom Bar (Auto-fades when idle) */}
        <div className="bg-brand-surface/90 backdrop-blur-md border border-brand-border rounded-full px-4 py-2 shadow-xl flex items-center justify-between gap-3 opacity-80 hover:opacity-100 transition-opacity">
          <button
            onClick={() => {
              const list: FontFamilyPreference[] = ['system', 'lexend', 'atkinson', 'opendyslexic'];
              const idx = list.indexOf(preferences.fontFamily);
              toggleFont(list[(idx + 1) % list.length]);
            }}
            className="text-xs font-bold text-brand-text flex items-center gap-1"
          >
            <span>Aa</span>
            <span className="text-[10px] text-brand-muted capitalize">{preferences.fontFamily}</span>
          </button>

          <button
            onClick={toggleBionic}
            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
              preferences.bionicReading ? 'bg-brand-green text-white' : 'text-brand-muted'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Bionic</span>
          </button>

          <button
            onClick={() => {
              const list: ContrastTheme[] = ['soft-cream', 'warm-peach', 'calming-sage', 'muted-slate', 'yellow-on-black'];
              const idx = list.indexOf(preferences.contrastTheme);
              toggleTheme(list[(idx + 1) % list.length]);
            }}
            className="p-1 text-brand-green"
          >
            <SunMedium className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              if (activeArticle) {
                openFocalReader(activeArticle.content.rawMarkdown, 250);
              } else {
                showToast('Please open any story first to launch the Focal Reader');
                announce('Please open any story first to launch the Zero-Saccade Focal Reader.');
              }
            }}
            className={`p-1 ${activeArticle ? 'text-brand-muted hover:text-brand-green' : 'text-brand-muted/40 cursor-not-allowed'}`}
            title={activeArticle ? "Launch Zero-Saccade Reader" : "Open any story to launch Zero-Saccade Reader"}
            aria-label={activeArticle ? "Launch Zero-Saccade Reader" : "Open any story to launch Zero-Saccade Reader"}
          >
            <Eye className="w-4 h-4" />
          </button>

          <button onClick={() => setIsOpen(!isOpen)} className="p-1 text-brand-muted">
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </aside>
    </>
  );
}
