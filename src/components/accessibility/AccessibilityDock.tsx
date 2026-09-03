'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '@/lib/store/useStore';
import { 
  SunMedium, 
  Sparkles, 
  ChevronDown, 
  ChevronUp,
  X, 
  Sliders, 
  Check, 
  Eye,
  Minimize2,
  Maximize2
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

  // Distraction-free reading collapse mode
  const [isMinimized, setIsMinimized] = useState(false);
  const flyoutRef = useRef<HTMLDivElement>(null);

  // Close flyout on Escape key or outside click
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (isOpen && flyoutRef.current && !flyoutRef.current.contains(e.target as Node)) {
        const target = e.target as HTMLElement;
        if (!target.closest('[data-dock-toggle="true"]')) {
          setIsOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

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
          MINIMIZED PEBBLE: Distraction-free trigger in bottom corner
          ========================================================================= */}
      {isMinimized ? (
        <button
          onClick={() => setIsMinimized(false)}
          className="fixed bottom-5 right-5 z-40 px-3.5 py-2 bg-brand-surface/95 hover:bg-brand-surface backdrop-blur-md border border-brand-border rounded-full shadow-xl flex items-center gap-2 text-xs font-bold text-brand-text hover:text-brand-green transition-all hover:scale-105 active:scale-95"
          title="Restore reading accessibility controls"
          aria-label="Restore reading accessibility controls"
        >
          <span className="font-extrabold text-sm leading-none">Aa</span>
          <Sparkles className="w-3.5 h-3.5 text-brand-green" />
          <span className="text-[11px] font-semibold text-brand-muted hidden sm:inline">Ergonomics</span>
        </button>
      ) : (
        /* =========================================================================
            UNIFIED BOTTOM ERGONOMIC DOCK: Clean, non-intrusive, zero text overlap
            (Conforms to FRONTEND_DESIGN.md Section 1.2 & 6.4)
            ========================================================================= */
        <aside 
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 max-w-[calc(100vw-2rem)] select-none"
          aria-label="Reading Controls"
        >
          {/* Detailed Ergonomics Flyout Card (Opens Upwards Above the Dock) */}
          {isOpen && (
            <div 
              ref={flyoutRef}
              className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-brand-surface border border-brand-border rounded-3xl p-5 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 duration-200 z-50 space-y-4 max-h-[75vh] overflow-y-auto"
              role="dialog"
              aria-label="Reading Ergonomics Settings"
            >
              <div className="flex items-center justify-between pb-2 border-b border-brand-border">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-brand-green" />
                  <span className="text-xs font-bold text-brand-text">Reading Ergonomics</span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg text-brand-muted hover:text-brand-text hover:bg-brand-surface-elevated transition-colors"
                  aria-label="Close reading settings"
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
                        className={`flex-1 py-1 text-xs rounded-lg border font-semibold transition-colors ${
                          preferences.letterSpacing === space
                            ? 'border-brand-green bg-brand-green-muted text-brand-green font-bold'
                            : 'border-brand-border bg-brand-surface-elevated text-brand-muted hover:text-brand-text'
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
                        className={`flex-1 py-1 text-xs rounded-lg border font-semibold transition-colors ${
                          preferences.lineHeight === line
                            ? 'border-brand-green bg-brand-green-muted text-brand-green font-bold'
                            : 'border-brand-border bg-brand-surface-elevated text-brand-muted hover:text-brand-text'
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

          {/* Floating Pill Dock Bar */}
          <div className="bg-brand-surface border border-brand-border rounded-full px-2.5 sm:px-3.5 py-1.5 shadow-[0_10px_35px_rgba(0,0,0,0.14)] flex items-center gap-1 sm:gap-2 transition-all">
            {/* Font Quick Switch */}
            <button
              onClick={() => {
                const list: FontFamilyPreference[] = ['system', 'lexend', 'atkinson', 'opendyslexic'];
                const idx = list.indexOf(preferences.fontFamily);
                toggleFont(list[(idx + 1) % list.length]);
              }}
              className="touch-target px-2 sm:px-2.5 py-1 rounded-full text-xs font-bold text-brand-text hover:bg-brand-surface-elevated flex items-center gap-1.5 transition-colors"
              title={`Typeface: ${preferences.fontFamily} (Click to cycle)`}
              aria-label={`Cycle font. Current: ${preferences.fontFamily}`}
            >
              <span className="text-xs font-black leading-none">Aa</span>
              <span className="text-[10px] text-brand-muted font-medium capitalize hidden xs:inline">
                {preferences.fontFamily === 'system' ? 'Norm' : preferences.fontFamily.slice(0, 4)}
              </span>
            </button>

            {/* Bionic Reading Fixation Toggle */}
            <button
              onClick={toggleBionic}
              className={`touch-target px-2 sm:px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                preferences.bionicReading
                  ? 'bg-brand-green text-white font-bold shadow-xs'
                  : 'text-brand-muted hover:text-brand-text hover:bg-brand-surface-elevated'
              }`}
              title="Toggle Bionic Reading saccadic guides"
              aria-pressed={preferences.bionicReading}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-[10px] hidden sm:inline">Bionic</span>
            </button>

            {/* Theme Quick Cycle */}
            <button
              onClick={() => {
                const list: ContrastTheme[] = ['soft-cream', 'warm-peach', 'calming-sage', 'muted-slate', 'yellow-on-black'];
                const idx = list.indexOf(preferences.contrastTheme);
                toggleTheme(list[(idx + 1) % list.length]);
              }}
              className="touch-target px-2 py-1 rounded-full text-brand-muted hover:text-brand-text hover:bg-brand-surface-elevated flex items-center gap-1.5 transition-colors"
              title={`Theme: ${preferences.contrastTheme} (Click to cycle)`}
              aria-label={`Cycle theme. Current: ${preferences.contrastTheme}`}
            >
              <SunMedium className="w-3.5 h-3.5 text-brand-green" />
              <span 
                className="w-2 h-2 rounded-full border border-black/20 hidden sm:inline-block shrink-0" 
                style={{ backgroundColor: themes.find(t => t.id === preferences.contrastTheme)?.bg || '#F7F5F0' }}
              />
            </button>

            {/* Zero-Saccade RSVP Focal Reader Trigger */}
            <button
              onClick={() => {
                if (activeArticle) {
                  openFocalReader(activeArticle.content.rawMarkdown, 250);
                } else {
                  showToast('Please open any story first to launch the Focal Reader');
                  announce('Please open any story first to launch the Zero-Saccade Focal Reader.');
                }
              }}
              className={`touch-target px-2 py-1 rounded-full flex items-center gap-1 transition-colors ${
                activeArticle 
                  ? 'text-brand-muted hover:text-brand-green hover:bg-brand-surface-elevated' 
                  : 'text-brand-muted/40 cursor-not-allowed'
              }`}
              title={activeArticle ? "Launch Zero-Saccade Focal Reader" : "Open any story to launch Zero-Saccade Reader"}
              aria-label={activeArticle ? "Launch Zero-Saccade Focal Reader" : "Open any story to launch Zero-Saccade Reader"}
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="text-[10px] text-brand-muted hidden md:inline">Focal</span>
            </button>

            {/* Divider */}
            <div className="w-px h-3.5 bg-brand-border mx-0.5" />

            {/* Open / Close Detailed Ergonomics Settings */}
            <button
              data-dock-toggle="true"
              onClick={() => setIsOpen(!isOpen)}
              className={`touch-target p-1.5 rounded-full flex items-center justify-center transition-colors ${
                isOpen ? 'bg-brand-green text-white' : 'text-brand-muted hover:text-brand-text hover:bg-brand-surface-elevated'
              }`}
              title={isOpen ? 'Close reading settings' : 'Open reading ergonomics panel'}
              aria-expanded={isOpen}
            >
              {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <Sliders className="w-3.5 h-3.5" />}
            </button>

            {/* Minimize for full distraction-free reading */}
            <button
              onClick={() => {
                setIsOpen(false);
                setIsMinimized(true);
              }}
              className="touch-target p-1.5 rounded-full text-brand-muted hover:text-brand-text hover:bg-brand-surface-elevated transition-colors"
              title="Minimize toolbar for distraction-free reading"
              aria-label="Minimize reading toolbar"
            >
              <Minimize2 className="w-3 h-3" />
            </button>
          </div>
        </aside>
      )}
    </>
  );
}
