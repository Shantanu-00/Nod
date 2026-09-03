'use client';

import React, { useEffect, useCallback, useRef, useState } from 'react';
import { useStore } from '@/lib/store/useStore';
import { splitWordOrp, calculateWordDelay } from '@/lib/utils/rsvp';
import { 
  Play, 
  Pause, 
  X, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Minus, 
  Eye, 
  Zap, 
  Palette,
  Timer
} from 'lucide-react';

type RsvpTheme = 'slate-mint' | 'cream-amber' | 'noir-yellow' | 'spritz-red';

const THEME_CONFIGS: Record<RsvpTheme, {
  name: string;
  modalBg: string;
  chamberBg: string;
  textColor: string;
  notchColor: string;
  orpColor: string;
  orpGlow: string;
  accentBg: string;
  borderSubtle: string;
  btnBg: string;
}> = {
  'slate-mint': {
    name: 'Calm Slate & Mint',
    modalBg: 'bg-slate-950 border-slate-800 text-slate-100',
    chamberBg: 'bg-slate-900 border-slate-700 shadow-inner',
    textColor: 'text-slate-100',
    notchColor: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]',
    orpColor: 'text-emerald-400',
    orpGlow: 'drop-shadow-[0_0_12px_rgba(52,211,153,0.7)]',
    accentBg: 'bg-emerald-500 hover:bg-emerald-600 text-white',
    borderSubtle: 'border-slate-800',
    btnBg: 'bg-slate-800 hover:bg-slate-700 text-slate-200',
  },
  'cream-amber': {
    name: 'Soft Cream & Amber',
    modalBg: 'bg-[#FBF8F1] border-[#E8DFC8] text-stone-900',
    chamberBg: 'bg-[#F4ECE1] border-[#DFD3BA] shadow-inner',
    textColor: 'text-stone-900',
    notchColor: 'bg-amber-600 shadow-[0_0_8px_rgba(217,119,6,0.6)]',
    orpColor: 'text-amber-600',
    orpGlow: 'drop-shadow-[0_0_10px_rgba(217,119,6,0.5)]',
    accentBg: 'bg-amber-600 hover:bg-amber-700 text-white',
    borderSubtle: 'border-[#E8DFC8]',
    btnBg: 'bg-[#EAE0CD] hover:bg-[#DDD1BC] text-stone-800',
  },
  'noir-yellow': {
    name: 'High-Contrast Noir',
    modalBg: 'bg-black border-yellow-500/30 text-yellow-300',
    chamberBg: 'bg-black border-yellow-500/40 shadow-inner',
    textColor: 'text-yellow-300',
    notchColor: 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)]',
    orpColor: 'text-cyan-400',
    orpGlow: 'drop-shadow-[0_0_12px_rgba(34,211,238,0.8)]',
    accentBg: 'bg-yellow-400 hover:bg-yellow-300 text-black font-black',
    borderSubtle: 'border-yellow-500/20',
    btnBg: 'bg-yellow-950/40 hover:bg-yellow-900/40 text-yellow-300 border border-yellow-500/30',
  },
  'spritz-red': {
    name: 'Classic Spritz',
    modalBg: 'bg-neutral-950 border-white/10 text-white',
    chamberBg: 'bg-black/80 border-white/10 shadow-inner',
    textColor: 'text-neutral-100',
    notchColor: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]',
    orpColor: 'text-red-500',
    orpGlow: 'drop-shadow-[0_0_12px_rgba(239,68,68,0.6)]',
    accentBg: 'bg-brand-green hover:bg-brand-green-hover text-white',
    borderSubtle: 'border-white/10',
    btnBg: 'bg-white/10 hover:bg-white/20 text-neutral-200',
  },
};

