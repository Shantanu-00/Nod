'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store/useStore';
import { 
  SunMedium, 
  Sparkles, 
  ChevronUp, 
  ChevronDown 
} from 'lucide-react';
import { ContrastTheme, FontFamilyPreference } from '@/types';

export function AccessibilityDock() {
  const [isOpen, setIsOpen] = useState(false);
  const preferences = useStore((state) => state.readingPreferences);
  const setReadingPreferences = useStore((state) => state.setReadingPreferences);
  const announce = useStore((state) => state.announce);

  const themes: { id: ContrastTheme; label: string; bg: string; text: string }[] = [
    { id: 'soft-cream', label: 'Soft Cream', bg: '#F7F5F0', text: '#191B1F' },
    { id: 'warm-peach', label: 'Peach Tint', bg: '#FFF4EC', text: '#2B2320' },
    { id: 'calming-sage', label: 'Calm Sage', bg: '#F2F7F4', text: '#1B261E' },
    { id: 'muted-slate', label: 'Muted Slate', bg: '#16181F', text: '#E4E7EE' },
    { id: 'yellow-on-black', label: 'Yellow/Black', bg: '#0C0D10', text: '#FDE047' },
  ];

  const fonts: { id: FontFamilyPreference; label: string }[] = [
    { id: 'system', label: 'Modern (Default)' },
    { id: 'lexend', label: 'Lexend' },
    { id: 'atkinson', label: 'Atkinson' },
    { id: 'opendyslexic', label: 'OpenDyslexic' },
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
    <aside 
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30 max-w-sm w-[calc(100%-2rem)] select-none"
      aria-label="Reading Controls"
    >
      {/* Expanded Controls Drawer */}
      {isOpen && (
        <div className="mb-3 p-4 bg-brand-surface border border-brand-border rounded-2xl shadow-xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="space-y-4">
            {/* Typeface Selection */}
            <div>
              <div className="text-[11px] font-bold text-brand-muted uppercase tracking-wider mb-2">
                Accessible Typeface
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {fonts.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => toggleFont(f.id)}
                    className={`touch-target py-1.5 px-2 text-xs rounded-xl border font-medium transition-all ${
                      preferences.fontFamily === f.id
                        ? 'border-brand-green bg-brand-green-muted text-brand-green font-bold'
                        : 'border-brand-border bg-brand-surface-elevated text-brand-text hover:border-brand-green/40'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Contrast Palettes */}
            <div>
              <div className="text-[11px] font-bold text-brand-muted uppercase tracking-wider mb-2">
                Anti-Glare Contrast Tint
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => toggleTheme(t.id)}
                    className={`touch-target flex-1 py-1.5 px-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      preferences.contrastTheme === t.id
                        ? 'ring-2 ring-brand-green ring-offset-2 ring-offset-brand-surface scale-105 shadow-xs'
                        : 'border-brand-border opacity-85 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: t.bg, color: t.text }}
                  >
                    <span className="w-2 h-2 rounded-full border border-black/20 inline-block" style={{ backgroundColor: t.text }} />
                    <span className="whitespace-nowrap text-[10px]">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Letter & Line Spacing */}
            <div className="grid grid-cols-2 gap-3 pt-1 border-t border-brand-border">
              <div>
                <label className="text-[11px] font-bold text-brand-muted block mb-1">
                  Letter Spacing
                </label>
                <div className="flex gap-1">
                  {(['normal', 'wide', 'extra-wide'] as const).map((space) => (
                    <button
                      key={space}
                      onClick={() => setReadingPreferences({ letterSpacing: space })}
                      className={`flex-1 py-1 text-xs rounded-lg border ${
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
                      className={`flex-1 py-1 text-xs rounded-lg border ${
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
        </div>
      )}

      {/* Floating Pill Dock Bar */}
      <div className="bg-brand-surface/95 backdrop-blur-md border border-brand-border rounded-full px-3 py-1.5 shadow-[0_8px_25px_rgba(0,0,0,0.08)] flex items-center justify-between gap-2">
        {/* Font Quick Switch */}
        <button
          onClick={() => {
            const list: FontFamilyPreference[] = ['system', 'lexend', 'atkinson', 'opendyslexic'];
            const idx = list.indexOf(preferences.fontFamily);
            const next = list[(idx + 1) % list.length];
            toggleFont(next);
          }}
          className="touch-target px-3 py-1 rounded-full text-xs font-bold text-brand-text hover:bg-brand-surface-elevated flex items-center gap-1.5 transition-colors"
          title="Cycle font: Modern, Lexend, Atkinson, OpenDyslexic"
        >
          <span className="text-sm font-bold">Aa</span>
          <span className="capitalize text-brand-muted font-medium text-[11px] hidden sm:inline">
            {preferences.fontFamily}
          </span>
        </button>

        {/* Bionic Fixation Toggle */}
        <button
          onClick={toggleBionic}
          className={`touch-target px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-all ${
            preferences.bionicReading
              ? 'bg-brand-green text-white font-bold shadow-xs'
              : 'text-brand-muted hover:text-brand-text hover:bg-brand-surface-elevated'
          }`}
          title="Toggle Bionic Reading saccadic guides"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="text-[11px]">Bionic</span>
        </button>

        {/* Theme Quick Switcher */}
        <button
          onClick={() => {
            const list: ContrastTheme[] = ['soft-cream', 'warm-peach', 'calming-sage', 'muted-slate', 'yellow-on-black'];
            const idx = list.indexOf(preferences.contrastTheme);
            const next = list[(idx + 1) % list.length];
            toggleTheme(next);
          }}
          className="touch-target p-1.5 rounded-full text-brand-muted hover:text-brand-text hover:bg-brand-surface-elevated transition-colors"
          title="Cycle contrast theme"
        >
          <SunMedium className="w-4 h-4 text-brand-green" />
        </button>

        {/* Expand / Collapse Settings */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`touch-target p-1.5 rounded-full transition-colors ${
            isOpen ? 'bg-brand-green text-white' : 'text-brand-muted hover:text-brand-text hover:bg-brand-surface-elevated'
          }`}
          title={isOpen ? 'Close settings' : 'Open reading settings'}
          aria-expanded={isOpen}
        >
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