export function RsvpReader() {
  const isOpen = useStore((state) => state.focalReader.isOpen);
  const isPlaying = useStore((state) => state.focalReader.isPlaying);
  const words = useStore((state) => state.focalReader.words);
  const currentIndex = useStore((state) => state.focalReader.currentIndex);
  const wpm = useStore((state) => state.focalReader.wpm);
  
  const closeReader = useStore((state) => state.closeFocalReader);
  const playReader = useStore((state) => state.playFocalReader);
  const pauseReader = useStore((state) => state.pauseFocalReader);
  const setSpeed = useStore((state) => state.setFocalReaderSpeed);
  const setIndex = useStore((state) => state.setFocalReaderIndex);
  const stepIndex = useStore((state) => state.stepFocalReader);

  const [theme, setTheme] = useState<RsvpTheme>('slate-mint');
  const [countdown, setCountdown] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const activeTheme = THEME_CONFIGS[theme];
  const totalWords = words.length;
  const isComplete = totalWords > 0 && currentIndex >= totalWords - 1;
  const currentWord = words[currentIndex] || '';
  const { leftSegment, orpChar, rightSegment } = splitWordOrp(currentWord);

  const percent = totalWords > 0 
    ? Math.min(100, Math.round(((currentIndex + 1) / totalWords) * 100))
    : 0;

  // Responsive font sizing based on word length so NO words get truncated or show "..."
  const wordLength = currentWord.length;
  const wordFontSizeClass = wordLength > 14 
    ? 'text-xl sm:text-2xl md:text-3xl' 
    : wordLength > 10 
    ? 'text-2xl sm:text-4xl md:text-5xl' 
    : 'text-3xl sm:text-5xl md:text-6xl';

  // 3-2-1 Countdown Timer Handler
  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => (prev !== null && prev > 1 ? prev - 1 : null));
        if (countdown === 1) {
          playReader();
        }
      }, 550);
      return () => clearTimeout(timer);
    }
  }, [countdown, playReader]);

  const handleStartWithCountdown = () => {
    if (isComplete) {
      setIndex(0);
    }
    setCountdown(3);
  };

  const handleTogglePlay = () => {
    if (countdown !== null) {
      // If countdown is running, clicking skips directly to start
      setCountdown(null);
      playReader();
      return;
    }

    if (isPlaying) {
      pauseReader();
    } else {
      handleStartWithCountdown();
    }
  };

  // Precision Pacing & Punctuation Delay Engine
  useEffect(() => {
    if (!isOpen || !isPlaying || totalWords === 0 || countdown !== null) return;

    if (currentIndex >= totalWords) {
      pauseReader();
      return;
    }

    const delay = calculateWordDelay(words[currentIndex], wpm);

    const timer = setTimeout(() => {
      if (currentIndex < totalWords - 1) {
        setIndex(currentIndex + 1);
      } else {
        pauseReader();
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [isOpen, isPlaying, currentIndex, totalWords, words, wpm, pauseReader, setIndex, countdown]);

  // Keyboard Shortcuts Handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;

    // Prevent default scrolling for space and arrows when reader is open
    if (['Space', ' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
    }

    switch (e.key) {
      case ' ':
      case 'Space':
        handleTogglePlay();
        break;
      case 'Escape':
        setCountdown(null);
        closeReader();
        break;
      case 'ArrowUp':
        setSpeed(wpm + 25);
        break;
      case 'ArrowDown':
        setSpeed(Math.max(50, wpm - 25));
        break;
      case 'ArrowLeft':
        stepIndex(-10);
        break;
      case 'ArrowRight':
        stepIndex(10);
        break;
      default:
        break;
    }
  }, [isOpen, isPlaying, countdown, handleTogglePlay, closeReader, setSpeed, stepIndex, wpm]);

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const handleRestart = () => {
    setIndex(0);
    handleStartWithCountdown();
  };

  const cycleTheme = () => {
    const themes: RsvpTheme[] = ['slate-mint', 'cream-amber', 'noir-yellow', 'spritz-red'];
    const nextIdx = (themes.indexOf(theme) + 1) % themes.length;
    setTheme(themes[nextIdx]);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none"
      role="dialog"
      aria-modal="true"
      aria-label="Zero-Saccade RSVP Focal Reader"
    >
      {/* Background click to dismiss */}
      <div 
        className="fixed inset-0 cursor-pointer"
        onClick={() => {
          setCountdown(null);
          closeReader();
        }}
        title="Click outside to exit reader"
      />

      {/* Main Reader Stage */}
      <div 
        ref={containerRef}
        className={`relative w-full max-w-2xl border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 z-10 overflow-hidden transition-colors duration-200 ${activeTheme.modalBg}`}
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Top Header Bar */}
        <div className={`flex items-center justify-between border-b pb-4 ${activeTheme.borderSubtle}`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeTheme.btnBg}`}>
              <Eye className="w-4 h-4 text-inherit" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight">
                  Zero-Saccade Focal Reader
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-current/10 border border-current/20">
                  Fixed ORP
                </span>
              </div>
              <p className="text-xs opacity-75">
                Fixed-gaze optical anchor to eliminate saccadic eye fatigue
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Switcher Button */}
            <button
              onClick={cycleTheme}
              className={`touch-target px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors ${activeTheme.btnBg}`}
              title="Cycle color themes (Slate, Cream, Noir, Spritz)"
              aria-label={`Current theme: ${activeTheme.name}. Click to change.`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{activeTheme.name}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={() => {
                setCountdown(null);
                closeReader();
              }}
              className={`touch-target p-2 rounded-full opacity-70 hover:opacity-100 transition-opacity ${activeTheme.btnBg}`}
              aria-label="Close reader (Esc)"
              title="Close reader (Escape)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Optical Presentation Chamber */}
        <div className={`relative rounded-2xl border p-6 sm:p-10 flex flex-col items-center justify-center min-h-[190px] shadow-inner overflow-hidden ${activeTheme.chamberBg}`}>
          {/* Subtle horizontal alignment guide line */}
          <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-[1px] bg-current opacity-10 pointer-events-none" />

          {/* Center Vertical Crosshair / Optical Alignment Notches */}
          <div className="absolute left-1/2 top-4 -translate-x-1/2 flex flex-col items-center pointer-events-none">
            <div className={`w-0.5 h-3 rounded-full ${activeTheme.notchColor}`} />
          </div>
          <div className="absolute left-1/2 bottom-4 -translate-x-1/2 flex flex-col items-center pointer-events-none">
            <div className={`w-0.5 h-3 rounded-full ${activeTheme.notchColor}`} />
          </div>

          {totalWords === 0 ? (
            <div className="opacity-60 text-sm font-medium">
              No article text loaded.
            </div>
          ) : countdown !== null ? (
            /* Optical 3-2-1 Countdown Stage */
            <div className="flex flex-col items-center justify-center h-24 select-none animate-in zoom-in-75 duration-200">
              <div className="font-mono text-5xl sm:text-7xl font-black text-center" style={{ textShadow: '0 0 20px currentColor' }}>
                {countdown}
              </div>
              <span className="text-xs font-mono opacity-60 mt-1 flex items-center gap-1">
                <Timer className="w-3 h-3" />
                <span>Anchor your gaze on the notch</span>
              </span>
            </div>
          ) : (
            /* Word Display: Monospace tabular width to guarantee pixel-stable focal alignment */
            <div 
              className={`w-full flex items-center justify-center font-mono ${wordFontSizeClass} font-bold tracking-normal h-24 select-none relative ${activeTheme.textColor}`}
              aria-live="off"
            >
              {/* Left segment (Right-aligned, leading directly into the ORP letter - NO TRUNCATION) */}
              <div className="flex-1 text-right whitespace-nowrap overflow-visible pr-[0.05ch]">
                {leftSegment}
              </div>

              {/* Central ORP Character (Fixed width, laser-centered on crosshairs) */}
              <div className={`w-[1.2ch] text-center font-black relative flex items-center justify-center shrink-0 ${activeTheme.orpColor}`}>
                <span className={`relative z-10 ${activeTheme.orpGlow}`}>
                  {orpChar}
                </span>
              </div>

              {/* Right segment (Left-aligned, flowing directly out of the ORP letter - NO TRUNCATION) */}
              <div className="flex-1 text-left whitespace-nowrap overflow-visible pl-[0.05ch]">
                {rightSegment}
              </div>
            </div>
          )}
        </div>

        {/* Interactive Scrubber & Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs opacity-75 font-mono">
            <span>
              Word <strong className="opacity-100 font-bold">{Math.min(currentIndex + 1, totalWords)}</strong> of <strong className="opacity-100 font-bold">{totalWords}</strong>
            </span>
            <span className="font-bold">
              {percent}% Completed
            </span>
          </div>

          {/* Interactive Scrubbing Slider */}
          <div className="relative flex items-center">
            <input
              type="range"
              min={0}
              max={Math.max(0, totalWords - 1)}
              value={currentIndex}
              onChange={(e) => setIndex(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-black/20 dark:bg-white/20 rounded-lg appearance-none cursor-pointer accent-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/40"
              aria-label="Seek position in article"
            />
          </div>
        </div>

        {/* Primary Controls & Speed Adjustment */}
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t ${activeTheme.borderSubtle}`}>
          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
            {/* Step Back 10 */}
            <button
              onClick={() => stepIndex(-10)}
              disabled={currentIndex <= 0}
              className={`touch-target p-2.5 rounded-full disabled:opacity-30 disabled:pointer-events-none transition-colors ${activeTheme.btnBg}`}
              title="Jump back 10 words (←)"
              aria-label="Jump back 10 words"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Play / Pause / Countdown Toggle Button */}
            <button
              onClick={isComplete ? handleRestart : handleTogglePlay}
              className={`touch-target px-6 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 shadow-lg active:scale-95 transition-all ${activeTheme.accentBg}`}
              aria-label={isComplete ? 'Restart playback' : isPlaying ? 'Pause reading (Space)' : 'Start reading with countdown (Space)'}
              title="Spacebar to toggle"
            >
              {isComplete ? (
                <>
                  <RotateCcw className="w-4 h-4" />
                  <span>Replay</span>
                </>
              ) : countdown !== null ? (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Starting in {countdown}...</span>
                </>
              ) : isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start (3-2-1)</span>
                </>
              )}
            </button>

            {/* Step Forward 10 */}
            <button
              onClick={() => stepIndex(10)}
              disabled={currentIndex >= totalWords - 1}
              className={`touch-target p-2.5 rounded-full disabled:opacity-30 disabled:pointer-events-none transition-colors ${activeTheme.btnBg}`}
              title="Jump forward 10 words (→)"
              aria-label="Jump forward 10 words"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Restart from beginning */}
            <button
              onClick={handleRestart}
              className={`touch-target p-2.5 rounded-full transition-colors ${activeTheme.btnBg}`}
              title="Restart from beginning"
              aria-label="Restart from beginning"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Speed (WPM) Controls */}
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 border rounded-full px-3 py-1 ${activeTheme.btnBg} ${activeTheme.borderSubtle}`}>
              <button
                onClick={() => setSpeed(Math.max(50, wpm - 25))}
                className="touch-target p-1 rounded-full opacity-70 hover:opacity-100 transition-opacity"
                title="Decrease speed by 25 WPM (↓)"
                aria-label="Decrease reading speed"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-1 px-2 font-mono text-xs font-bold min-w-[75px] justify-center">
                <Zap className="w-3.5 h-3.5 text-brand-green" />
                <span>{wpm} WPM</span>
              </div>

              <button
                onClick={() => setSpeed(Math.min(1000, wpm + 25))}
                className="touch-target p-1 rounded-full opacity-70 hover:opacity-100 transition-opacity"
                title="Increase speed by 25 WPM (↑)"
                aria-label="Increase reading speed"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Speed Presets */}
            <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono">
              {[200, 250, 325, 400].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setSpeed(preset)}
                  className={`px-2 py-1 rounded-md border transition-colors ${
                    wpm === preset
                      ? 'bg-brand-green text-white font-bold border-brand-green'
                      : `${activeTheme.btnBg} ${activeTheme.borderSubtle} opacity-70 hover:opacity-100`
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Keyboard Legend Footer */}
        <div className={`flex flex-wrap items-center justify-between gap-2 pt-3 border-t text-[11px] opacity-75 font-mono ${activeTheme.borderSubtle}`}>
          <div className="flex items-center gap-4">
            <span><kbd className="px-1.5 py-0.5 bg-current/10 rounded">Space</kbd> Start/Pause</span>
            <span><kbd className="px-1.5 py-0.5 bg-current/10 rounded">↑/↓</kbd> ±25 WPM</span>
            <span><kbd className="px-1.5 py-0.5 bg-current/10 rounded">←/→</kbd> ±10 Words</span>
            <span><kbd className="px-1.5 py-0.5 bg-current/10 rounded">Esc</kbd> Exit</span>
          </div>
          <span className="hidden md:inline">
            Automatic punctuation delays applied
          </span>
        </div>
      </div>
    </div>
  );
}
